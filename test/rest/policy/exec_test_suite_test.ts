import 'reflect-metadata';

import { OidcCfg } from "../../../policy_engine/rest/util/oidc/identity_provider_settings";
import { sendTestSuiteHttpHelper } from "../test_util/policy_suite_test_util";
import { executePolicyHttpHelper, sendPolicyHttpHelper } from "../test_util/policy_test_util";
import {
    initInMemoryDb,
    readValidKeyPairs,
    buildIdPs,
    initData,
    generateIdToken,
    initServerWithIdPs,
    closeDb,
    clearPoliciesAndTests,
} from "../test_util/rest_common_test_util";

import { isArray, isEqual } from "lodash";
import { equal, ok } from "should";


async function createSuite(idToken: any, code: string): Promise<any> {
    return await sendTestSuiteHttpHelper({
        token: idToken, code: code,
        expectedStatus: 200,
    });
}


async function createPolicy(idToken: any, code: string, name: string): Promise<any> {
    return await sendPolicyHttpHelper({
        token: idToken, code: code, name: name,
        expectedStatus: 200
    });
}


async function updatePolicy(idToken: any, id: string, code: string, name: string) {
    return await sendPolicyHttpHelper({
        token: idToken, code: code, name: name, id: id,
        expectedStatus: 200
    })
}


function checkSuiteResult(suiteResult: any, expected: any) {
    equal(suiteResult.success, expected.success);
    equal(suiteResult.statistics.successfulChecks,
        expected.successfulChecks);
    equal(suiteResult.statistics.failures,
        expected.failures);
    let testResults = suiteResult.results;
    ok(isArray(testResults));
    equal(testResults.length, expected.results.length);
    for (let i = 0; i < testResults.length; i++) {
        equal(testResults[i].expected, expected.results[i].expected);
        equal(testResults[i].actual, expected.results[i].actual);
        ok(isEqual(testResults[i].scopes, expected.results[i].scopes));
        if (expected.results[i].type === "DECISION") {
            equal(testResults[i].client, expected.results[i].client);
        }
        else if (expected.results[i].type === "VALIDATION") {
            ok(isEqual(testResults[i].files, expected.results[i].files));
        }
    }
}


