import { FilterExpression } from '../filter_expression';
import { AbstractVisitor } from '../../../../../../executor/chained_execution/abstract_visitor';

import { Type } from 'class-transformer'
import { typeMappings } from '../../../../../type_helper/type_mappings'


export class LogicalNot extends FilterExpression {
    @Type(() => FilterExpression, {
        discriminator: {
            property: '__type',
            subTypes: typeMappings
        }
    })
    component: FilterExpression;


    constructor(component: FilterExpression) {
        super();
        this.component = component;
        this.__type = this.constructor.name;
    }


    accept(visitor: AbstractVisitor): void {
        visitor.visitNot(this);
    }
}
