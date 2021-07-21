import 'reflect-metadata';

import { OidcCfg } from "../../../policy_engine/rest/util/oidc/identity_provider_settings";
import { DELETETestSuiteHttpHelper, GETTestSuiteHttpHelper, sendTestSuiteHttpHelper } from "../test_util/policy_suite_test_util";
import {
    initInMemoryDb,
    closeDb,
    readValidKeyPairs,
    buildIdPs,
    initData,
    generateIdToken,
    initServerWithIdPs,
} from "../test_util/rest_common_test_util";

import { isArray, isEmpty } from "lodash";
import { equal, ok } from "should";


async function createUpdateTestHelper(idToken: string, code: string, id: string) {
    await sendTestSuiteHttpHelper({
        token: idToken, code: code,
        expectedStatus: 400
    });
    await sendTestSuiteHttpHelper({
        token: idToken, code: code,
        id: id,
        expectedStatus: 400,
    });

}

describe("crud policy-test-suite tests", async () => {
    let idToken: string;

    before(async () => {
        await initInMemoryDb();
        let keyPair = readValidKeyPairs()[0];
        let idP: Map<string, OidcCfg> = buildIdPs([keyPair]);
        let user = (await initData(idP))[0];
        idToken = generateIdToken(user.iss, user.sub, keyPair.privateKey);
        initServerWithIdPs(idP);
    });


    it("create test-suite with missing http-params", async () => {
        let validCode = `{
            "name": "dummy-suite",
            "tests": []
        }`;
        await sendTestSuiteHttpHelper({
            token: idToken, expectedStatus: 400,
        });
        await sendTestSuiteHttpHelper({
            code: validCode, expectedStatus: 401,
        });
    });


    it("create test-suite with invalid JSON", async () => {
        let invalidCode = 'dsdsssd'
        await sendTestSuiteHttpHelper({
            token: idToken, code: invalidCode,
            expectedStatus: 400
        });
    });


    let createdDecisionTestSuite: any = null;
    it("create valid DECISION test-suite", async () => {
        let validCode = `{
            "name": "dummy-suite",
            "tests": [
                {
                    "scopes": ["scopeA", "scopeB"],
                    "client": "clientA",
                    "expectedResult": true,
                    "type": "DECISION"
                }
            ]
        }`;
        createdDecisionTestSuite = await sendTestSuiteHttpHelper({
            token: idToken, code: validCode,
            expectedStatus: 200,
        });
        equal(createdDecisionTestSuite.name, "dummy-suite");
        equal(createdDecisionTestSuite.orginalCode, validCode);
        ok(isArray(createdDecisionTestSuite.tests));
        equal(createdDecisionTestSuite.tests.length, 1);
    });


    let createdAccessTestSuite: any = null;
    it("create valid ACCESS test-suite", async () => {
        let validCode = `{
            "name": "dummy-suite",
            "tests": [{
                "type": "VALIDATION",
                "files": ["fileA", "fileB"],
                "expectedResult": true,
                "scopes": ["scopeA"]
            }]
        }`;
        createdAccessTestSuite = await sendTestSuiteHttpHelper({
            token: idToken, code: validCode,
            expectedStatus: 200,
        });
        equal(createdAccessTestSuite.name, "dummy-suite");
        equal(createdAccessTestSuite.orginalCode, validCode);
        ok(isArray(createdAccessTestSuite.tests));
        equal(createdAccessTestSuite.tests.length, 1);
    });


    it("create/update test-suite with empty test object", async () => {
        let invalidCode = `{
            "name": "dummy-suite",
            "tests": [
                {
                }
            ]
        }`;
        await createUpdateTestHelper(idToken, invalidCode, createdDecisionTestSuite._id);
    });


    it("create/update test-suite without name field", async () => {
        let invalidCode = `{
                "tests": []
            }`;
        await createUpdateTestHelper(idToken, invalidCode, createdDecisionTestSuite._id);
    });


    it("create/update test-suite without type filed", async () => {
        let invalidCode = `{
            "name": "dummy-suite",
            "tests": [
                {
                    "expectedResult": true
                }
            ]
        }`;
        await createUpdateTestHelper(idToken, invalidCode, createdDecisionTestSuite._id);
    });


    it("create/update test-suite without expectedResult", async () => {
        let invalidCode = `{
            "name": "dummy-suite",
            "tests": [
                {
                    "type": "DECISION"
                }
            ]
        }`;
        await createUpdateTestHelper(idToken, invalidCode, createdDecisionTestSuite._id);
    });


    it("create/update DECISION test-suite without scopes or client", async () => {
        let invalidCode = `{
            "name": "dummy-suite",
            "tests": [
                {
                    "expectedResult": true,
                    "type": "DECISION"
                }
            ]
        }`;
        await createUpdateTestHelper(idToken, invalidCode, createdDecisionTestSuite._id);
    });


    it("create/update ACCESS test-suite without files array", async () => {
        let invalidCode = `{
            "name": "dummy-suite",
            "tests": [
                {
                    "expectedResult": true,
                    "scopes": ["scopeA", "scopeB"],
                    "type": "VALIDATION"
                }
            ]
        }`;
        await createUpdateTestHelper(idToken, invalidCode, createdDecisionTestSuite._id);
    });


    it("create/update ACCESS test-suite without scopes array", async () => {
        let invalidCode = `{
            "name": "dummy-suite",
            "tests": [
                {
                    "expectedResult": true,
                    "files": ["fileA", "fileB"],
                    "type": "VALIDATION"
                }
            ]
        }`;
        await createUpdateTestHelper(idToken, invalidCode, createdDecisionTestSuite._id);
    });



    it("GET test-suite by Id with invalid http params", async () => {
        await GETTestSuiteHttpHelper({
            id: createdDecisionTestSuite._id, expectedStatus: 401
        });
        await GETTestSuiteHttpHelper({ expectedStatus: 401 });

        let dummyId = 'aaaabbbbccccddddeeeeffff';
        let suiteFromServer = await GETTestSuiteHttpHelper({
            token: idToken, id: dummyId, validId: false,
            expectedStatus: 200
        });
        equal(suiteFromServer, null);
    });


    it("GET test-suite by Id", async () => {
        let suiteFromServer = await GETTestSuiteHttpHelper({
            token: idToken, id: createdDecisionTestSuite._id, validId: true,
            expectedStatus: 200
        });
        equal(JSON.stringify(suiteFromServer), JSON.stringify(createdDecisionTestSuite));
    });


    it("GET test-suites", async () => {
        let suitesFromServer = await GETTestSuiteHttpHelper(
            { token: idToken, expectedStatus: 200 });
        ok(isArray(suitesFromServer));
        equal(suitesFromServer.length, 2);
        equal(JSON.stringify(suitesFromServer[0]), JSON.stringify(createdDecisionTestSuite));
        equal(JSON.stringify(suitesFromServer[1]), JSON.stringify(createdAccessTestSuite));
    });


    let updatedDecisionTestSuite: any = null;
    it("update test-suite", async () => {
        let name = 'updatedTestPolicy';
        let validCode = `{
            "name": "updated-dummy-suite",
            "tests": []
        }`;
        updatedDecisionTestSuite = await sendTestSuiteHttpHelper({
            token: idToken, code: validCode, name: name,
            id: createdDecisionTestSuite._id, expectedStatus: 200
        });
        equal(createdDecisionTestSuite._id, updatedDecisionTestSuite._id);
        equal(updatedDecisionTestSuite.orginalCode, validCode);
        ok(isArray(updatedDecisionTestSuite.tests));
        ok(isEmpty(updatedDecisionTestSuite.tests));
    });


    it("GET updated test-suite by Id", async () => {
        let policyFromServer = await GETTestSuiteHttpHelper({
            token: idToken, id: createdDecisionTestSuite._id, validId: true,
            expectedStatus: 200
        });
        equal(JSON.stringify(policyFromServer), JSON.stringify(updatedDecisionTestSuite));
    });



    it("GET updated test-suites", async () => {
        let suitesFromServer = await GETTestSuiteHttpHelper(
            { token: idToken, expectedStatus: 200 });
        ok(isArray(suitesFromServer));
        equal(suitesFromServer.length, 2);
        equal(JSON.stringify(suitesFromServer[0]), JSON.stringify(updatedDecisionTestSuite));
    });


    it("DELETE one test-suite", async () => {
        await DELETETestSuiteHttpHelper({
            token: idToken, suiteId: updatedDecisionTestSuite._id,
            expectedStatus: 200,
        });
        let suitesFromServer = await GETTestSuiteHttpHelper(
            { token: idToken, expectedStatus: 200 });
        ok(isArray(suitesFromServer));
        equal((suitesFromServer).length, 1);
    });


    after(async () => {
        await closeDb();
    });
});