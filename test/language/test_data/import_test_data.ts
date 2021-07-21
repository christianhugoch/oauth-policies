import { Policy } from "../../../policy_engine/language/model/policy/policy";
import { Import } from "../../../policy_engine/language/model/policy/rule/expression/import/import_expression";
import { Rule } from "../../../policy_engine/language/model/policy/rule/rule";
import { RuleType } from "../../../policy_engine/language/model/policy/rule/rule_type";
import { Scope } from "../../../policy_engine/language/model/policy/rule/scope";


export let oneImport = {
    code: `import subPolicyA as subA;`,
    expectedTree: [
        { type: 'IMPORT', policy: 'subPolicyA', alias: 'subA' }
    ],
    expectedObject: ((): Policy => {
        let importCmd = new Import("subPolicyA", "subA");
        return new Policy("dummy", [], [], [importCmd]);
    })(),
};


export let twoImports = {
    code: `
    import subPolicyA as subA;
    import subPolicyB as subB;
`,
    expectedTree: [
        { type: 'IMPORT', policy: 'subPolicyA', alias: 'subA' },
        { type: 'IMPORT', policy: 'subPolicyB', alias: 'subB' }
    ],
    expectedObject: ((): Policy => {
        let importCmdA = new Import("subPolicyA", "subA");
        let importCmdB = new Import("subPolicyB", "subB");
        return new Policy("dummy", [], [], [importCmdA, importCmdB]);
    })(),
};


export let importsFollowedByARule = {
    code: `
    import subPolicyA as subA;
    import subPolicyB as subB;

    rule : true {}
`,
    expectedTree: [
        { type: 'IMPORT', policy: 'subPolicyA', alias: 'subA' },
        { type: 'IMPORT', policy: 'subPolicyB', alias: 'subB' },
        { type: 'RULE', name: 'rule', effect: 'true', scope: new Array<any>() }
    ],
    expectedObject: ((): Policy => {
        let importCmdA = new Import("subPolicyA", "subA");
        let importCmdB = new Import("subPolicyB", "subB");
        let rule = new Rule("rule", RuleType.PERMIT, new Scope([]));
        return new Policy("dummy", [rule], [], [importCmdA, importCmdB]);
    })(),
}


export let importsWithARuleInBetween = {
    code: `
    import subPolicyA as subA;
    import subPolicyB as subB;

    rule : true {}

    import subPolicyC as subC;
`,
    expectedTree: [
        { type: 'IMPORT', policy: 'subPolicyA', alias: 'subA' },
        { type: 'IMPORT', policy: 'subPolicyB', alias: 'subB' },
        { type: 'RULE', name: 'rule', effect: 'true', scope: new Array<any>() },
        { type: 'IMPORT', policy: 'subPolicyC', alias: 'subC' }
    ],
    expectedObject: ((): Policy => {
        let importCmdA = new Import("subPolicyA", "subA");
        let importCmdB = new Import("subPolicyB", "subB");
        let importCmdC = new Import("subPolicyC", "subC");
        let rule = new Rule("rule", RuleType.PERMIT, new Scope([]));
        return new Policy("dummy", [rule], [], [importCmdA, importCmdB,importCmdC]);
    })(),
}
