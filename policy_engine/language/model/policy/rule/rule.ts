import { RuleType } from './rule_type';
import { Scope } from './scope';

import { Type, Transform } from 'class-transformer'


export class Rule {
    name: string;
    @Transform(value => <RuleType>value)
    type: RuleType;
    @Type(() => Scope)
    scope: Scope;


    constructor(name: string, type: RuleType, scope: Scope) {
        this.name = name;
        this.type = type;
        this.scope = scope;
    }


    successValue(): boolean {
        if (this.type === RuleType.PERMIT || this.type === RuleType.BOOLEAN ||
            this.type === RuleType.ROLE) {

            return true;
        }
        return false;
    }
}
