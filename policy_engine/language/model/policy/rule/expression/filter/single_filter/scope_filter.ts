import { FilterExpression } from '../filter_expression';
import { AbstractVisitor } from '../../../../../../executor/chained_execution/abstract_visitor';


export class ScopeFilter extends FilterExpression {
    scope: string;


    constructor(scope: string) {
        super();
        this.scope = scope;
        this.__type = this.constructor.name;
    }


    accept(visitor: AbstractVisitor): void {
        visitor.visitScopeFilter(this);
    }
}
