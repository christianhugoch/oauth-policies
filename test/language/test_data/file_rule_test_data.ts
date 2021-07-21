import { Policy } from "../../../policy_engine/language/model/policy/policy";
import { Import } from "../../../policy_engine/language/model/policy/rule/expression/import/import_expression";
import { FileRule } from "../../../policy_engine/language/model/policy/rule/file_rule";
import { Rule } from "../../../policy_engine/language/model/policy/rule/rule";
import { RuleType } from "../../../policy_engine/language/model/policy/rule/rule_type";
import { Scope } from "../../../policy_engine/language/model/policy/rule/scope";


export let emptyRule = {
    code: `empty : file {}`,
    expectedTree: [
        {
            type: 'FILE_RULE',
            name: 'empty',
            effect: 'file',
            scope: new Array<any>()
        }
    ],
    expectedModelObject: ((): Policy => {
        let fileRule = new FileRule("empty", undefined, undefined);
        return new Policy("dummy", [], [fileRule], []);
    })(),
};


export let scopeCommandWithMultipleScopes = {
    code: `
        withScopes : role {
            scopes = scopeA,scopeB, scopeC;
        }`,
    expectedTree: [
        {
            type: 'ROLE_RULE',
            name: 'withScopes',
            effect: 'role',
            scope: [
                {
                    type: 'SCOPE_LIST',
                    scopes: ['scopeA', 'scopeB', 'scopeC']
                }
            ]
        }
    ]
}

export let ruleWithoutScope = {
    code: `
    filesWithoutScope : file { 
        files = fileA;
        files = fileB, fileC;
    }`,
    expectedTree: [
        {
            type: 'FILE_RULE',
            name: 'filesWithoutScope',
            effect: 'file',
            scope: [
                { type: 'FILE_LIST', files: ['fileA'] },
                { type: 'FILE_LIST', files: ['fileB', 'fileC'] },
            ]
        }
    ],
    expectedObject: ((): Policy => { // not yet supported, the builder will throw
        return null;
    })(),
};


export let ruleWithMultipleScopes = {
    code: `
    scopeWithoutFiles : file { 
        scope = scopeA;
        scope = scopeB;
    }`,
    expectedTree: [
        {
            type: 'FILE_RULE',
            name: 'scopeWithoutFiles',
            effect: 'file',
            scope: [
                { type: 'SINGLE_SCOPE', scope: 'scopeA' },
                { type: 'SINGLE_SCOPE', scope: 'scopeB' }
            ]
        }
    ],
    expectedObject: ((): Policy => { // not yet supported, the builder will throw
        return null;
    })(),
};


export let oneScopeAndOneFile = {
    code: `
    filesRule : file { 
        files = fileA;
        scope = scopeA; 
    }`,
    expectedTree: [
        {
            type: 'FILE_RULE',
            name: 'filesRule',
            effect: 'file',
            scope: [
                { type: 'FILE_LIST', files: ['fileA'] },
                { type: 'SINGLE_SCOPE', scope: 'scopeA' }
            ]
        }
    ],
    expectedObject: ((): Policy => {
        let fileRule = new FileRule("filesRule", "scopeA", ["fileA"]);
        let fileRulesArray = new Array<FileRule>(fileRule);
        return new Policy("dummy", new Array<Rule>(), [fileRule], new Array<Import>());
    })(),
};


export let oneScopeAndMultipleFile = {
    code: `
    filesRule : file { 
        files = fileA, fileB, fileC;
        scope = scopeA; 
    }`,
    expectedTree: [
        {
            type: 'FILE_RULE',
            name: 'filesRule',
            effect: 'file',
            scope: [
                { type: 'FILE_LIST', files: ['fileA', 'fileB', 'fileC'] },
                { type: 'SINGLE_SCOPE', scope: 'scopeA' }
            ]
        }
    ],
    expectedObject: ((): Policy => {
        let fileRule = new FileRule("filesRule", "scopeA", ['fileA', 'fileB', 'fileC']);
        let fileRulesArray = new Array<FileRule>(fileRule);
        return new Policy("dummy", new Array<Rule>(), [fileRule], new Array<Import>());
    })(),
};


