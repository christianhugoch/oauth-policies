import { buildPolicy } from "../../../policy_engine/language/builder/builder_util";
import { parse } from "../../../policy_engine/language/parser/parser";

import { equal, ok } from "should";


export function builderHelper(ruleBody: string) {
    let inBoolean = buildPolicy(parse(`tmpl { ${ruleBody} }`, 'dummy'));
    let inPermit = buildPolicy(parse(`tmpl : true { ${ruleBody} }`, 'dummy'));
    let inPDeny = buildPolicy(parse(`tmpl : false { ${ruleBody} }`, 'dummy'));
    ok(inBoolean.decisionRules.length === 1 && inPermit.decisionRules.length === 1
        && inPDeny.decisionRules.length === 1);
    equal(JSON.stringify(inBoolean.decisionRules[0].scope), JSON.stringify(inPermit.decisionRules[0].scope));
    equal(JSON.stringify(inBoolean.decisionRules[0].scope), JSON.stringify(inPDeny.decisionRules[0].scope));
    return inBoolean.decisionRules[0].scope;
}


export function builderTestHelper(code: string, expected: Array<any>) {
    let ruleScope = builderHelper(code);
    equal(JSON.stringify(ruleScope.expressions),
        JSON.stringify(expected));
}