import 'reflect-metadata';

import { buildPolicy } from "../../../../policy_engine/language/builder/builder_util";
import { ExecutionController } from "../../../../policy_engine/language/executor/decision_controller";
import { parse } from "../../../../policy_engine/language/parser/parser";
import {
    emptyRule,
    ruleWithScopes,
    ruleWithTwoScopesCommands,
    ruleWithClientsCommand,
    ruleWithMultipleClientCommands,
    ruleWithMultipleScopesAndClients,
} from "../../test_data/role_rule_test_data";

import { doesNotThrow, ok, throws } from "should";


describe("role rule test", () => {
    it("empty role rule throws", () => {
        let policy = buildPolicy(parse(emptyRule.codeWithGrantToken, "dummy"));
        throws(() => { new ExecutionController(["scopeA"], "clientA", [policy]).decide() });
    });

    it("role rule with scopes", () => {
        let policy = buildPolicy(parse(ruleWithScopes.codeWithGrantToken, "dummy"));
        doesNotThrow(() => {
            new ExecutionController(["scopeA"], "clientA", [policy]).decide()
        });
        for (let client of ["clientA", "clientB"]) {
            ok(new ExecutionController(["scopeA", "scopeB", "scopeC"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA", "scopeB"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA"], client, [policy]).decide());
            ok(!new ExecutionController(["scopeA", "scopeB", "scopeC", "scopeD"], client, [policy]).decide());
            ok(!new ExecutionController(["scopeA", "scopeB", "scopeD"], client, [policy]).decide());
            ok(!new ExecutionController(["scopeA", "scopeD"], client, [policy]).decide());
            ok(!new ExecutionController(["scopeD"], client, [policy]).decide());
        }
    });

    it("role rule with two scopes commands", () => {
        let policy = buildPolicy(parse(ruleWithTwoScopesCommands.codeWithGrantToken, "dummy"));
        doesNotThrow(() => {
            new ExecutionController(["scopeA"], "clientA", [policy]).decide()
        });
        for (let client of ["clientA", "clientB"]) {
            ok(new ExecutionController(["scopeA", "scopeB", "scopeC"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA", "scopeB"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA", "scopeB", "scopeC", "scopeD"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA", "scopeB", "scopeD"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA", "scopeD"], client, [policy]).decide());
            ok(new ExecutionController(["scopeD"], client, [policy]).decide());
            ok(new ExecutionController(
                ["scopeA", "scopeB", "scopeC", "scopeD", "scopeE", "scopeF"],
                client, [policy]).decide());
            ok(!new ExecutionController(
                ["scopeA", "scopeB", "scopeC", "scopeD", "scopeE", "scopeF", "scopeG"],
                client, [policy]).decide());
            ok(!new ExecutionController(["scopeG"], client, [policy]).decide());
        }
    });

    it("role rule with clients command", () => {
        let policy = buildPolicy(parse(ruleWithClientsCommand.codeWithGrantToken, "dummy"));
        doesNotThrow(() => {
            new ExecutionController(["scopeA"], "clientA", [policy]).decide()
        });
        for (let client of ["clientA", "clientB", "clientC"]) {
            ok(new ExecutionController(["scopeA", "scopeB", "scopeC"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA", "scopeB"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA", "scopeB", "scopeC", "scopeD"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA", "scopeB", "scopeD"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA", "scopeD"], client, [policy]).decide());
            ok(new ExecutionController(["scopeD"], client, [policy]).decide());
            ok(new ExecutionController(
                ["scopeA", "scopeB", "scopeC", "scopeD", "scopeE", "scopeF"],
                client, [policy]).decide());
            ok(new ExecutionController(
                ["scopeA", "scopeB", "scopeC", "scopeD", "scopeE", "scopeF", "scopeG"],
                client, [policy]).decide());
            ok(new ExecutionController(["scopeG"], client, [policy]).decide());
        }
        ok(!new ExecutionController(["scopeA", "scopeB", "scopeC"], "client", [policy]).decide());
        ok(!new ExecutionController(["scopeA", "scopeB"], "client", [policy]).decide());
        ok(!new ExecutionController(["scopeA"], "client", [policy]).decide());
        ok(!new ExecutionController(["scopeA", "scopeB", "scopeC", "scopeD"], "client", [policy]).decide());
        ok(!new ExecutionController(["scopeA", "scopeB", "scopeD"], "client", [policy]).decide());
        ok(!new ExecutionController(["scopeA", "scopeD"], "client", [policy]).decide());
        ok(!new ExecutionController(["scopeD"], "client", [policy]).decide());
        ok(!new ExecutionController(
            ["scopeA", "scopeB", "scopeC", "scopeD", "scopeE", "scopeF"],
            "client", [policy]).decide());
        ok(!new ExecutionController(
            ["scopeA", "scopeB", "scopeC", "scopeD", "scopeE", "scopeF", "scopeG"],
            "client", [policy]).decide());
        ok(!new ExecutionController(["scopeG"], "client", [policy]).decide());
    });

    it("role rule with multiple clients commands", () => {
        let policy = buildPolicy(parse(ruleWithMultipleClientCommands.codeWithGrantToken, "dummy"));
        doesNotThrow(() => {
            new ExecutionController(["scopeA"], "clientA", [policy]).decide()
        });
        for (let client of ["clientA", "clientB", "clientC", "clientD", "clientE", "clientF"]) {
            ok(new ExecutionController(["scopeA", "scopeB", "scopeC"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA", "scopeB"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA", "scopeB", "scopeC", "scopeD"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA", "scopeB", "scopeD"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA", "scopeD"], client, [policy]).decide());
            ok(new ExecutionController(["scopeD"], client, [policy]).decide());
            ok(new ExecutionController(
                ["scopeA", "scopeB", "scopeC", "scopeD", "scopeE", "scopeF"],
                client, [policy]).decide());
            ok(new ExecutionController(
                ["scopeA", "scopeB", "scopeC", "scopeD", "scopeE", "scopeF", "scopeG"],
                client, [policy]).decide());
            ok(new ExecutionController(["scopeG"], client, [policy]).decide());
        }
        ok(!new ExecutionController(["scopeA", "scopeB", "scopeC"], "client", [policy]).decide());
        ok(!new ExecutionController(["scopeA", "scopeB"], "client", [policy]).decide());
        ok(!new ExecutionController(["scopeA"], "client", [policy]).decide());
        ok(!new ExecutionController(["scopeA", "scopeB", "scopeC", "scopeD"], "client", [policy]).decide());
        ok(!new ExecutionController(["scopeA", "scopeB", "scopeD"], "client", [policy]).decide());
        ok(!new ExecutionController(["scopeA", "scopeD"], "client", [policy]).decide());
        ok(!new ExecutionController(["scopeD"], "client", [policy]).decide());
        ok(!new ExecutionController(
            ["scopeA", "scopeB", "scopeC", "scopeD", "scopeE", "scopeF"],
            "client", [policy]).decide());
        ok(!new ExecutionController(
            ["scopeA", "scopeB", "scopeC", "scopeD", "scopeE", "scopeF", "scopeG"],
            "client", [policy]).decide());
        ok(!new ExecutionController(["scopeG"], "client", [policy]).decide());
    });

    it("role rule with multiple scopes and clients commands", () => {
        let policy = buildPolicy(parse(ruleWithMultipleScopesAndClients.codeWithGrantToken, "dummy"));
        doesNotThrow(() => {
            new ExecutionController(["scopeA"], "clientA", [policy]).decide()
        });
        for (let client of ["clientA", "clientB", "clientC", "clientD", "clientE", "clientF"]) {
            ok(new ExecutionController(["scopeA", "scopeB", "scopeC"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA", "scopeB"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA", "scopeB", "scopeC", "scopeD"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA", "scopeB", "scopeD"], client, [policy]).decide());
            ok(new ExecutionController(["scopeA", "scopeD"], client, [policy]).decide());
            ok(new ExecutionController(["scopeD"], client, [policy]).decide());
            ok(new ExecutionController(
                ["scopeA", "scopeB", "scopeC", "scopeD", "scopeE", "scopeF"],
                client, [policy]).decide());
            ok(!new ExecutionController(
                ["scopeA", "scopeB", "scopeC", "scopeD", "scopeE", "scopeF", "scopeG"],
                client, [policy]).decide());
            ok(!new ExecutionController(["scopeG"], client, [policy]).decide());
        }
        ok(!new ExecutionController(["scopeA", "scopeB", "scopeC"], "client", [policy]).decide());
        ok(!new ExecutionController(["scopeA", "scopeB"], "client", [policy]).decide());
        ok(!new ExecutionController(["scopeA"], "client", [policy]).decide());
        ok(!new ExecutionController(["scopeA", "scopeB", "scopeC", "scopeD"], "client", [policy]).decide());
        ok(!new ExecutionController(["scopeA", "scopeB", "scopeD"], "client", [policy]).decide());
        ok(!new ExecutionController(["scopeA", "scopeD"], "client", [policy]).decide());
        ok(!new ExecutionController(["scopeD"], "client", [policy]).decide());
        ok(!new ExecutionController(
            ["scopeA", "scopeB", "scopeC", "scopeD", "scopeE", "scopeF"],
            "client", [policy]).decide());
        ok(!new ExecutionController(
            ["scopeA", "scopeB", "scopeC", "scopeD", "scopeE", "scopeF", "scopeG"],
            "client", [policy]).decide());
        ok(!new ExecutionController(["scopeG"], "client", [policy]).decide());
    });
});