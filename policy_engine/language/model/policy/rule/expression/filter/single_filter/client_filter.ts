import { FilterExpression } from '../filter_expression';
import { AbstractVisitor } from '../../../../../../executor/chained_execution/abstract_visitor';


export class ClientFilter extends FilterExpression {
    clientID: string;


    constructor(clientID: string) {
        super();
        this.clientID = clientID;
        this.__type = this.constructor.name;
    }


    accept(visitor: AbstractVisitor): void {
        visitor.visitClientFilter(this);
    }
}
