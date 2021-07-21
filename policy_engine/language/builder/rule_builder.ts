import { Rule } from '../model/policy/rule/rule';
import { RuleType } from '../model/policy/rule/rule_type';
import { Scope } from '../model/policy/rule/scope';
import { getLogger } from '../../common/logger/logger_util';
import { ExpressionBase } from '../model/policy/rule/expression/expression_base';
import { handleRule, handleRoleRule } from './builder_util';
import { ParsingException } from '../../common/exceptions/parsing_exception';


export const logger = getLogger();

export class RuleBuilder {
    _name: string | undefined;
    _type: RuleType | undefined;
    _commands: Array<ExpressionBase> | undefined;

    name(name: string): RuleBuilder {
        this._name = name;
        return this;
    }


    type(type: string): RuleBuilder {
        switch (type) {
            case 'false': {
                this._type = RuleType.DENY;
                break;
            }
            case 'true': {
                this._type = RuleType.PERMIT;
                break;
            }
            case 'boolean': {
                this._type = RuleType.BOOLEAN;
                break;
            }
            case 'role': {
                this._type = RuleType.ROLE;
                break;
            }
            default: {
                throw new ParsingException(`The rule type ${type} is no supported.`)
            }
        }
        return this;
    }


    scope(parsedScope: any): RuleBuilder {
        if (this._type === RuleType.BOOLEAN || this._type === RuleType.PERMIT || this._type === RuleType.DENY) {
            this._commands = handleRule(parsedScope);
        }
        else if (this._type === RuleType.ROLE) {
            this._commands = handleRoleRule(parsedScope);
        }
        return this;
    }


    build(): Rule {
        const scope = new Scope(this._commands);
        return new Rule(this._name, this._type, scope);
    }
}