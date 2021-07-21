import { Policy } from '../model/policy/policy';
import { Rule } from '../model/policy/rule/rule';
import { FileRule } from '../model/policy/rule/file_rule';
import { RuleBuilder } from './rule_builder';
import { FileRuleBuilder } from './file_rule_builder';
import { Import } from '../model/policy/rule/expression/import/import_expression';


export class PolicyBuilder {
    name: string;
    rules: Array<Rule> = new Array<Rule>();
    fileRules: Array<FileRule> = new Array<FileRule>();
    imports: Array<Import> = new Array<Import>();


    addName(name: string): PolicyBuilder {
        this.name = name;
        return this;
    }


    addDecisionRule(parsedRule: any): PolicyBuilder {
        const rule = new RuleBuilder()
            .name(parsedRule.name)
            .type(parsedRule.effect)
            .scope(parsedRule.scope).build();
        this.rules.push(rule);
        return this;
    }


    addFileRule(parsedRule: any): PolicyBuilder {
        const rule = new FileRuleBuilder()
            .addName(parsedRule.name)
            .addScope(parsedRule.scope).build();
        this.fileRules.push(rule);
        return this;
    }


    addImport(parsedImport: any): PolicyBuilder {
        this.imports.push(new Import(parsedImport.policy, parsedImport.alias));
        return this;
    }

    
    build(): Policy {
        return new Policy(this.name, this.rules, this.fileRules, this.imports);
    }
}