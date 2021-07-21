import { BooleanVariable } from './boolean_variable';
import { ImmediateInitalization } from './expression/variable_init/immediate_variable_init';
import { ExpressionInitalization } from './expression/variable_init/expression_variable_init';
import { ScopeFilter } from '../rule/expression/filter/single_filter/scope_filter';
import { ClientFilter } from './expression/filter/single_filter/client_filter';
import 'reflect-metadata';
import { Type, Exclude } from 'class-transformer'
import { ExpressionBase } from './expression/expression_base';
import { LogicalAnd } from './expression/filter/logical_filter/and';
import { VariableReference } from '../rule/expression/filter/single_filter/variable_reference';
import { LogicalOr } from '../rule/expression/filter/logical_filter/or';
import { LogicalNot } from '../rule/expression/filter/logical_filter/not';
import { TimeFilter } from '../rule/expression/filter/single_filter/time_filter';
import { RuleCall } from '../rule/expression/filter/single_filter/rule_call';
import { DayFilter } from '../rule/expression/filter/single_filter/day_filter';
import { getLogger } from '../../../../common/logger/logger_util';
import { BooleanConst } from './expression/filter/single_filter/boolean_const';
import { RuleCallWithAlias } from './expression/filter/single_filter/rule_call_with_alias';


const logger = getLogger();

export class Scope {
    @Type(() => ExpressionBase, {
        discriminator: {
            property: '__type',
            subTypes: [
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
            ],
        },
    })
    expressions: Array<ExpressionBase>;
    @Exclude()
    variables: Map<string, BooleanVariable> = null;


    constructor(expressions: Array<ExpressionBase>) {
        this.expressions = expressions;
    }


    setVar(booleanVar: BooleanVariable): void {
        if(!this.variables) {
            this.variables = new Map<string,BooleanVariable>();
        }
        this.variables.set(booleanVar.name, booleanVar);
    }


    getVar(name: string): boolean {
        if (!this.variables.has(name)) {
            logger.info(`variable: ${name} does not exist`)
            throw Error();
        }
        const vari = this.variables.get(name);
        return vari.value;
    }
}
