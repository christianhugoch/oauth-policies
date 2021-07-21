import { timeFilterType } from './time_filter_type';
import { FilterExpression } from '../filter_expression';
import { AbstractVisitor } from '../../../../../../executor/chained_execution/abstract_visitor';


export class TimeFilter extends FilterExpression {
    hour: number;
    minute: number;
    type: timeFilterType;


    constructor(hour: number, minute: number, type: timeFilterType) {
        super();
        this.type = type;
        this.hour = hour;
        this.minute = minute;
        this.__type = this.constructor.name;
    }


    accept(visitor: AbstractVisitor): void {
        visitor.visitTimeFilter(this);
    }
}