export let threeValidFileRules = {
    code: `
    filesRuleA : file { 
        files = fileA;
        scope = scopeA; 
    }

filesRuleB : file { 
files = fileA, fileB, fileC;
scope = scopeB; 
}

    filesRuleC : file { 
        files = fileD;
        scope = scopeA; 
    }
`,
    expectedTree: [
        {
            type: 'FILE_RULE',
            name: 'filesRuleA',
            effect: 'file',
            scope: [
                { type: 'FILE_LIST', files: ['fileA'] },
                { type: 'SINGLE_SCOPE', scope: 'scopeA' }
            ]
        },
        {
            type: 'FILE_RULE',
            name: 'filesRuleB',
            effect: 'file',
            scope: [
                { type: 'FILE_LIST', files: ['fileA', 'fileB', 'fileC'] },
                { type: 'SINGLE_SCOPE', scope: 'scopeB' }
            ]
        },
        {
            type: 'FILE_RULE',
            name: 'filesRuleC',
            effect: 'file',
            scope: [
                { type: 'FILE_LIST', files: ['fileD'] },
                { type: 'SINGLE_SCOPE', scope: 'scopeA' }
            ]
        }
    ],
    expectedObject: ((): Policy => {
        let fileRuleA = new FileRule("filesRuleA", "scopeA", ['fileA']);
        let fileRuleB = new FileRule("filesRuleB", "scopeB", ["fileA", "fileB", "fileC"]);
        let fileRuleC = new FileRule("filesRuleC", "scopeA", ["fileD"]);

        return new Policy("dummy", new Array<Rule>(),
            [fileRuleA, fileRuleB, fileRuleC], new Array<Import>());
    })(),

};


export let fileRulesWithMoreExpressions = {
    code: `
import moreFileRules as mfr;
filesRuleA : file { 
    files = fileA;
    scope = scopeA; 
}
            ruleAInBetween {}
            ruleBInBetween {}

            filesRuleB : file { 
                files = fileA, fileB, fileC;
                scope = scopeA; 
            }
    `,
    expectedTree: [
        { type: 'IMPORT', policy: 'moreFileRules', alias: 'mfr' },
        {
            type: 'FILE_RULE',
            name: 'filesRuleA',
            effect: 'file',
            scope: [
                { type: 'FILE_LIST', files: ['fileA'] },
                { type: 'SINGLE_SCOPE', scope: 'scopeA' }
            ]
        },
        {
            type: 'BOOLEAN_RULE',
            name: 'ruleAInBetween',
            effect: 'boolean',
            scope: []
        },
        {
            type: 'BOOLEAN_RULE',
            name: 'ruleBInBetween',
            effect: 'boolean',
            scope: []
        },
        {
            type: 'FILE_RULE',
            name: 'filesRuleB',
            effect: 'file',
            scope: [
                { type: 'FILE_LIST', files: ['fileA', 'fileB', 'fileC'] },
                { type: 'SINGLE_SCOPE', scope: 'scopeA' }
            ]
        }
    ],
    expectedObject: ((): Policy => {
        let ruleInBetweenA = new Rule("ruleAInBetween", RuleType.BOOLEAN, new Scope([]));
        let ruleInBetweenB = new Rule("ruleBInBetween", RuleType.BOOLEAN, new Scope([]));
        let importCmd = new Import("moreFileRules", "mfr");
        let fileRuleA = new FileRule("filesRuleA", "scopeA", ['fileA']);
        let fileRuleB = new FileRule("filesRuleB", "scopeA", ["fileA", "fileB", "fileC"]);
        return new Policy("dummy",
            [ruleInBetweenA, ruleInBetweenB],
            [fileRuleA, fileRuleB],
            [importCmd]);
    })(),
}