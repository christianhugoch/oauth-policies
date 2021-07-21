import { FilterExpression } from '../filter_expression';
import { AbstractVisitor } from '../../../../../../executor/chained_execution/abstract_visitor';


export class BooleanConst extends FilterExpression {
    value: boolean;


    constructor(value: boolean) {
        super();
        this.value = value;
        this.__type = this.constructor.name;
    }


    accept(visitor: AbstractVisitor): void {
        visitor.visitBooleanConst(this);
    }
}
