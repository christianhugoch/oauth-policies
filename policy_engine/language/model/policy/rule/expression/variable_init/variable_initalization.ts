import { ExpressionBase } from "../expression_base";


export class VariableInitalization extends ExpressionBase {
    varName: string;


    constructor(name: string) {
        super();
        this.varName = name;
    }
}
