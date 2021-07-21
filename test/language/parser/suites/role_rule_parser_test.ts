import 'reflect-metadata';

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


describe("role rule", () => {
    it("empty rule", () => {
        let result = parse(emptyRule.code, "file rule policy");
        equal(JSON.stringify(result.syntaxTree), JSON.stringify(emptyRule.expectedTree));
    });

    it("one scopes command with multiple scopes", () => {
        let result = parse(ruleWithScopes.code, "file rule policy");
        equal(JSON.stringify(result.syntaxTree),
            JSON.stringify(ruleWithScopes.expectedTree));
    });

    it("two scopes commands", () => {
        let result = parse(ruleWithTwoScopesCommands.code, "file rule policy");
        equal(JSON.stringify(result.syntaxTree),
            JSON.stringify(ruleWithTwoScopesCommands.expectedTree));
    });

    it("one clients command", () => {
        let result = parse(ruleWithClientsCommand.code, "file rule policy");
        equal(JSON.stringify(result.syntaxTree),
            JSON.stringify(ruleWithClientsCommand.expectedTree));
    });

    it("two clients commands", () => {
        let result = parse(ruleWithMultipleClientCommands.code, "file rule policy");
        equal(JSON.stringify(result.syntaxTree),
            JSON.stringify(ruleWithMultipleClientCommands.expectedTree));
    });

    it("two clients and two scopes commands", () => {
        let result = parse(ruleWithMultipleScopesAndClients.code, "file rule policy");
        equal(JSON.stringify(result.syntaxTree),
            JSON.stringify(ruleWithMultipleScopesAndClients.expectedTree));
    });
});