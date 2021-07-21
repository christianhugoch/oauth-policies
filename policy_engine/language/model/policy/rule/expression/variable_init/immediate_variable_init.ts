import { VariableInitalization } from "./variable_initalization";


export class ImmediateInitalization extends VariableInitalization {
    value: boolean;


    constructor(varName: string, value: boolean) {
        super(varName);
        this.value = value;
        this.__type = this.constructor.name;
    }
}
