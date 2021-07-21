import 'reflect-metadata';

import { OidcCfg } from '../../../policy_engine/rest/util/oidc/identity_provider_settings';
import { sendPolicyHttpHelper } from '../test_util/policy_test_util';
import { sendUserHelper } from '../test_util/user_test_util';
import {
    buildIdPs,
    closeDb,
    generateIdToken,
    initInMemoryDb,
    initServerWithIdPs,
    initData,
    readInvalidKeyPair,
    readValidKeyPairs,
} from '../test_util/rest_common_test_util';

import { zip } from 'lodash';


describe("passport test", async () => {
    let validIdTokens = new Array<string>();
    let validKeyPairs: Array<any>;
    let idPs: Map<string, OidcCfg>;
    let invalidIdTokens = new Array<string>();

    before(async () => {
        await initInMemoryDb();
        validKeyPairs = readValidKeyPairs();
        idPs = buildIdPs(validKeyPairs);
        await initData(idPs);
        initServerWithIdPs(idPs);
        for (let zipped of zip(Array.from(idPs.values()), validKeyPairs)) {
            let idp: OidcCfg = zipped[0];
            let keyPair: any = zipped[1];
            validIdTokens.push(
                generateIdToken(idp.issuer, "myTestUser", keyPair.privateKey));
            invalidIdTokens.push(
                generateIdToken("dummyIssuer", "myTestUser", keyPair.privateKey));
            invalidIdTokens.push(
                generateIdToken(idp.issuer, "dummyUser", keyPair.privateKey));
        }
        let invalidKeyPair = readInvalidKeyPair();
        invalidIdTokens.push(
            generateIdToken("issuer", "myTestUser", invalidKeyPair.privateKey));
    });


    it("valid id tokens", async () => {
        let name = 'testPolicy';
        let code = 'granttoken { true; }'
        for (let validIdToken of validIdTokens) {
            await sendPolicyHttpHelper({
                token: validIdToken, code: code, name: name,
                expectedStatus: 200
            });
        }
    });


    it("invalid id tokens", async () => {
        let name = 'testPolicy';
        let code = 'granttoken { true; }'
        for (let invalidToken of invalidIdTokens.slice(0, invalidIdTokens.length - 1)) {
            await sendPolicyHttpHelper({
                token: invalidToken, code: code, name: name,
                expectedStatus: 403
            });
        }
        await sendPolicyHttpHelper({
            token: invalidIdTokens[invalidIdTokens.length - 1], code: code, name: name,
            expectedStatus: 401
        });
    });


    it("missing id token", async () => {
        let name = 'testPolicy';
        let code = 'granttoken { true; }'
        await sendPolicyHttpHelper({
            code: code, name: name,
            expectedStatus: 401
        });
    });


    it("the user is not logged in, send 403", async () => {
        let idP = idPs.values().next().value;
        let keyPair = validKeyPairs[0];
        let subject = "newUser";
        let token = generateIdToken(idP.issuer, subject, keyPair.privateKey);
        await sendUserHelper({
            token: token, expectedStatus: 200, idPName: idP.name,
            url: "/user/linkedUser", method: "POST",
        });
        let name = 'testPolicy';
        let code = 'granttoken { true; }'
        await sendPolicyHttpHelper({
            token: token, code: code, name: name,
            expectedStatus: 403
        });
        await sendUserHelper({
            token: token, expectedStatus: 200, idPName: idP.name,
            url: "/user/loginStats",
        });
        await sendPolicyHttpHelper({
            token: token, code: code, name: name,
            expectedStatus: 200,
        });
    });


    it("the account was not linked yed, send 403", async () => {
        let idP = idPs.values().next().value;
        let keyPair = validKeyPairs[0];
        let subject = "notLinkedUser";
        let token = generateIdToken(idP.issuer, subject, keyPair.privateKey);
        let name = 'testPolicy';
        let code = 'granttoken { true; }'
        await sendPolicyHttpHelper({
            token: token, code: code, name: name,
            expectedStatus: 403
        });
    });

    after(async () => {
        await closeDb();
    });
});