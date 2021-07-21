import { ExpressionBase } from "../expression_base";


export class Import extends ExpressionBase {
    policyName: string;
    alias: string;


    constructor(policyName: string, alias: string) {
        super();
        this.policyName = policyName;
        this.alias = alias;
    }
}
