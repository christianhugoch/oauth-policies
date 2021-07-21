import 'reflect-metadata';

import { ok } from "should";
import { buildPolicy } from "../../../../../policy_engine/language/builder/builder_util";
import { ExecutionController } from "../../../../../policy_engine/language/executor/decision_controller";
import { parse } from "../../../../../policy_engine/language/parser/parser";

import {
    oneRuleInSamePolicy,
    multipleRulesInSamePolicy,
    oneRuleOverAlias,
    multipleRulesOverAliases,
    aliasesAndInSamePolicy,
} from "../../../test_data/rule_call_test_data";


describe("rule call filter test", () => {
    it("one rule in same policy", () => {
        let policy = buildPolicy(parse(oneRuleInSamePolicy.code, "dummy"));
        ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
        ok(new ExecutionController(["scopeA", "scopeB"], "clientA", [policy]).decide());
    });

    it("multiple rules in same policy", () => {
        let policy = buildPolicy(parse(multipleRulesInSamePolicy.codeWithGrantToken, "dummy"));
        ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
        ok(!new ExecutionController(["scopeB"], "clientA", [policy]).decide());
        ok(!new ExecutionController(["scopeC"], "clientA", [policy]).decide());
    });

    it("one rule call over alias", () => {
        let policy = buildPolicy(parse(oneRuleOverAlias.codeWithGrantToken, "dummy"));
        let subPolicy = buildPolicy(parse(oneRuleOverAlias.subPolicy, "subPolicy"));
        ok(new ExecutionController(["scopeA"], "clientA", [policy, subPolicy]).decide());
        ok(!new ExecutionController(["scopeA", "scopeB"], "clientA", [policy, subPolicy]).decide());
        ok(new ExecutionController(["scopeA"], "clientB", [policy, subPolicy]).decide());
        ok(!new ExecutionController(["scopeA", "scopeB"], "clientB", [policy, subPolicy]).decide());
        ok(!new ExecutionController(["scopeB"], "clientB", [policy, subPolicy]).decide());
    });

    it("multiple rule calls over two aliases", () => {
        let policy = buildPolicy(parse(multipleRulesOverAliases.codeWithGrantToken, "dummy"));
        let subPolicyA = buildPolicy(parse(multipleRulesOverAliases.subPolicyA, "subPolicyA"));
        let subPolicyB = buildPolicy(parse(multipleRulesOverAliases.subPolicyA, "subPolicyB"));
        ok(!new ExecutionController(
            ["scopeA", "scopeB"], "clientC", [policy, subPolicyA, subPolicyB])
            .decide()
        );
        ok(!new ExecutionController(
            ["scopeA", "scopeB"], "clientA", [policy, subPolicyA, subPolicyB])
            .decide()
        );
        ok(!new ExecutionController(
            ["scopeA", "scopeB"], "clientB", [policy, subPolicyA, subPolicyB])
            .decide()
        );
    });

    it("multiple rule calls over two aliases and calls in the same policy", () => {
        let policy = buildPolicy(parse(aliasesAndInSamePolicy.codeWithGrantToken, "dummy"));
        let subPolicyA = buildPolicy(parse(aliasesAndInSamePolicy.subPolicyA, "subPolicyA"));
        let subPolicyB = buildPolicy(parse(aliasesAndInSamePolicy.subPolicyA, "subPolicyB"));
        ok(!new ExecutionController(
            ["scopeA", "scopeB"], "clientC", [policy, subPolicyA, subPolicyB])
            .decide()
        );
        ok(!new ExecutionController(
            ["scopeA", "scopeB"], "clientA", [policy, subPolicyA, subPolicyB])
            .decide()
        );
        ok(!new ExecutionController(
            ["scopeA", "scopeB"], "clientB", [policy, subPolicyA, subPolicyB])
            .decide()
        );
    });
});