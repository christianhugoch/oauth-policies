import 'reflect-metadata';

import { RuleType } from "../../../../../policy_engine/language/model/policy/rule/rule_type";
import {
    oneScope,
    multipleScopes,
    oneClient,
    multipleClients,
    multipleScopesAndOneClient,
    multipleScopesAndClients,
} from "../../../test_data/scope_client_test_data";
import { buildPolicyHelper, checkHelper } from "../../executor_test_util";


describe("scope and client filter test", () => {
    it("one scope in BOOLEAN rule", () => {
        const [policy, policyWithNot] = buildPolicyHelper(oneScope, RuleType.BOOLEAN);
        checkHelper({ scopes: ["scope", "scopeB"], client: "client", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope", "scopeB"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "client", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "clientB", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientA", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
    });
    it("one scope in PERMIT rule", () => {
        const [policy, policyWithNot] = buildPolicyHelper(oneScope, RuleType.PERMIT);
        checkHelper({ scopes: ["scope", "scopeB"], client: "client", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope", "scopeB"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "client", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "clientB", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientA", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
    });
    it("one scope in DENY rule", () => {
        const [policy, policyWithNot] = buildPolicyHelper(oneScope, RuleType.DENY);

        checkHelper({ scopes: ["scope", "scopeB"], client: "client", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope", "scopeB"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "client", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scope"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientA", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientB", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
    });


    it("multiple scopes in BOOLEAN rule", () => {
        const [policy, policyWithNot] = buildPolicyHelper(multipleScopes, RuleType.BOOLEAN);
        checkHelper({ scopes: ["scope", "scopeB"], client: "client", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope", "scopeB"], client: "clientB", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "client", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientA", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
    });
    it("multiple scopes in PERMIT rule", () => {
        const [policy, policyWithNot] = buildPolicyHelper(multipleScopes, RuleType.PERMIT);
        checkHelper({ scopes: ["scope", "scopeB"], client: "client", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope", "scopeB"], client: "clientB", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "client", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientA", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
    });
    it("multiple scopes in DENY rule", () => {
        const [policy, policyWithNot] = buildPolicyHelper(multipleScopes, RuleType.DENY);
        checkHelper({ scopes: ["scope", "scopeB"], client: "client", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scope", "scopeB"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scope"], client: "client", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scope"], client: "clientB", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientA", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientB", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
    });


    it("one client in BOOLEAN rule", () => {
        const [policy, policyWithNot] = buildPolicyHelper(oneClient, RuleType.BOOLEAN);
        checkHelper({ scopes: ["scope", "scopeB"], client: "client", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope", "scopeB"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scope"], client: "client", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientA", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );

    });
    it("one client in PERMIT rule", () => {
        const [policy, policyWithNot] = buildPolicyHelper(oneClient, RuleType.PERMIT);
        checkHelper({ scopes: ["scope", "scopeB"], client: "client", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope", "scopeB"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scope"], client: "client", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientA", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
    });
    it("one client in DENY rule", () => {
        const [policy, policyWithNot] = buildPolicyHelper(oneClient, RuleType.DENY);
        checkHelper({ scopes: ["scope", "scopeB"], client: "client", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scope", "scopeB"], client: "clientB", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "client", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scope"], client: "clientB", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientA", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientB", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
    });


    it("multiple clients in BOOLEAN rule", () => {
        const [policy, policyWithNot] = buildPolicyHelper(multipleClients, RuleType.BOOLEAN);
        checkHelper({ scopes: ["scope", "scopeB"], client: "client", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope", "scopeB"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "client", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientA", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
    });
    it("multiple clients in PERMIT rule", () => {
        const [policy, policyWithNot] = buildPolicyHelper(multipleClients, RuleType.PERMIT);
        checkHelper({ scopes: ["scope", "scopeB"], client: "client", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope", "scopeB"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "client", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientA", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
    });
    it("multiple clients in DENY rule", () => {
        const [policy, policyWithNot] = buildPolicyHelper(multipleClients, RuleType.DENY);
        checkHelper({ scopes: ["scope", "scopeB"], client: "client", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scope", "scopeB"], client: "clientB", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scope"], client: "client", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scope"], client: "clientB", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientA", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientB", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: true },
        );
    });


    it("multiple scopes and one client in BOOLEAN rule", () => {
        const [policy, policyWithNot] = buildPolicyHelper(
            multipleScopesAndOneClient, RuleType.BOOLEAN);
        checkHelper({ scopes: ["scope", "scopeB"], client: "client", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope", "scopeB"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "client", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientA", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
    });
    it("multiple scopes and one client in PERMIT rule", () => {
        const [policy, policyWithNot] = buildPolicyHelper(
            multipleScopesAndOneClient, RuleType.PERMIT);
            checkHelper({ scopes: ["scope", "scopeB"], client: "client", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope", "scopeB"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "client", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientA", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
    });
    it("multiple scopes and one client in DENY rule", () => {
        const [policy, policyWithNot] = buildPolicyHelper(
            multipleScopesAndOneClient, RuleType.DENY);
        checkHelper({ scopes: ["scope", "scopeB"], client: "client", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scope", "scopeB"], client: "clientB", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scope"], client: "client", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scope"], client: "clientB", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientA", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientB", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
    });


    it("multiple scopes and one client in BOOLEAN rule", () => {
        const [policy, policyWithNot] = buildPolicyHelper(
            multipleScopesAndClients, RuleType.BOOLEAN);
        checkHelper({ scopes: ["scope", "scopeB"], client: "client", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope", "scopeB"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "client", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientA", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
    });
    it("multiple scopes and one client in PERMIT rule", () => {
        const [policy, policyWithNot] = buildPolicyHelper(
            multipleScopesAndClients, RuleType.PERMIT);
        checkHelper({ scopes: ["scope", "scopeB"], client: "client", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope", "scopeB"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "client", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scope"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientA", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientB", },
            { policy: policy, expected: false },
            { policy: policyWithNot, expected: false },
        );
    });
    it("multiple scopes and one client in DENY rule", () => {
        const [policy, policyWithNot] = buildPolicyHelper(
            multipleScopesAndClients, RuleType.DENY);
        checkHelper({ scopes: ["scope", "scopeB"], client: "client", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scope", "scopeB"], client: "clientB", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scope"], client: "client", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scope"], client: "clientB", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: true },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientA", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: false },
        );
        checkHelper({ scopes: ["scopeA"], client: "clientB", },
            { policy: policy, expected: true },
            { policy: policyWithNot, expected: true },
        );
    });
});