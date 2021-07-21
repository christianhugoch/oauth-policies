import { VariableReference } from '../../model/policy/rule/expression/filter/single_filter/variable_reference';
import { LogicalAnd } from '../../model/policy/rule/expression/filter/logical_filter/and';
import { LogicalOr } from '../../model/policy/rule/expression/filter/logical_filter/or';
import { RuleCall } from '../../model/policy/rule/expression/filter/single_filter/rule_call';
import { LogicalNot } from '../../model/policy/rule/expression/filter/logical_filter/not';
import { ScopeFilter } from '../../model/policy/rule/expression/filter/single_filter/scope_filter';
import { ClientFilter } from '../../model/policy/rule/expression/filter/single_filter/client_filter';
import { TimeFilter } from '../../model/policy/rule/expression/filter/single_filter/time_filter';
import { DayFilter } from '../../model/policy/rule/expression/filter/single_filter/day_filter';
import { BooleanConst } from '../../model/policy/rule/expression/filter/single_filter/boolean_const';


export abstract class AbstractVisitor {
    abstract visitRef(comp: VariableReference): void;
    abstract visitAnd(comp: LogicalAnd): void;
    abstract visitOr(comp: LogicalOr): void;
    abstract visitRuleCall(comp: RuleCall): void;
    abstract visitNot(comp: LogicalNot): void;
    abstract visitScopeFilter(comp: ScopeFilter): void;
    abstract visitClientFilter(comp: ClientFilter): void;
    abstract visitTimeFilter(comp: TimeFilter): void;
    abstract visitDayFilter(comp: DayFilter): void;
    abstract visitBooleanConst(comp: BooleanConst): void;
}
