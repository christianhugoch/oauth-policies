import 'reflect-metadata';

import { buildPolicy } from "../../../../policy_engine/language/builder/builder_util";
import { parse } from "../../../../policy_engine/language/parser/parser";
import {
    emptyRule,
    ruleWithScopes,
    ruleWithTwoScopesCommands,
    ruleWithClientsCommand,
    ruleWithMultipleClientCommands,
    ruleWithMultipleScopesAndClients,
} from "../../test_data/role_rule_test_data";

import { equal } from "should";


describe("role rule test", () => {
    it("empty role rule", () => {
        let policy = buildPolicy(parse(emptyRule.code, "dummy"));
        equal(JSON.stringify(policy), JSON.stringify(emptyRule.expectedObject));
    });

    it("role rule with onw scopes command", () => {
        let policy = buildPolicy(parse(ruleWithScopes.code, "dummy"));
        equal(JSON.stringify(policy), JSON.stringify(ruleWithScopes.expectedObject));
    });

    it("role rule with two scopes command", () => {
        let policy = buildPolicy(parse(ruleWithTwoScopesCommands.code, "dummy"));
        equal(JSON.stringify(policy), JSON.stringify(ruleWithTwoScopesCommands.expectedObject));
    });

    it("role rule with client commands", () => {
        let policy = buildPolicy(parse(ruleWithClientsCommand.code, "dummy"));
        equal(JSON.stringify(policy), JSON.stringify(ruleWithClientsCommand.expectedObject));
    });

    it("role rule with multiple client commands", () => {
        let policy = buildPolicy(parse(ruleWithMultipleClientCommands.code, "dummy"));
        equal(JSON.stringify(policy), JSON.stringify(ruleWithMultipleClientCommands.expectedObject));
    });

    it("role rule with multiple scope and client commands", () => {
        let policy = buildPolicy(parse(ruleWithMultipleScopesAndClients.code, "dummy"));
        equal(JSON.stringify(policy), JSON.stringify(ruleWithMultipleScopesAndClients.expectedObject));
    });
});