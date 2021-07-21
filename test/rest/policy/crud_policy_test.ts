import 'reflect-metadata';

import { OidcCfg } from "../../../policy_engine/rest/util/oidc/identity_provider_settings";
import { DELETEPolicyHttpHelper, GETPolicyHttpHelper, sendPolicyHttpHelper } from "../test_util/policy_test_util";
import {
    initInMemoryDb,
    closeDb,
    readValidKeyPairs,
    buildIdPs,
    initData,
    generateIdToken,
    initServerWithIdPs
} from "../test_util/rest_common_test_util";

import { isArray, isEmpty } from "lodash";
import { equal, ok } from "should";


describe('crud policy tests', async () => {
    let idToken: string;

    before(async () => {
        await initInMemoryDb();
        let keyPair = readValidKeyPairs()[0];
        let idP: Map<string, OidcCfg> = buildIdPs([keyPair]);
        let user = (await initData(idP))[0];
        idToken = generateIdToken(user.iss, user.sub, keyPair.privateKey);
        initServerWithIdPs(idP);
    });


    it("create policy with missing http-params", async () => {
        let name = 'testPolicy';
        let validCode = 'granttoken { true; }'
        await sendPolicyHttpHelper(
            { token: idToken, name: name, expectedStatus: 400 });
        await sendPolicyHttpHelper(
            { token: idToken, code: validCode, expectedStatus: 400 });
        await sendPolicyHttpHelper(
            { token: idToken, expectedStatus: 400 });
        await sendPolicyHttpHelper({
            code: validCode, name: name,
            expectedStatus: 401
        });
    });


    it("create policy with invalid code", async () => {
        let name = 'testPolicy';
        let invalidCode = 'granttoken { scopeee = scopeA}'
        await sendPolicyHttpHelper({
            token: idToken, name: name, code: invalidCode,
            expectedStatus: 400
        });
    })


    let createdPolicy: any = null;
    it("create valid policy", async () => {
        let name = 'testPolicy';
        let code = 'granttoken { true; }'
        createdPolicy = await sendPolicyHttpHelper({
            token: idToken, code: code, name: name,
            expectedStatus: 200
        });
        equal(createdPolicy.name, name);
        equal(createdPolicy.code, code);
        equal(createdPolicy.policyObject.decisionRules.length, 1);
        ok(isEmpty(createdPolicy.policyObject.fileRules));
        ok(isEmpty(createdPolicy.policyObject.imports));
    });


    it("GET policy by Id with invalid http params", async () => {
        await GETPolicyHttpHelper({
            id: createdPolicy._id, expectedStatus: 401
        });
        await GETPolicyHttpHelper({ expectedStatus: 401 });
        let dummyId = 'aaaabbbbccccddddeeeeffff';
        let policyFromServer = await GETPolicyHttpHelper({
            token: idToken, id: dummyId, validId: false,
            expectedStatus: 200
        });
        equal(policyFromServer, null);
    });


    it("GET policy by Id", async () => {
        let policyFromServer = await GETPolicyHttpHelper({
            token: idToken, id: createdPolicy._id, validId: true,
            expectedStatus: 200
        });
        equal(JSON.stringify(policyFromServer), JSON.stringify(createdPolicy));
    });

    it("GET policies", async () => {
        let policiesFromServer = await GETPolicyHttpHelper(
            { token: idToken, expectedStatus: 200 });
        ok(isArray(policiesFromServer));
        equal(policiesFromServer.length, 1);
        equal(JSON.stringify(policiesFromServer[0]), JSON.stringify(createdPolicy));
    });

    let updatedPolicy: any = null;
    it("update policy", async () => {
        let name = 'updatedTestPolicy';
        let code = 'granttoken { false; }'
        updatedPolicy = await sendPolicyHttpHelper({
            token: idToken, code: code, name: name,
            id: createdPolicy._id, expectedStatus: 200
        });
        equal(createdPolicy._id, updatedPolicy._id);
        equal(updatedPolicy.name, name);
        equal(updatedPolicy.code, code);
        equal(updatedPolicy.policyObject.decisionRules.length, 1);
        ok(isEmpty(updatedPolicy.policyObject.fileRules));
        ok(isEmpty(updatedPolicy.policyObject.imports));
    });


    it("GET updated policy by Id", async () => {
        let policyFromServer = await GETPolicyHttpHelper({
            token: idToken, id: createdPolicy._id, validId: true,
            expectedStatus: 200
        });
        equal(JSON.stringify(policyFromServer), JSON.stringify(updatedPolicy));
    });

    it("GET updated policies", async () => {
        let policiesFromServer = await GETPolicyHttpHelper(
            { token: idToken, expectedStatus: 200 });
        ok(isArray(policiesFromServer));
        equal(policiesFromServer.length, 1);
        equal(JSON.stringify(policiesFromServer[0]), JSON.stringify(updatedPolicy));
    });


    it("DELETE one policy", async () => {
        await DELETEPolicyHttpHelper({
            token: idToken, policyId: updatedPolicy._id,
            expectedStatus: 200,
        });
        let policiesFromServer = await GETPolicyHttpHelper(
            { token: idToken, expectedStatus: 200 });
        ok(isArray(policiesFromServer));
        ok(isEmpty(policiesFromServer));
    });


    after(async () => {
        await closeDb();
    });
});



