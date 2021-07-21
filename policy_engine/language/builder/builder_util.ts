import { LogicalOr } from '../model/policy/rule/expression/filter/logical_filter/or';
import { LogicalAnd } from '../model/policy/rule/expression/filter/logical_filter/and';
import { FilterExpression } from '../model/policy/rule/expression/filter/filter_expression';
import { VariableReference } from '../model/policy/rule/expression/filter/single_filter/variable_reference';
import { RuleCall } from '../model/policy/rule/expression/filter/single_filter/rule_call';
import { ExpressionInitalization } from '../model/policy/rule/expression/variable_init/expression_variable_init';
import { ScopeFilter } from '../model/policy/rule/expression/filter/single_filter/scope_filter';
import { ClientFilter } from '../model/policy/rule/expression/filter/single_filter/client_filter';
import { TimeFilter } from '../model/policy/rule/expression/filter/single_filter/time_filter';
import { timeFilterType } from '../model/policy/rule/expression/filter/single_filter/time_filter_type';
import { DayFilter } from '../model/policy/rule/expression/filter/single_filter/day_filter';
import { LogicalNot } from '../model/policy/rule/expression/filter/logical_filter/not';
import { ExpressionBase } from '../model/policy/rule/expression/expression_base';
import { logger } from './rule_builder';
import { ParsedPolicy } from '../parser/parsed_policy';
import { Policy } from '../model/policy/policy';
import { PolicyBuilder } from './policy_builder';
import { RuleCallWithAlias } from '../model/policy/rule/expression/filter/single_filter/rule_call_with_alias';
import { BooleanConst } from '../model/policy/rule/expression/filter/single_filter/boolean_const';


import { clone, isEmpty } from "lodash";
import { BuilderException } from '../../common/exceptions/builder_exception';


export function buildPolicy(parsedPolicy: ParsedPolicy): Policy {
    const builder = new PolicyBuilder().addName(parsedPolicy.name);
    for (let i = 0; i < parsedPolicy.treeSize(); i++) {
        const policyElement = parsedPolicy.at(i);
        if (policyElement.type === 'FILE_RULE') {
            builder.addFileRule(policyElement);
        }
        else if (policyElement.type === 'BOOLEAN_RULE' || policyElement.type === 'RULE'
            || policyElement.type === 'ROLE_RULE') {
            builder.addDecisionRule(policyElement);
        }
        else if (policyElement.type === 'IMPORT') {
            builder.addImport(policyElement);
        }
    }
    return builder.build();
}


export function handleRule(parsedScope: any): Array<ExpressionBase> {
    const result = new Array<ExpressionBase>();
    for (let i = 0; i < parsedScope.length; i++) {
        const currentCommand = parsedScope[i];
        if (currentCommand.type === 'NOT') {
            const notExpr = <FilterExpression>buildExpression(currentCommand.expression);
            result.push(new LogicalNot(notExpr));
        }
        else {
            result.push(buildExpression(currentCommand));
        }
    }
    return result;
}


export function handleRoleRule(parsedScope: any): Array<ExpressionBase> {
    const roleScopes = new Array<ScopeFilter>();
    const roleClientIds = new Array<ClientFilter>();
    for (const command of parsedScope) {
        switch (command.type) {
            case 'SCOPE_LIST': {
                for (const roleScope of command.scopes) {
                    roleScopes.push(new ScopeFilter(clone(roleScope)));
                }
                break;
            }
            case 'CLIENT_LIST': {
                for (const roleClient of command.clients) {
                    roleClientIds.push(new ClientFilter(clone(roleClient)));
                }
                break;
            }
            default: { // should be prevented by the parser
                throw new BuilderException(`invalid command type: ${command.type}`)
            }
        }
    }
    const result = new Array<ExpressionBase>();
    if (!isEmpty(roleClientIds)) {
        result.push(new LogicalOr(roleClientIds));
    }
    if (!isEmpty(roleScopes)) {
        result.push(new LogicalOr(roleScopes))
    }
    return result;
}


function buildExpression(command: any): ExpressionBase {
    switch (command.type) {
        case 'VAR_INIT_EXPRESSION': {
            const expression = command.expression.type === 'LOGICAL_CHAIN' ?
                command.expression.expressions : command.expression;
            const logicalExpression = buildFilterExpression(expression);
            return new ExpressionInitalization(command.varName, logicalExpression);
        }
        default: {
            return buildFilterExpression(command);
        }
    }
}


function buildFilterExpression(expression: any): FilterExpression {
    if (expression.type === 'OR') {
        return buildOr(expression);
    }
    else if (expression.type === 'AND') {
        return buildAnd(expression);
    }
    else if (expression.type === 'VARIABLE_REF') {
        return new VariableReference(expression.name);
    }
    else if (expression.type === 'RULE_CALL') {
        return new RuleCall(expression.ruleName);
    }
    else if (expression.type === 'RULE_CALL_WITH_ALIAS') {
        return new RuleCallWithAlias(expression.ruleName, expression.importAlias);
    }
    else if (expression.type === 'TIME_FILTER') {
        const operator = buildTimeFilterType(expression.operator);
        const hour = parseInt(expression.time.hours);
        const minute = parseInt(expression.time.minutes);
        return new TimeFilter(hour, minute, operator);
    }
    else if (expression.type === 'DAY_FILTER') {
        return new DayFilter(expression.day);
    }
    else if (expression.type === 'SCOPE_FILTER') {
        return new ScopeFilter(expression.scope);
    }
    else if (expression.type === 'CLIENT_FILTER') {
        return new ClientFilter(expression.clientID);
    }
    else if (expression.type === 'BOOLEAN_CONST') {
        return new BooleanConst(expression.value === 'true');
    }
    else if (expression.type === 'NOT') {
        return new LogicalNot(buildFilterExpression(expression.expression));
    }

    logger.error(`invalid command type ${expression.type}`);
    throw new Error(`invalid command type ${expression.type}`);
}


function buildOr(parsedOr: any): LogicalOr {
    const or = new LogicalOr(handleExpressionArray(parsedOr.expressions));
    return or;
}


function buildAnd(parsedAnd: any): LogicalAnd {
    const and = new LogicalAnd(handleExpressionArray(parsedAnd.expressions));
    return and;
}


function handleExpressionArray(expressions: any[]): FilterExpression[] {
    const result = new Array<FilterExpression>();
    for (let i = 0; i < expressions.length; i++) {
        const current = expressions[i];
        if (current.type === 'NOT') {
            result.push(new LogicalNot(buildFilterExpression(current.expression)));
        }
        else {
            result.push(buildFilterExpression(current));
        }
    }
    return result;
}


function buildTimeFilterType(type: string): timeFilterType {
    switch (type) {
        case 'LOWER': {
            return timeFilterType.LOWER;
        }
        case 'LOWER_EQUAL': {
            return timeFilterType.LOWER_EQUAL;
        }
        case 'GREATER': {
            return timeFilterType.GREATER;
        }
        case 'GREATER_EQUAL': {
            return timeFilterType.GREATER_EQUAL;
        }
        case 'EQUAL': {
            return timeFilterType.EQUAL;
        }
    }
}
