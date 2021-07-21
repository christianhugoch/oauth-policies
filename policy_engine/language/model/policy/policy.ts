import { Rule } from './rule/rule';
import { FileRule } from './rule/file_rule';
import { Type } from 'class-transformer'
import { Import } from './rule/expression/import/import_expression';
import { ExecutionException } from '../../../common/exceptions/execution_exception';


export class Policy {
    name: string;
    @Type(() => Rule)
    decisionRules: Array<Rule>;
    @Type(() => FileRule)
    fileRules: Array<FileRule>;
    @Type(() => Import)
    imports: Array<Import>;


    constructor(name: string, rules: Array<Rule>, fileRules: Array<FileRule>, imports: Array<Import>) {
        this.name = name;
        this.decisionRules = rules;
        this.fileRules = fileRules;
        this.imports = imports;
    }


    getDecisionRule(name: string): Rule {
        const result = this.decisionRules.find(element => element.name === name);
        if (!result) {
            throw new ExecutionException(`unable to find the rule: ${name}`);
        }
        return result;
    }


    getFileRulesWithScope(oauthScope: string): Array<FileRule> {
        return this.fileRules.filter(fileRule => fileRule.scope === oauthScope);
    }
}
