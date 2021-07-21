import { Rule } from '../model/policy/rule/rule';
import { Policy } from '../model/policy/policy';
import { ImmediateInitalization } from '../model/policy/rule/expression/variable_init/immediate_variable_init';
import { ExpressionInitalization } from '../model/policy/rule/expression/variable_init/expression_variable_init';
import { VariableReference } from '../model/policy/rule/expression/filter/single_filter/variable_reference';
import { BooleanVariable } from '../model/policy/rule/boolean_variable';
import { FilterExpression } from '../model/policy/rule/expression/filter/filter_expression';
import { LogicalAnd } from '../model/policy/rule/expression/filter/logical_filter/and';
import { ExecutionContext } from './decision_context';
import { ExpressionEvaluator } from './chained_execution/expression_evaluator';
import { RuleType } from '../model/policy/rule/rule_type';
import { RuleCall } from '../model/policy/rule/expression/filter/single_filter/rule_call';
import { LogicalOr } from '../model/policy/rule/expression/filter/logical_filter/or';
import { ScopeFilter } from '../model/policy/rule/expression/filter/single_filter/scope_filter';
import { ClientFilter } from '../model/policy/rule/expression/filter/single_filter/client_filter';
import { LogicalNot } from '../model/policy/rule/expression/filter/logical_filter/not';
import { DayFilter } from '../model/policy/rule/expression/filter/single_filter/day_filter';
import { TimeFilter } from '../model/policy/rule/expression/filter/single_filter/time_filter';
import { timeFilterType } from '../model/policy/rule/expression/filter/single_filter/time_filter_type';
import { RuleCallWithAlias } from '../model/policy/rule/expression/filter/single_filter/rule_call_with_alias';
import { Import } from '../model/policy/rule/expression/import/import_expression';
import { StackElement } from './execution_stack';
import { VariableInitalization } from '../model/policy/rule/expression/variable_init/variable_initalization';
import { BooleanConst } from '../model/policy/rule/expression/filter/single_filter/boolean_const';
import { ExecutionException } from '../../common/exceptions/execution_exception';
import { typeFrom } from '../model/type_helper/type_mappings';
import { getLogger } from '../../common/logger/logger_util';

import moment from 'moment';

const logger = getLogger();


export function execute(ctx: ExecutionContext): boolean {
    const rule = ctx.currentRule();
    logger.debug(`Executing rule ${rule.name}`);
    const expressions = rule.scope.expressions;
    if (expressions.length === 0) {
        const errorMessage = `'${ctx.currentRule().name}' must have at least one expression.`;
        logger.error(errorMessage)
        throw new ExecutionException(errorMessage);
    }
    let ruleHasChecks = false;
    for (const current of expressions) {
        if (current instanceof VariableInitalization) {
            handleVariableInitialization(current, ctx);
        }
        else if (current instanceof FilterExpression) {
            ruleHasChecks = true;
            const checkResult = handleFilterExpression(current, ctx);
            if (!checkResult) {
                return checkResult;
            }
        }
    }
    if (!ruleHasChecks) {
        const errorMessage = `'${ctx.currentRule().name}' must have at least one check.`;
        logger.error(errorMessage);
        throw new ExecutionException(errorMessage);
    }
    return rule.successValue() &&
        (ctx.currentScopeWasMatched || ctx.currentScopeWasMatched === null);
}


function handleVariableInitialization(current: VariableInitalization, ctx: ExecutionContext) {
    const rule = ctx.currentRule();
    if (current instanceof ImmediateInitalization) {
        rule.scope.setVar(new BooleanVariable(current.varName, current.value));
        logger.debug(`ImmediateInitalization of: '${current.varName}' with value: ${current.value}`);
    }
    else if (current instanceof ExpressionInitalization) {
        const result = doFilterCheck(typeFrom(current.expression), ctx, false, false);
        if (result !== undefined) {
            rule.scope.setVar(new BooleanVariable(current.varName, result));
            logger.debug(`ExpressionInitalization of: '${current.varName}' with value: ${result}`)
        }
    }
}


function handleFilterExpression(current: FilterExpression, ctx: ExecutionContext): boolean {
    const rule = ctx.currentRule();
    if (current instanceof LogicalNot) {
        const expression = current.component.constructor.name === 'LogicalExpression' ? typeFrom(current.component) : current.component;
        if (doFilterCheck(expression, ctx, true, false)) {
            if (rule.type === RuleType.PERMIT || rule.type === RuleType.DENY) {
                logger.debug(`${rule.name} has no effect`);
                return undefined;
            }
            logger.debug(`${rule.name} returns false`);
            return false;
        }
    }
    else {
        if (!doFilterCheck(current, ctx, true, true)) {
            if (rule.type === RuleType.PERMIT || rule.type === RuleType.DENY) {
                logger.debug(`${rule.name} has no effect`);
                return undefined;
            }
            logger.debug(`${rule.name} returns false`);
            return false;
        }
    }
    return true;
}


function doFilterCheck(
    expression: FilterExpression, ctx: ExecutionContext,
    doCheckPreviouslyGranted: boolean, doCheckRemainingScopes: boolean,
): boolean {
    if (expression instanceof VariableReference) {
        return checkVariableRef(expression, ctx);
    }
    else if (expression instanceof LogicalAnd || expression instanceof LogicalOr) {
        return new ExpressionEvaluator(ctx).exec(expression);
    }
    else if (expression instanceof ScopeFilter) {
        return doCheckScope(expression, ctx,
            doCheckPreviouslyGranted, doCheckRemainingScopes);
    }
    else if (expression instanceof ClientFilter) {
        return checkClient(expression, ctx);
    }
    else if (expression instanceof TimeFilter) {
        return checkTimeFilter(expression);
    }
    else if (expression instanceof DayFilter) {
        return checkDayFilter(expression);
    }
    else if (expression instanceof RuleCall) {
        return doRuleCall(getNextStackElement(expression, ctx), ctx);
    }
    else if (expression instanceof BooleanConst) {
        return expression.value;
    }
    logger.error('Check type is not supported ');
    throw new Error();
}


