import { FilterExpression } from '../filter/filter_expression';
import { VariableInitalization } from './variable_initalization';


export class ExpressionInitalization extends VariableInitalization {
    expression: FilterExpression;


    constructor(varName: string, expression: FilterExpression) {
        super(varName);
        this.expression = expression;
        this.__type = this.constructor.name;
    }
}
