import { parse } from "../../../policy_engine/language/parser/parser";

import { isEqual } from "lodash";
import { ok } from "should";


export function parseHelper(ruleBody: string): any[] {
    let booleanRuleTree = parse(`tmpl { ${ruleBody} }`, 'dummy').syntaxTree;
    let permitRuleTree = parse(`tmpl : true { ${ruleBody} }`, 'dummy').syntaxTree;
    let denyRuleTree = parse(`tmpl : false { ${ruleBody} }`, 'dummy').syntaxTree;
    ok(booleanRuleTree.length === 1 && permitRuleTree.length === 1 && denyRuleTree.length === 1);
    ok(isEqual(booleanRuleTree[0].scope, permitRuleTree[0].scope));
    ok(isEqual(booleanRuleTree[0].scope, denyRuleTree[0].scope));
    return booleanRuleTree[0].scope;
}


export function testHelper(code: string, expectedExpressions: Array<any>) {
    let ruleScope = parseHelper(code);
    let logicalChain = ruleScope;
    ok(isEqual(logicalChain, expectedExpressions));
}