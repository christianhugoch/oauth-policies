import { RuleCall } from "./rule_call";

export class RuleCallWithAlias extends RuleCall {
    importAlias: string;


    constructor(ruleName: string, importAlias: string) {
        super(ruleName);
        this.importAlias = importAlias;
        this.__type = this.constructor.name;
    }
}
