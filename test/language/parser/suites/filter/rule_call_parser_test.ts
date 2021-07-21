import 'reflect-metadata';

import { parse } from "../../../../../policy_engine/language/parser/parser";
import {
    oneRuleInSamePolicy,
    multipleRulesInSamePolicy,
    oneRuleOverAlias,
    multipleRulesOverAliases,
    aliasesAndInSamePolicy,
}
from "../../../test_data/rule_call_test_data";

import { equal } from "should";


describe("rule call test", () => {
    it("call one rule in same policy", () => {
        let parsed = parse(oneRuleInSamePolicy.code,"dummy");
        equal(JSON.stringify(parsed.syntaxTree), JSON.stringify(oneRuleInSamePolicy.expectedTree));
    });

    it("call multiple rules in same policy", () => {
        let parsed = parse(multipleRulesInSamePolicy.code,"dummy");
        equal(JSON.stringify(parsed.syntaxTree), JSON.stringify(multipleRulesInSamePolicy.expectedTree));
    });
    
    it("call one rule over an alias", () => {
        let parsed = parse(oneRuleOverAlias.code,"dummy");
        equal(JSON.stringify(parsed.syntaxTree), JSON.stringify(oneRuleOverAlias.expectedTree));        
    });
    
    it("call multiple rules over aliases", () => {
        let parsed = parse(multipleRulesOverAliases.code,"dummy");
        equal(JSON.stringify(parsed.syntaxTree), JSON.stringify(multipleRulesOverAliases.expectedTree));
    });
    
    it("call rules over aliases and in the same policy", () => {
        let parsed = parse(aliasesAndInSamePolicy.code,"dummy");
        equal(JSON.stringify(parsed.syntaxTree), JSON.stringify(aliasesAndInSamePolicy.expectedTree));
    });
})