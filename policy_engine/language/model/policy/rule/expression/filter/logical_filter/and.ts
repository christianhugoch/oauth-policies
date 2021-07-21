import { FilterExpression } from '../filter_expression';
import { AbstractVisitor } from '../../../../../../executor/chained_execution/abstract_visitor';

import { typeMappings } from '../../../../../type_helper/type_mappings'
import { Type } from 'class-transformer'


export class LogicalAnd extends FilterExpression {
    @Type(() => FilterExpression, {
        discriminator: {
            property: '__type',
            subTypes: typeMappings
        }
    })
    components: Array<FilterExpression>;


    constructor(components: Array<FilterExpression>) {
        super();
        this.components = components;
        this.__type = this.constructor.name;
    }


    accept(visitor: AbstractVisitor): void {
        visitor.visitAnd(this);
    }
}
