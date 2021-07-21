import { FilterExpression } from '../filter_expression';
import { AbstractVisitor } from '../../../../../../executor/chained_execution/abstract_visitor';


export class RuleCall extends FilterExpression {
    ruleName: string;


    constructor(ruleName: string) {
        super();
        this.ruleName = ruleName;
        this.__type = this.constructor.name;
    }


    accept(visitor: AbstractVisitor): void {
        visitor.visitRuleCall(this);
    }
}
