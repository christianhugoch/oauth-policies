import { AbstractVisitor } from './abstract_visitor';
import { VariableReference } from '../../model/policy/rule/expression/filter/single_filter/variable_reference';
import { LogicalAnd } from '../../model/policy/rule/expression/filter/logical_filter/and';
import { LogicalOr } from '../../model/policy/rule/expression/filter/logical_filter/or';
import { RuleCall } from '../../model/policy/rule/expression/filter/single_filter/rule_call';
import { LogicalNot } from '../../model/policy/rule/expression/filter/logical_filter/not';
import { ExecutionContext } from '../decision_context';
import { checkMainScope, checkRemainingScopes, checkClient, checkPreviouslyGrantedScopes } from '../decision_util';
import { execute, checkVariableRef, checkTimeFilter, checkDayFilter } from '../decision_util';
import { ScopeFilter } from '../../model/policy/rule/expression/filter/single_filter/scope_filter';
import { ClientFilter } from '../../model/policy/rule/expression/filter/single_filter/client_filter';
import { TimeFilter } from '../../model/policy/rule/expression/filter/single_filter/time_filter';
import { DayFilter } from '../../model/policy/rule/expression/filter/single_filter/day_filter';
import { FilterExpression } from '../../model/policy/rule/expression/filter/filter_expression';
import { getLogger } from '../../../common/logger/logger_util';
import { genericPlainToClass } from '../../model/type_helper/type_mappings'
import { BooleanConst } from '../../model/policy/rule/expression/filter/single_filter/boolean_const';


const logger = getLogger();


enum Mode {
    NOT_SET, AND_MODE, OR_MODE, NOT_NODE
}


export class ExpressionEvaluator extends AbstractVisitor {
    result: boolean;
    ctx: ExecutionContext;
    mainScopeMatched: boolean = undefined;
    mode: Mode = Mode.NOT_SET;


    constructor(ctx: ExecutionContext) {
        super();
        this.ctx = ctx;
    }


    exec(expression: FilterExpression): boolean {
        if (expression instanceof LogicalAnd) {
            return this.execAnd(expression);
        }
        else if (expression instanceof LogicalOr) {
            return this.execOr(expression);
        }
        else {
            logger.error('not supported type');
            throw new Error();
        }
    }


    execOr(expression: LogicalOr): boolean {
        this.visitOr(expression);
        return this.result;
    }


    execAnd(expression: LogicalAnd): boolean {
        this.visitAnd(expression);
        return this.result;
    }


    visitRef(comp: VariableReference): void {
        this.result = checkVariableRef(comp, this.ctx);
    }


    visitScopeFilter(comp: ScopeFilter): void {
        this.result = checkMainScope(comp, this.ctx);
        if (this.mode === Mode.AND_MODE) {
            if (this.mainScopeMatched === undefined || this.result) {
                this.mainScopeMatched = this.result;
            }
            if (!this.result) {
                const remainingScopesMatched = checkRemainingScopes(comp, this.ctx);
                const previouslyGrantedScopesMatched = checkPreviouslyGrantedScopes(comp, this.ctx);
                this.result = remainingScopesMatched || previouslyGrantedScopesMatched;
            }
        }
        else if (this.mode === Mode.NOT_NODE && !this.result) {
            const remainingScopesMatched = checkRemainingScopes(comp, this.ctx);
            const previouslyGrantedScopesMatched = checkPreviouslyGrantedScopes(comp, this.ctx);
            this.result = remainingScopesMatched || previouslyGrantedScopesMatched;
        }
    }


    visitClientFilter(comp: ClientFilter): void {
        this.result = checkClient(comp, this.ctx);
    }


    visitTimeFilter(comp: TimeFilter): void {
        this.result = checkTimeFilter(comp);
    }


    visitDayFilter(comp: DayFilter): void {
        this.result = checkDayFilter(comp);
    }


    visitRuleCall(comp: RuleCall): void {
        const rule = this.ctx.currentPolicy().getDecisionRule(comp.ruleName);
        this.ctx.pushRule([this.ctx.currentPolicy(), rule]);
        this.result = execute(this.ctx);
        this.ctx.popRule();
    }


    visitBooleanConst(comp: BooleanConst): void {
        this.result = comp.value;
    }
    

    visitAnd(comp: LogicalAnd): void {
        this.mode = Mode.AND_MODE;
        let temp = undefined;
        for (const current of comp.components) {
            genericPlainToClass(current).accept(this);
            if (temp === undefined) {
                temp = this.result;
            }
            else {
                temp = temp && this.result;
            }
        }
        this.result = temp && (this.mainScopeMatched === undefined || this.mainScopeMatched);
        this.mainScopeMatched = undefined;
    }


    visitOr(comp: LogicalOr): void {
        this.mode = Mode.OR_MODE;
        for (const current of comp.components) {
            genericPlainToClass(current).accept(this);
            if (this.result) {
                return;
            }
        }
    }


    visitNot(comp: LogicalNot): void {
        this.mode = Mode.NOT_NODE;
        genericPlainToClass(comp.component).accept(this);        
        this.result = !this.result;
    }
}
