import { FilterExpression } from '../filter_expression';
import { AbstractVisitor } from '../../../../../../executor/chained_execution/abstract_visitor';

import { Type } from 'class-transformer';
import { typeMappings } from '../../../../../type_helper/type_mappings';


export class LogicalOr extends FilterExpression {

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
        visitor.visitOr(this);
    }
}
