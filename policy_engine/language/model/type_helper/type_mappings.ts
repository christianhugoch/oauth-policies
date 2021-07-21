import { LogicalAnd } from '../policy/rule/expression/filter/logical_filter/and';
import { LogicalOr } from '../policy/rule/expression/filter/logical_filter/or';
import { LogicalNot } from '../policy/rule/expression/filter/logical_filter/not';
import { ScopeFilter } from '../policy/rule/expression/filter/single_filter/scope_filter';
import { ClientFilter } from '../policy/rule/expression/filter/single_filter/client_filter';
import { TimeFilter } from '../policy/rule/expression/filter/single_filter/time_filter';
import { DayFilter } from '../policy/rule/expression/filter/single_filter/day_filter';
import { RuleCall } from '../policy/rule/expression/filter/single_filter/rule_call';
import { VariableReference } from '../policy/rule/expression/filter/single_filter/variable_reference';
import { ExpressionInitalization } from '../policy/rule/expression/variable_init/expression_variable_init';
import { ImmediateInitalization } from '../policy/rule/expression/variable_init/immediate_variable_init';
import { FilterExpression } from '../policy/rule/expression/filter/filter_expression';
import { RuleCallWithAlias } from '../policy/rule/expression/filter/single_filter/rule_call_with_alias';
import { BooleanConst } from '../policy/rule/expression/filter/single_filter/boolean_const';

import { plainToClass } from 'class-transformer';


export const typeMappings = [
    { value: LogicalAnd, name: 'LogicalAnd' },
    { value: LogicalOr, name: 'LogicalOr' },
    { value: LogicalNot, name: 'LogicalNot' },
    { value: ScopeFilter, name: 'ScopeFilter' },
    { value: ClientFilter, name: 'ClientFilter' },
    { value: TimeFilter, name: 'TimeFilter' },
    { value: DayFilter, name: 'DayFilter' },
    { value: RuleCall, name: 'RuleCall' },
    { value: RuleCallWithAlias, name: 'RuleCallWithAlias' },
    { value: VariableReference, name: 'VariableReference' },
    { value: ExpressionInitalization, name: 'ExpressionInitalization' },
    { value: ImmediateInitalization, name: 'ImmediateInitalization' },
    { value: BooleanConst, name: 'BooleanConst' },
]


export function typeFrom(obj: FilterExpression): FilterExpression {
    switch (obj.__type) {
        case LogicalAnd.name:
            return plainToClass(LogicalAnd, obj);
        case LogicalOr.name:
            return plainToClass(LogicalOr, obj);
        case LogicalNot.name:
            return plainToClass(LogicalNot, obj);
        case ScopeFilter.name:
            return plainToClass(ScopeFilter, obj);
        case ClientFilter.name:
            return plainToClass(ClientFilter, obj);
        case TimeFilter.name:
            return plainToClass(TimeFilter, obj);
        case DayFilter.name:
            return plainToClass(DayFilter, obj);
        case RuleCall.name:
            return plainToClass(RuleCall, obj);
        case RuleCallWithAlias.name:
            return plainToClass(RuleCallWithAlias, obj);
        case VariableReference.name:
            return plainToClass(VariableReference, obj);
        case BooleanConst.name:
            return plainToClass(BooleanConst, obj);
    }
}


export function genericPlainToClass(obj: FilterExpression): FilterExpression {
    return obj.constructor.name === FilterExpression.name ?
        typeFrom(obj) : obj;
}
