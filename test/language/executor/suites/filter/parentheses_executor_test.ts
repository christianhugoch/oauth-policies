import 'reflect-metadata';

import { ok } from "should";
import { ExecutionController } from "../../../../../policy_engine/language/executor/decision_controller";
import { parenthesesTestData } from "../../../test_data/parentheses_test_data";
import { buildPolicyWithGrantToken } from "../../executor_test_util";


describe("parentheses tests", () => {
    describe("flat parentheses", () => {
        it("one OR", () => {
            let expression = parenthesesTestData[0].code;
            {
                let varInits = `var_ref := true;`;
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["myScope"], "clientA", [policy]).decide());
                ok(new ExecutionController(["dummyScope"], "clientA", [policy]).decide());
                ok(new ExecutionController(["dummyScope"], "dummyClient", [policy]).decide());
            }
            {
                let varInits = `var_ref := false;`;
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["myScope"], "clientA", [policy]).decide());
                ok(!new ExecutionController(["dummyScope"], "clientA", [policy]).decide());
                ok(!new ExecutionController(["dummyScope"], "dummyClient", [policy]).decide());
            }
        });

        it("one AND", () => {
            let expression = parenthesesTestData[1].code;
            {
                let varInits = `var_ref := true;`;
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["myScope"], "clientA", [policy]).decide());
                ok(!new ExecutionController(["dummyScope"], "clientA", [policy]).decide());
                ok(!new ExecutionController(["dummyScope"], "dummyClient", [policy]).decide());
            }
            {
                let varInits = `var_ref := false;`;
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(!new ExecutionController(["myScope"], "clientA", [policy]).decide());
                ok(!new ExecutionController(["dummyScope"], "clientA", [policy]).decide());
                ok(!new ExecutionController(["dummyScope"], "dummyClient", [policy]).decide());
            }
        });

        it("one AND and one OR", () => {
            let expression = parenthesesTestData[2].code;
            {
                let varInits = "var_ref := false;";
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["myScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope", "dummyScope"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["dummyScope"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["my Scope", "dummyScope"], "dummyClient", [policy]).decide());

            }
            {
                let varInits = "var_ref := true;";
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["myScope"], "myClient", [policy]).decide());
                ok(new ExecutionController(["myScope", "dummyScope"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScope"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["dummyScope"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["my Scope", "dummyScope"], "dummyClient", [policy]).decide());
            }
        });

        it("mixed AND and ORs", () => {
            let expression = parenthesesTestData[3].code;
            {
                let varInits = "refA := false; refB := false; refC := false;";
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["myScope"], "provider", [policy]).decide());
                ok(new ExecutionController(["myScopeB"], "provider", [policy]).decide());
                ok(new ExecutionController(["any", "scope", "he", "wants"], "provider", [policy]).decide());
                ok(new ExecutionController(["myScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScopeB"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["dummyScope"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "mdummyScope", [policy]).decide());
            }
            {
                let varInits = "refA := false; refB := true; refC := false;";
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["myScope"], "provider", [policy]).decide());
                ok(new ExecutionController(["myScopeB"], "provider", [policy]).decide());
                ok(new ExecutionController(["any", "scope", "he", "wants"], "provider", [policy]).decide());
                ok(new ExecutionController(["myScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScopeB"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["dummyScope"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "mdummyScope", [policy]).decide());
            }
            {
                let varInits = "refA := false; refB := false; refC := true;";
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["myScope"], "provider", [policy]).decide());
                ok(new ExecutionController(["myScopeB"], "provider", [policy]).decide());
                ok(new ExecutionController(["any", "scope", "he", "wants"], "provider", [policy]).decide());
                ok(new ExecutionController(["myScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScopeB"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["dummyScope"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "mdummyScope", [policy]).decide());
            }
            {
                let varInits = "refA := true; refB := false; refC := false;";
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["myScope"], "provider", [policy]).decide());
                ok(new ExecutionController(["myScopeB"], "provider", [policy]).decide());
                ok(new ExecutionController(["any", "scope", "he", "wants"], "provider", [policy]).decide());
                ok(new ExecutionController(["myScope"], "myClient", [policy]).decide());
                ok(new ExecutionController(["myScopeB"], "myClient", [policy]).decide());
                ok(new ExecutionController(["myScope"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["dummyScope"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScope"], "mdummyScope", [policy]).decide());
            }
        });

        it("two ands", () => {
            let expression = parenthesesTestData[4].code;
            {
                let varInits = "var_ref := false;";
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(!new ExecutionController(["myScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope", "dummyScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["dummyScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["dummyScope"], "dummyClient", [policy]).decide());
            }
            {
                let varInits = "var_ref := true;";
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["myScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope", "dummyScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["dummyScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["dummyScope"], "dummyClient", [policy]).decide());
            }
        });

        it("three flat parentheses", () => {
            let expression = parenthesesTestData[5].code;
            {
                let varInits = "A:=false; B:=false; C:=false;"
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["myScopeC"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["myScopeA", "myScopeB", "myScopeC"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["myScopeC", "myScopeD"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["myScopeC", "myScopeA"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["myScopeC", "myScopeB"], "dummyClient", [policy]).decide());
            }
            {
                let varInits = "A:=true; B:=true; C:=true;"
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["myScopeB"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeC"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeC", "myScopeB"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeA"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeB", "myScopeA"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeA", "myScopeB"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeC", "myScopeD"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeC", "myScopeA"], "dummyClient", [policy]).decide());
            }
            {
                let varInits = "A:=true; B:=false; C:=false;"
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["myScopeB"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeC"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeC", "myScopeB"], "dummyClient", [policy]).decide());

                ok(!new ExecutionController(["myScopeA"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["myScopeB", "myScopeA"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["myScopeA", "myScopeB"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["myScopeC", "myScopeD"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["myScopeC", "myScopeA"], "dummyClient", [policy]).decide());
            }
            {
                let varInits = "A:=false; B:=true; C:=false;"
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["myScopeA"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeC"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeC", "myScopeA"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["myScopeB"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["myScopeB", "myScopeA"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["myScopeC", "myScopeD"], "dummyClient", [policy]).decide());
            }
            {
                let varInits = "A:=true; B:=true; C:=false;"
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["myScopeB"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeC"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeC", "myScopeB"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeA"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeB", "myScopeA"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeA", "myScopeB"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeC", "myScopeD"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeC", "myScopeA"], "dummyClient", [policy]).decide());
            }
            {
                let varInits = "A:=false; B:=false; C:=true;"
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["myScopeB"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeC"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeC", "myScopeB"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeA"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeB", "myScopeA"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeA", "myScopeB"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeC", "myScopeD"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScopeC", "myScopeA"], "dummyClient", [policy]).decide());
            }
        });
    });

    describe("recursive parentheses", () => {
        it("depth of two", () => {
            let expression = parenthesesTestData[6].code;
            {
                let varInits = "var_ref:=true;";
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["dummyScope"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScope"], "myClient", [policy]).decide());
                ok(new ExecutionController(["myScope", "myScopeB"], "superProvider", [policy]).decide());
                ok(new ExecutionController(["myScope"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["dummyScope", "myScope"], "dummyClient", [policy]).decide());
            }
            {
                let varInits = "var_ref:=false;";
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(!new ExecutionController(["dummyScope"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["dummyScope"], "myClient", [policy]).decide());
                ok(new ExecutionController(["myScope"], "superProvider", [policy]).decide());
                ok(new ExecutionController(["myScope"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["dummyScope", "myScope"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["myScope"], "myClient", [policy]).decide());
            }
        });

        it("depth of three", () => {
            let expression = parenthesesTestData[7].code;
            {
                let varInits = "allow:=false; deny:=false;";
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["ScopeB", "myScope"], "myClient", [policy]).decide());
                ok(new ExecutionController(["myScope"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["ScopeB"], "otherClient", [policy]).decide());
                ok(new ExecutionController(["ScopeB"], "myClient", [policy]).decide());
                ok(new ExecutionController(["dummyScope"], "superProvider", [policy]).decide());

                ok(!new ExecutionController(["dummyScope", "scopeD"], "superProvider", [policy]).decide());
                ok(!new ExecutionController(["scopeC"], "superProvider", [policy]).decide());
                ok(!new ExecutionController(["myScope", "ScopeB"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["otherScope"], "superProvider", [policy]).decide());
                ok(!new ExecutionController(["otherScope"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["ScopeB"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["ScopeB"], "superProvider", [policy]).decide());
            }
            {
                let varInits = "allow:=true; deny:=false;";
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["ScopeC"], "superProvider", [policy]).decide());
                ok(new ExecutionController(["ScopeC", "dummyScope"], "superProvider", [policy]).decide());
                ok(new ExecutionController(["ScopeB", "myScope"], "myClient", [policy]).decide());
                ok(new ExecutionController(["myScope"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["ScopeB"], "otherClient", [policy]).decide());
                ok(new ExecutionController(["ScopeB"], "myClient", [policy]).decide());
                ok(new ExecutionController(["dummyScope"], "superProvider", [policy]).decide());

                ok(!new ExecutionController(["dummyScope", "scopeD"], "superProvider", [policy]).decide());
                ok(!new ExecutionController(["myScope", "ScopeB"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["otherScope"], "superProvider", [policy]).decide());
                ok(!new ExecutionController(["otherrScope"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["ScopeB"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["ScopeB"], "superProvider", [policy]).decide());
            }
            {
                let varInits = "allow:=false; deny:=true;";
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["ScopeB", "myScope"], "myClient", [policy]).decide());
                ok(new ExecutionController(["myScope"], "dummyClient", [policy]).decide());
                ok(new ExecutionController(["ScopeB"], "otherClient", [policy]).decide());
                ok(new ExecutionController(["ScopeB"], "myClient", [policy]).decide());

                ok(!new ExecutionController(["ScopeC"], "superProvider", [policy]).decide());
                ok(!new ExecutionController(["ScopeC", "dummyScope"], "superProvider", [policy]).decide());
                ok(!new ExecutionController(["dummyScope"], "superProvider", [policy]).decide());
                ok(!new ExecutionController(["dummyScope", "scopeD"], "superProvider", [policy]).decide());
                ok(!new ExecutionController(["myScope", "ScopeB"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["otherScope"], "superProvider", [policy]).decide());
                ok(!new ExecutionController(["otherScope"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["ScopeB"], "dummyClient", [policy]).decide());
                ok(!new ExecutionController(["ScopeB"], "superProvider", [policy]).decide());
            }
        });

        it("depth of two plus 'allow'/'deny' variables at the beginning and the end", () => {
            let expression = parenthesesTestData[8].code;
            {
                let varInits = "allow:=false; permitAll:=false; deny := false;";
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["myScope"], "myClient", [policy]).decide());

                ok(!new ExecutionController(["dummyScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "superProvider", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "providerB", [policy]).decide());
                ok(!new ExecutionController(["myScope", "dummyScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "dummyClient", [policy]).decide());

            }
            {
                let varInits = "allow:=true; permitAll:=false; deny := false;";
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["myScope"], "myClient", [policy]).decide());

                ok(!new ExecutionController(["dummyScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "superProvider", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "providerB", [policy]).decide());
                ok(!new ExecutionController(["myScope", "dummyScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "dummyClient", [policy]).decide());

            }
            {
                let varInits = "allow:=false; permitAll:=true; deny := false;";
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["myScope"], "myClient", [policy]).decide());

                ok(!new ExecutionController(["dummyScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "superProvider", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "providerB", [policy]).decide());
                ok(!new ExecutionController(["myScope", "dummyScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "dummyClient", [policy]).decide());

            }
            {
                let varInits = "allow:=true; permitAll:=true; deny := false;";
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["myScope"], "superProvider", [policy]).decide());
                ok(new ExecutionController(["myScope", "anything", "i", "want"], "superProvider", [policy]).decide());
                ok(new ExecutionController(["myScope"], "providerB", [policy]).decide());
                ok(new ExecutionController(["myScope", "anything", "i", "want", "too"], "providerB", [policy]).decide());
                ok(new ExecutionController(["myScope"], "myClient", [policy]).decide());

                ok(!new ExecutionController(["dummyScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope", "dummyScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "dummyClient", [policy]).decide());
            }
            {
                let varInits = "allow:=false; permitAll:=false; deny := true;";
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(!new ExecutionController(["myScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["dummyScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "superProvider", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "providerB", [policy]).decide());
                ok(!new ExecutionController(["myScope", "dummyScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "dummyClient", [policy]).decide());
            }
            {
                let varInits = "allow:=true; permitAll:=false; deny := true;";
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(!new ExecutionController(["myScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["dummyScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "superProvider", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "providerB", [policy]).decide());
                ok(!new ExecutionController(["myScope", "dummyScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "dummyClient", [policy]).decide());

            }
            {
                let varInits = "allow:=false; permitAll:=true; deny := true;";
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(!new ExecutionController(["myScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["dummyScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "superProvider", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "providerB", [policy]).decide());
                ok(!new ExecutionController(["myScope", "dummyScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "dummyClient", [policy]).decide());

            }
            {
                let varInits = "allow:=true; permitAll:=true; deny := true;";
                let policy = buildPolicyWithGrantToken(expression, varInits);
                ok(new ExecutionController(["myScope"], "superProvider", [policy]).decide());
                ok(new ExecutionController(["myScope", "anything", "i", "want"], "superProvider", [policy]).decide());
                ok(new ExecutionController(["myScope"], "providerB", [policy]).decide());
                ok(new ExecutionController(["myScope", "anything", "i", "want", "too"], "providerB", [policy]).decide());

                ok(!new ExecutionController(["myScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["dummyScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope", "dummyScope"], "myClient", [policy]).decide());
                ok(!new ExecutionController(["myScope"], "dummyClient", [policy]).decide());
            }
        });
    });
});

