import { AbstractVisitor } from '../../../../../executor/chained_execution/abstract_visitor'
import { ExpressionBase } from '../expression_base';


export abstract class FilterExpression extends ExpressionBase {
    abstract accept(visitor: AbstractVisitor): void;
}
