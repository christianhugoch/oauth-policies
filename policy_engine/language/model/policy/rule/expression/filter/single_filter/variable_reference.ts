import { FilterExpression } from '../filter_expression';
import { AbstractVisitor } from '../../../../../../executor/chained_execution/abstract_visitor';


export class VariableReference extends FilterExpression {
    variableName: string;


    constructor(variableName: string) {
        super();
        this.variableName = variableName;
        this.__type = this.constructor.name;
    }


    accept(visitor: AbstractVisitor): void {
        visitor.visitRef(this);
    }
}
