import { FilterExpression } from "../filter_expression";
import { AbstractVisitor } from "../../../../../../executor/chained_execution/abstract_visitor";


export class DayFilter extends FilterExpression{
    day: string;


    constructor(day: string) {
        super();
        this.day = day;
        this.__type = this.constructor.name;
    }


    accept(visitor: AbstractVisitor): void {
        visitor.visitDayFilter(this);
    }
}
