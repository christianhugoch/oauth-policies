import 'reflect-metadata';

import { equal } from "should";
import { buildPolicy } from "../../../../../policy_engine/language/builder/builder_util";
import { parse } from "../../../../../policy_engine/language/parser/parser";
import {
    oneRuleInSamePolicy,
    multipleRulesInSamePolicy,
    oneRuleOverAlias,
    multipleRulesOverAliases,
    aliasesAndInSamePolicy,
}
from "../../../test_data/rule_call_test_data";

describe("rule call test", () => {
 
    it("call one rule in same policy", () => {
        let policy = buildPolicy(parse(oneRuleInSamePolicy.code,"dummy"));
        equal(JSON.stringify(policy), JSON.stringify(oneRuleInSamePolicy.expectedObject));

    });

    it("call multiple rules in same policy", () => {
        let policy = buildPolicy(parse(multipleRulesInSamePolicy.code,"dummy"));
        equal(JSON.stringify(policy), JSON.stringify(multipleRulesInSamePolicy.expectedObject));
    });
    
    it("call one rule over an alias", () => {
        let policy = buildPolicy(parse(oneRuleOverAlias.code,"dummy"));
        equal(JSON.stringify(policy), JSON.stringify(oneRuleOverAlias.expectedObject));        
    });

    it("call multiple rules over aliases", () => {
        let policy = buildPolicy(parse(multipleRulesOverAliases.code,"dummy"));
        equal(JSON.stringify(policy), JSON.stringify(multipleRulesOverAliases.expectedObject));
    });

    it("call rules over aliases and in the same policy", () => {
        let policy = buildPolicy(parse(aliasesAndInSamePolicy.code,"dummy"));
        equal(JSON.stringify(policy), JSON.stringify(aliasesAndInSamePolicy.expectedObject));
    });

})