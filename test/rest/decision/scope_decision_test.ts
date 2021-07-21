import 'reflect-metadata';

import { GrantedScope } from '../../../policy_engine/db/model/granted_scopes';
import { OidcCfg } from '../../../policy_engine/rest/util/oidc/identity_provider_settings';
import { GETDecisionTestHelper } from '../test_util/decision_test_util';
import { sendPolicyHttpHelper } from '../test_util/policy_test_util';
import {
    initInMemoryDb,
    closeDb,
    prepareGrantedScopes,
    clearPreviouslyGrantedScopes,
    clearPolicies,
    readValidKeyPairs,
    buildIdPs,
    initData,
    generateIdToken,
    initServerWithIdPs
} from "../test_util/rest_common_test_util";

import chai from 'chai';
import chaiHttp from 'chai-http'
import moment from 'moment';


describe('scope decision tests', async () => {
    chai.use(chaiHttp);
    let idToken: string;
    let user: any;
    before(async () => {
        await initInMemoryDb();
        let keyPair = readValidKeyPairs()[0];
        let idP: Map<string, OidcCfg> = buildIdPs([keyPair]);
        user = (await initData(idP))[0];
        idToken = generateIdToken(user.iss, user.sub, keyPair.privateKey);
        initServerWithIdPs(idP);
    });


    after(async () => {
        await closeDb();
    });


    describe("", async () => {
        before(async () => {
            let firstPolicy = `granttoken {
                scope = scopeA & !scope = scopeB & !scope = scopeC;
            }`;
            await sendPolicyHttpHelper({
                token: idToken, code: firstPolicy, name: "firstPolicy",
                expectedStatus: 200
            });
        });

        beforeEach(async () => {
            await clearPreviouslyGrantedScopes();
        });


        it("permit 'scopeA'", async () => {
            await GETDecisionTestHelper({
                scopes: "scopeA", clientId: "dummyClient",
                iss: user.iss, sub: user.sub,
                // iss: "http://test", sub: "myTestUser",
                expectedStatus: 200, expectedDecision: true,

            });
        });


        it("deny 'scopeB scopeC'", async () => {
            await GETDecisionTestHelper({
                scopes: "scopeB", clientId: "dummyClient",
                iss: user.iss, sub: user.sub,
                // iss: "http://test", sub: "myTestUser",
                expectedStatus: 200, expectedDecision: false,
            });
            await GETDecisionTestHelper({
                scopes: "scopeC", clientId: "dummyClient",
                iss: user.iss, sub: user.sub,
                // iss: "http://test", sub: "myTestUser",
                expectedStatus: 200, expectedDecision: false,
            });
            await GETDecisionTestHelper({
                scopes: "scopeB scopeC", clientId: "dummyClient",
                iss: user.iss, sub: user.sub,
                // iss: "http://test", sub: "myTestUser",
                expectedStatus: 200, expectedDecision: false,
            });
            await GETDecisionTestHelper({
                scopes: "scopeA scopeB scopeC", clientId: "dummyClient",
                iss: user.iss, sub: user.sub,
                // iss: "http://test", sub: "myTestUser",
                expectedStatus: 200, expectedDecision: false,
            });
        });


        it("deny 'scopeD'", async () => {
            await GETDecisionTestHelper({
                scopes: "scopeD", clientId: "dummyClient",
                iss: user.iss, sub: user.sub,
                // iss: "http://test", sub: "myTestUser",
                expectedStatus: 200, expectedDecision: false,
            });
            await GETDecisionTestHelper({
                scopes: "scopeA scopeD", clientId: "dummyClient",
                iss: user.iss, sub: user.sub,
                // iss: "http://test", sub: "myTestUser",
                expectedStatus: 200, expectedDecision: false,
            });
        });


        it("deny 'scopeA' with previosuly granted scopes", async () => {
            let now = new Date(Date.now());
            let previouslyGranted = [
                new GrantedScope({
                    scope: 'scopeB', date: now,
                    clientId: "dummyClient", userId: user._id
                }),
                new GrantedScope({
                    scope: 'scopeC', date: now,
                    clientId: "dummyClient", userId: user._id
                })
            ];
            await prepareGrantedScopes(previouslyGranted);
            await GETDecisionTestHelper({
                scopes: "scopeA", clientId: "dummyClient",
                iss: user.iss, sub: user.sub,
                expectedStatus: 200, expectedDecision: false,
            });

            await prepareGrantedScopes(previouslyGranted.slice(0, 1));
            await GETDecisionTestHelper({
                scopes: "scopeA", clientId: "dummyClient",
                iss: user.iss, sub: user.sub,
                expectedStatus: 200, expectedDecision: false,
            });

            await prepareGrantedScopes(previouslyGranted.slice(1, 2));
            await GETDecisionTestHelper({
                scopes: "scopeA", clientId: "dummyClient",
                iss: user.iss, sub: user.sub,
                expectedStatus: 200, expectedDecision: false,
            });
        });


        it("permit 'scopeA' with previosuly granted expired scopes", async () => {
            let fiveDaysAgo = moment().subtract(5, 'days').toDate()
            let previouslyGranted = [
                new GrantedScope({
                    scope: 'scopeB', date: fiveDaysAgo,
                    clientId: "dummyClient", userId: user._id
                }),
                new GrantedScope({
                    scope: 'scopeC', date: fiveDaysAgo,
                    clientId: "dummyClient", userId: user._id
                })
            ];
            await prepareGrantedScopes(previouslyGranted);
            await GETDecisionTestHelper({
                scopes: "scopeA", clientId: "dummyClient",
                iss: user.iss, sub: user.sub,
                expectedStatus: 200, expectedDecision: true,
            });

            await prepareGrantedScopes(previouslyGranted.slice(0, 1));
            await GETDecisionTestHelper({
                scopes: "scopeA", clientId: "dummyClient",
                iss: user.iss, sub: user.sub,
                expectedStatus: 200, expectedDecision: true,
            });

            await prepareGrantedScopes(previouslyGranted.slice(1, 2));
            await GETDecisionTestHelper({
                scopes: "scopeA", clientId: "dummyClient",
                iss: user.iss, sub: user.sub,
                expectedStatus: 200, expectedDecision: true,
            });
        });
    });


    describe('', async () => {
        before(async () => {
            let secondPolicy = `granttoken {
                scope = scopeA & scope = scopeB & scope = scopeC;
            }`;
            await clearPolicies();
            await sendPolicyHttpHelper({
                token: idToken, code: secondPolicy, name: "secondPolicy",
                expectedStatus: 200
            });
        });

        beforeEach(async () => {
            await clearPreviouslyGrantedScopes();
        });


        it("permit 'scopeA scopeB scopeC'", async () => {
            await GETDecisionTestHelper({
                scopes: "scopeA scopeB scopeC", clientId: "dummyClient",
                iss: user.iss, sub: user.sub,
                expectedStatus: 200, expectedDecision: true,
            });
        });


        it("deny 'scopeA', 'scopeB' or 'scopeC' individually", async () => {
            let testArray = [
                { scope: "scopea", expected: false },
                { scope: "scopeA scopeB", expected: false },
                { scope: "scopeB scopeC", expected: false },
                { scope: "scopeC", expected: false },
            ];
            for (let testData of testArray) {
                await GETDecisionTestHelper({
                    scopes: testData.scope, clientId: "dummyClient",
                    iss: user.iss, sub: user.sub,
                    expectedStatus: 200, expectedDecision: testData.expected,
                });
            }
        });


        it("permit 'scopeA scopeB scopeC' and after that individually", async () => {
            let testArray = [
                { scope: "scopeA scopeB scopeC", expected: true },
                { scope: "scopeA", expected: true },
                { scope: "scopeB", expected: true },
                { scope: "scopeC", expected: true },
            ];
            for (let testData of testArray) {
                await GETDecisionTestHelper({
                    scopes: testData.scope, clientId: "dummyClient",
                    iss: user.iss, sub: user.sub,
                    expectedStatus: 200, expectedDecision: testData.expected,
                });
            }
        });


        it("deny 'scopeA', 'scopeB' or 'scopeC' individually with previously granted expired scopes", async () => {
            let fiveDaysAgo = moment().subtract(5, 'days').toDate()
            let previouslyGranted = [
                new GrantedScope({
                    scope: 'scopeB', date: fiveDaysAgo,
                    clientId: "dummyClient", userId: user._id
                }),
                new GrantedScope({
                    scope: 'scopeC', date: fiveDaysAgo,
                    clientId: "dummyClient", userId: user._id
                })
            ];
            await prepareGrantedScopes(previouslyGranted);
            let testArray = [
                { scope: "scopea", expected: false },
                { scope: "scopeA scopeB", expected: false },
                { scope: "scopeB scopeC", expected: false },
                { scope: "scopeC", expected: false },
            ];
            for (let testData of testArray) {
                await GETDecisionTestHelper({
                    scopes: testData.scope, clientId: "dummyClient",
                    iss: user.iss, sub: user.sub,
                    expectedStatus: 200, expectedDecision: testData.expected,
                });
            }
        });
    });

    describe("policy with imports", async () => {
        before(async () => {
            await clearPolicies();
            await prepareMainPolicy();
            await prepareSubPolicyA();
            await prepareSubPolicyB();
        });
        beforeEach(async () => {
            await clearPreviouslyGrantedScopes();
        });


        async function prepareMainPolicy() {
            let mainPolicyCode = `
            import subPolicyA as subA;
            import subPolicyB as subB;
        
            granttoken {
                permit := false;
                permit := $subA.permitRule;
                permit := $subB.permitRule;
                permit;
            }`;
            await sendPolicyHttpHelper({
                token: idToken, code: mainPolicyCode, name: "mainPolicy",
                expectedStatus: 200
            });
        }
        
        
        async function prepareSubPolicyA() {
            let subPolicyACode = `
            permitRule : true {
                scope = scopeA & !scope = scopeB & !scope = scopeC;
                client = clientA;
            }`;
            await sendPolicyHttpHelper({
                token: idToken, code: subPolicyACode, name: "subPolicyA",
                expectedStatus: 200
            });
        }


        async function prepareSubPolicyB() {            
            let subPolicyBCode = `
            permitRule : true {
                scope = scopeC;
                client = clientB;
            }`;
            await sendPolicyHttpHelper({
                token: idToken, code: subPolicyBCode, name: "subPolicyB",
                expectedStatus: 200
            });
        }


        it("", async () => {
            let testArray = [
                { scope: "scopeA", expected: true, client: "clientA" },
                { scope: "scopeA scopeB", expected: false, client: "clientA" },
                { scope: "scopeA scopeC", expected: false, client: "clientA" },
                { scope: "scopeC", expected: false, client: "clientA" },
                { scope: "scopeC", expected: true, client: "clientB" },
            ];

            for (let testData of testArray) {
                await GETDecisionTestHelper({
                    scopes: testData.scope, clientId: testData.client,
                    iss: user.iss, sub: user.sub,
                    expectedStatus: 200, expectedDecision: testData.expected,
                });
            }
        });
    });

    after(async () => {
        await closeDb();
    });
});