describe('execute policy-test-suite tests', async () => {
    let idToken: string;

    before(async () => {
        await initInMemoryDb();
        let keyPair = readValidKeyPairs()[0];
        let idP: Map<string, OidcCfg> = buildIdPs([keyPair]);
        let user = (await initData(idP))[0];
        idToken = generateIdToken(user.iss, user.sub, keyPair.privateKey);
        initServerWithIdPs(idP);
    });

    beforeEach(async () => {
        await clearPoliciesAndTests();
    });


    // execute one suite with one DECISION test
    {
        let createdPolicy: any = null;
        it("execute one suite with one DECISION test", async () => {
            await prepareSuccessData();
            await checkSUccess();
            await prepareFailureData();
            await checkFailure();
        });


        async function checkSUccess() {
            let suiteResults = await executePolicyHttpHelper({
                token: idToken, expectedStatus: 200
            });
            ok(isArray(suiteResults));
            equal(suiteResults.length, 1);
            checkSuiteResult(suiteResults[0], {
                success: true, successfulChecks: 1, failures: 0,
                results: [{
                    expected: true, actual: true,
                    scopes: ["scopeA", "scopeB"],
                    client: "clientA",
                    type: 'DECISION'
                }]
            });
        }


        async function checkFailure() {
            let suiteResults = await executePolicyHttpHelper({
                token: idToken, expectedStatus: 200
            });
            ok(isArray(suiteResults));
            equal(suiteResults.length, 1);
            checkSuiteResult(suiteResults[0], {
                success: false, successfulChecks: 0, failures: 1,
                results: [{
                    expected: true, actual: false,
                    scopes: ["scopeA", "scopeB"],
                    client: "clientA",
                    type: 'DECISION'
                }]
            });

        }

        async function prepareSuccessData() {
            await createSuite(idToken, `{
                "name": "dummy-suite",
                "tests": [
                    {
                        "scopes": ["scopeA", "scopeB"],
                        "client": "clientA",
                        "expectedResult": true,
                        "type": "DECISION"
                    }
                ]
            }`);
            createdPolicy = await createPolicy(idToken, `
                granttoken { 
                    (scope = scopeA | scope = scopeB) & client = clientA;

                }`, 'testPolicy');
        }


        async function prepareFailureData() {
            let code = `
                granttoken { 
                   scope = scopea & client = clientA;

                }`;
            await updatePolicy(idToken, createdPolicy._id, code, createdPolicy.name);
        }
    }


    // execute one suite with multiple DECISION tests
    {
        let createdPolicy: any = null;
        it("execute one suite with multiple DECISION tests", async () => {
            await prepareSuccessData();
            await checkSuccess();
            await prepareFailureData();
            await checkFailure();
        });


        async function checkSuccess() {
            let suiteResults = await executePolicyHttpHelper({
                token: idToken, expectedStatus: 200
            });
            ok(isArray(suiteResults));
            equal(suiteResults.length, 1);
            checkSuiteResult(suiteResults[0], {
                success: true, successfulChecks: 6, failures: 0,
                results: [
                    {
                        expected: true, actual: true,
                        scopes: ["scopeA", "scopeB"],
                        client: "clientA",
                        type: 'DECISION'
                    },
                    {
                        expected: false, actual: false,
                        scopes: ["scopeA", "scopeB"],
                        client: "clientB",
                        type: 'DECISION'
                    },
                    {
                        expected: true, actual: true,
                        scopes: ["scopeA"],
                        client: "clientA",
                        type: 'DECISION'
                    },
                    {
                        expected: false, actual: false,
                        scopes: ["scopeA"],
                        client: "clientB",
                        type: 'DECISION'
                    },
                    {
                        expected: false, actual: false,
                        scopes: ["scopeA", "scopeB", "scopeC"],
                        client: "clientA",
                        type: 'DECISION'
                    },
                    {
                        expected: false, actual: false,
                        scopes: ["scopeA", "scopeB", "scopeC"],
                        client: "clientB",
                        type: 'DECISION'
                    },
                ]
            });
        }


        async function prepareSuccessData() {
            await createSuite(idToken, `{
                "name": "dummy-suite",
                "tests": [
                    {
                        "scopes": ["scopeA", "scopeB"],
                        "client": "clientA",
                        "expectedResult": true,
                        "type": "DECISION"
                    },
                    {
                        "scopes": ["scopeA", "scopeB"],
                        "client": "clientB",
                        "expectedResult": false,
                        "type": "DECISION"
                    },
                    {
                        "scopes": ["scopeA"],
                        "client": "clientA",
                        "expectedResult": true,
                        "type": "DECISION"
                    },
                    {
                        "scopes": ["scopeA"],
                        "client": "clientB",
                        "expectedResult": false,
                        "type": "DECISION"
                    },
                    {
                        "scopes": ["scopeA", "scopeB", "scopeC"],
                        "client": "clientA",
                        "expectedResult": false,
                        "type": "DECISION"
                    },
                    {
                        "scopes": ["scopeA", "scopeB", "scopeC"],
                        "client": "clientB",
                        "expectedResult": false,
                        "type": "DECISION"
                    }
                ]
            }`);
            createdPolicy = await createPolicy(idToken, `
                granttoken { 
                    (scope = scopeA | scope = scopeB) & client = clientA;

                }`, 'testPolicy'
            );
        }


        async function checkFailure() {
            let suiteResults = await executePolicyHttpHelper({
                token: idToken, expectedStatus: 200
            });
            ok(isArray(suiteResults));
            equal(suiteResults.length, 1);
            checkSuiteResult(suiteResults[0], {
                success: false, successfulChecks: 4, failures: 2,
                results: [
                    {
                        expected: true, actual: false,
                        scopes: ["scopeA", "scopeB"],
                        client: "clientA",
                        type: 'DECISION'
                    },
                    {
                        expected: false, actual: false,
                        scopes: ["scopeA", "scopeB"],
                        client: "clientB",
                        type: 'DECISION'
                    },
                    {
                        expected: true, actual: true,
                        scopes: ["scopeA"],
                        client: "clientA",
                        type: 'DECISION'
                    },
                    {
                        expected: false, actual: true,
                        scopes: ["scopeA"],
                        client: "clientB",
                        type: 'DECISION'
                    },
                    {
                        expected: false, actual: false,
                        scopes: ["scopeA", "scopeB", "scopeC"],
                        client: "clientA",
                        type: 'DECISION'
                    },
                    {
                        expected: false, actual: false,
                        scopes: ["scopeA", "scopeB", "scopeC"],
                        client: "clientB",
                        type: 'DECISION'
                    },
                ]
            });

        }


        async function prepareFailureData() {
            let code = `
                granttoken { 
                   scope = scopeA & ( client = clientA | client = clientB);

                }`;
            createdPolicy = await updatePolicy(
                idToken, createdPolicy._id, code, createdPolicy.name);
        }
    }


    // execute mutltiple suites with multiple policies and mixed test types
    {
        it("execute mutltiple suites with multiple policies", async () => {
            await prepareData();
            let suiteResults = await executePolicyHttpHelper({
                token: idToken, expectedStatus: 200
            });
            ok(isArray(suiteResults));
            equal(suiteResults.length, 3);
        });

        async function prepareData() {
            await preparePolicies();
            await prepareFirstSuite();
            await prepareSecondSuite();
            await prepareThirdSuite();

        }
        async function preparePolicies() {

            await createPolicy(idToken, `
            myRule { 
                (scope = scopeA | scope = scopeB) & client = clientA;

            }`, 'secondPolicy');

            await createPolicy(idToken, `
                import secondPolicy as p;
                granttoken { 
                    $p.myRule;
                }`, 'firstPolicy');

        }

        async function prepareFirstSuite() {
            await createSuite(idToken, `{
                "name": "dummy-suite",
                "tests": [
                    {
                        "scopes": ["scopeA", "scopeB"],
                        "client": "clientA",
                        "expectedResult": true,
                        "type": "DECISION"
                    }
                ]
            }`);
        }

        async function prepareSecondSuite() {
            await createSuite(idToken, `{
                "name": "dummy-suite",
                "tests": [
                    {
                        "scopes": ["scopeA", "scopeB"],
                        "client": "clientA",
                        "expectedResult": true,
                        "type": "DECISION"
                    },
                    {
                        "scopes": ["scopeA", "scopeB"],
                        "client": "clientB",
                        "expectedResult": false,
                        "type": "DECISION"
                    },
                    {
                        "scopes": ["scopeA"],
                        "client": "clientA",
                        "expectedResult": true,
                        "type": "DECISION"
                    }
                ] }`
            );

        }
        async function prepareThirdSuite() {
            await createSuite(idToken, `{
                "name": "dummy-suite",
                "tests": [
                    {
                        "scopes": ["scopeA", "scopeB"],
                        "client": "clientA",
                        "expectedResult": true,
                        "type": "DECISION"
                    },
                    {
                        "scopes": ["scopeA", "scopeB"],
                        "client": "clientB",
                        "expectedResult": false,
                        "type": "DECISION"
                    },
                    {
                        "scopes": ["scopeA"],
                        "client": "clientA",
                        "expectedResult": true,
                        "type": "DECISION"
                    }
                ] }`
            );
        }
    }


    // execute one suite with multiple ACCESS and DECISION tests
    {
        let createdPolicy: any = null;
        it("execute one suite withmultiple ACCESS and DECISION tests", async () => {
            await prepareSuccessData();
            await checkSuccess();
            await prepareFailureData();
            await checkFailure();
        });

        async function prepareSuccessData() {
            await createSuite(idToken, `{
                "name": "dummy-suite",
                "tests": [
                    {
                        "scopes": ["scopeA"],
                        "files": ["fileA"],
                        "expectedResult": true,
                        "type": "VALIDATION"
                    },
                    {
                        "scopes": ["scopeA"],
                        "files": ["fileB"],
                        "expectedResult": false,
                        "type": "VALIDATION"
                    },
                    {
                        "scopes": ["scopeA"],
                        "files": ["fileA", "fileB"],
                        "expectedResult": false,
                        "type": "VALIDATION"
                    },
                    {
                        "scopes": ["scopeB"],
                        "files": ["fileA"],
                        "expectedResult": false,
                        "type": "VALIDATION"
                    },
                    {
                        "scopes": ["scopeA"],
                        "client": "clientA",
                        "expectedResult": true,
                        "type": "DECISION"
                    },
                    {
                        "scopes": ["scopeA"],
                        "client": "clientB",
                        "expectedResult": false,
                        "type": "DECISION"
                    }
                ]
            }`);
            createdPolicy = await createPolicy(idToken, `
                filessRule : file { 
                    files = fileA;
                    scope = scopeA; 
                }

                granttoken {
                    scope = scopeA; client = clientA;
                }
                `, 'testPolicy'
            );
        }

        async function checkSuccess() {
            let suiteResults = await executePolicyHttpHelper({
                token: idToken, expectedStatus: 200
            });
            ok(isArray(suiteResults));
            equal(suiteResults.length, 1);
            checkSuiteResult(suiteResults[0], {
                success: true, successfulChecks: 6, failures: 0,
                results: [
                    {
                        expected: true, actual: true,
                        scopes: ["scopeA"],
                        files: ["fileA"],
                        type: 'VALIDATION',
                    },
                    {
                        expected: false, actual: false,
                        scopes: ["scopeA"],
                        files: ["fileB"],
                        type: 'VALIDATION',
                    },
                    {
                        expected: false, actual: false,
                        scopes: ["scopeA"],
                        files: ["fileA", "fileB"],
                        type: 'VALIDATION',
                    },
                    {
                        expected: false, actual: false,
                        scopes: ["scopeB"],
                        files: ["fileA"],
                        type: 'VALIDATION',
                    },
                    {
                        expected: true, actual: true,
                        scopes: ["scopeA"],
                        client: "clientA",
                        type: 'DECISION',
                    },
                    {
                        expected: false, actual: false,
                        scopes: ["scopeA"],
                        client: "clientB",
                        type: 'DECISION',
                    },
                ]
            });
        }


        async function prepareFailureData() {
            updatePolicy(idToken, createdPolicy._id, `
                filessRule : file { 
                    files = fileB;
                    scope = scopeA; 
                }

                granttoken {
                    scope = scopeA; client = clientB;
                }        
            `, 'test-policy');
        }

        async function checkFailure() {
            let suiteResults = await executePolicyHttpHelper({
                token: idToken, expectedStatus: 200
            });
            ok(isArray(suiteResults));
            equal(suiteResults.length, 1);
            checkSuiteResult(suiteResults[0], {
                success: false, successfulChecks: 2, failures: 4,
                results: [
                    {
                        expected: true, actual: false,
                        scopes: ["scopeA"],
                        files: ["fileA"],
                        type: 'VALIDATION',
                    },
                    {
                        expected: false, actual: true,
                        scopes: ["scopeA"],
                        files: ["fileB"],
                        type: 'VALIDATION',
                    },
                    {
                        expected: false, actual: false,
                        scopes: ["scopeA"],
                        files: ["fileA", "fileB"],
                        type: 'VALIDATION',
                    },
                    {
                        expected: false, actual: false,
                        scopes: ["scopeB"],
                        files: ["fileA"],
                        type: 'VALIDATION',
                    },
                    {
                        expected: true, actual: false,
                        scopes: ["scopeA"],
                        client: "clientA",
                        type: 'DECISION',
                    },
                    {
                        expected: false, actual: true,
                        scopes: ["scopeA"],
                        client: "clientB",
                        type: 'DECISION',
                    },
                ]
            });
        }
    }

    after(async () => {
        await closeDb();
    });
});