function doCheckScope(
    expression: ScopeFilter, ctx: ExecutionContext,
    doCheckPreviouslyGranted: boolean, doCheckRemainingScopes: boolean,
): boolean {
    const result = checkMainScope(expression, ctx);
    if (!doCheckPreviouslyGranted && !doCheckRemainingScopes) {
        return result;
    }
    if (doCheckRemainingScopes) {
        if (ctx.currentScopeWasMatched === null) {
            ctx.currentScopeWasMatched = result;
        }
        else if (doCheckRemainingScopes && result) {
            ctx.currentScopeWasMatched = true;
        }
    }
    return result ||
        doCheckRemainingScopes && checkRemainingScopes(expression, ctx) ||
        doCheckPreviouslyGranted && checkPreviouslyGrantedScopes(expression, ctx);
}


function doRuleCall(nextStackElement: StackElement, ctx: ExecutionContext): boolean {
    const oldWasMatched = ctx.currentScopeWasMatched;
    ctx.currentScopeWasMatched = null;
    ctx.pushRule(nextStackElement);
    const result = execute(ctx);
    ctx.popRule();
    ctx.currentScopeWasMatched = oldWasMatched;
    return result;
}


function getNextStackElement(ruleCall: RuleCall, ctx: ExecutionContext): StackElement {
    if (ruleCall instanceof RuleCallWithAlias) {
        return getRuleByAlias(ruleCall.ruleName, ruleCall.importAlias, ctx);
    }
    else {
        const nextRule = findRule(ctx.currentPolicy(), ruleCall.ruleName);
        if (nextRule === undefined) {
            const errorMessage = `Unable to call '${ruleCall.ruleName}'. The rule does not exist.`;
            logger.error(errorMessage);
            throw new ExecutionException(errorMessage);
        }
        return [ctx.currentPolicy(), nextRule];
    }
}


export function checkVariableRef(comp: VariableReference, ctx: ExecutionContext): boolean {
    const vari = ctx.currentRule().scope.getVar(comp.variableName);
    logger.debug(`check variableRef: '${comp.variableName}' returns '${vari}'`);
    return vari;
}


export function checkMainScope(comp: ScopeFilter, ctx: ExecutionContext): boolean {
    const res = comp.scope === ctx.currentScope;
    logger.debug(`check scope: '${comp.scope}' returns: '${res}'`);
    return res;
}


function checkScopesArray(filterScope: string, scopeArray: Array<string>): boolean {
    return scopeArray.some(scope => filterScope === scope);
}


export function checkRemainingScopes(comp: ScopeFilter, ctx: ExecutionContext): boolean {
    return checkScopesArray(comp.scope, ctx.remainingScopes);
}


export function checkPreviouslyGrantedScopes(comp: ScopeFilter, ctx: ExecutionContext): boolean {
    return checkScopesArray(comp.scope, ctx.previouslyGrantedScopes);
}


export function checkClient(comp: ClientFilter, ctx: ExecutionContext): boolean {
    const res = comp.clientID === ctx.clientId;
    logger.debug(`check client: '${comp.clientID}' returns: '${res}'`);
    return res;
}


export function checkDayFilter(comp: DayFilter): boolean {
    const res = moment().day(comp.day).day() === moment().day();
    logger.debug(`check dayFilter: '${comp.day}' returns: '${res}'`);
    return res;
}


export function checkTimeFilter(comp: TimeFilter): boolean {
    const filterTime = moment().hour(comp.hour).minute(comp.minute);
    let result = undefined;
    switch (comp.type) {
        case timeFilterType.EQUAL: {
            result = moment().isSame(filterTime, 'seconds');
            break;
        }
        case timeFilterType.GREATER: {
            result = moment().isAfter(filterTime, 'seconds');
            break;
        }
        case timeFilterType.GREATER_EQUAL: {
            result = moment().isSameOrAfter(filterTime, 'seconds');
            break;
        }
        case timeFilterType.LOWER: {
            result = moment().isBefore(filterTime, 'seconds');
            break;
        }
        case timeFilterType.LOWER_EQUAL: {
            result = moment().isSameOrBefore(filterTime, 'seconds');
            break;
        }
        default: {
            logger.error('filter type not supported')
            throw new Error();
        }
    }
    logger.debug(`check timeFilter: '${JSON.stringify(comp)}' returns: '${result}'`);
    return result;
}


function findRule(policy: Policy, ruleName: string): Rule {
    return policy.decisionRules.find(rule => rule.name === ruleName);
}


function findPolicy(policyName: string, policies: Array<Policy>): Policy {
    return policies.find(policy => policy.name === policyName);
}


function findImport(policy: Policy, alias: string): Import {
    return policy.imports.find(current => current.alias === alias);
}


function getRuleByAlias(ruleName: string, alias: string, ctx: ExecutionContext): StackElement {
    const importCmd = findImport(ctx.currentPolicy(), alias);
    const importedPolicy = findPolicy(importCmd.policyName, ctx.policies);
    return [importedPolicy, findRule(importedPolicy, ruleName)];
}
