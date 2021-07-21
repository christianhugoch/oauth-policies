import 'reflect-metadata';

import { OidcCfg } from "../../../policy_engine/rest/util/oidc/identity_provider_settings";
import { UserDoc} from "../../../policy_engine/db/model/user_schema";
import { sendPolicyHttpHelper } from "../test_util/policy_test_util";
import { GETfileAccessTestHelper, GETValidFilesTestHelper } from "../test_util/decision_test_util";
import {
    initInMemoryDb,
    closeDb,
    clearPolicies,
    generateIdToken,
    readValidKeyPairs,
    buildIdPs,
    initData,
    initServerWithIdPs,
} from "../test_util/rest_common_test_util";

import { ok } from "should";
import chai from "chai";
import chaiHttp from "chai-http"
import { isArray, isEmpty, isEqual } from "lodash";


describe("access decision tests", async () => {
    let idToken: string;
    let user: UserDoc;

    chai.use(chaiHttp);

    before(async () => {
        await initInMemoryDb();
        let keyPair = readValidKeyPairs()[0];
        let idP: Map<string, OidcCfg> = buildIdPs([keyPair]);
        user = (await initData(idP))[0];
        idToken = generateIdToken(user.iss, user.sub, keyPair.privateKey);
        initServerWithIdPs(idP);
    });


    describe("suite one", async () => {
        before(async () => {
            let code = `
                filessRule : file { 
                    files = fileA;
                    scope = scopeA; 
                }
                
                granttoken {
                    scope = scopeA; client = clientA;
                }
                `;
            await sendPolicyHttpHelper({
                token: idToken, code: code, name: "testPolicy",
                expectedStatus: 200
            });
        });


        it("list 'fileA' for 'scopeA'", async () => {
            let files = await GETValidFilesTestHelper({
                scopes: "scopeA", iss: user.iss, sub: user.sub,
                expectedStatus: 200,
            });
            ok(isEqual(files, ["fileA"]));
        });


        it("list 'fileA' for 'scopeA scopeB'", async () => {
            let files = await GETValidFilesTestHelper({
                scopes: "scopeA scopeB", iss: user.iss, sub: user.sub,
                expectedStatus: 200,
            });
            ok(isEqual(files, ["fileA"]));
        });


        it("list nothing for 'scopeB'", async () => {
            let files = await GETValidFilesTestHelper({
                scopes: "scopeB", iss: user.iss, sub: user.sub,
                expectedStatus: 200,
            });
            ok(isArray(files));
            ok(isEmpty(files));
        });


        it("call access decision service with missing http parameters", async () => {
            await GETfileAccessTestHelper({
                iss: user.iss, sub: user.sub,
                files: ["fileA"],
                expectedStatus: 400,
            });
            await GETfileAccessTestHelper({
                scopes: "scopeA", sub: user.sub,
                files: ["fileA"],
                expectedStatus: 400,
            });
            await GETfileAccessTestHelper({
                scopes: "scopeA", iss: user.iss,
                files: ["fileA"],
                expectedStatus: 400,
            });
            await GETfileAccessTestHelper({
                scopes: "scopeA", iss: user.iss, sub: user.sub,
                expectedStatus: 400,
            });
            await GETfileAccessTestHelper({
                expectedStatus: 400,
            });
        })


        it("permit 'fileA' for 'scopeA'", async () => {
            let decision = await GETfileAccessTestHelper({
                scopes: "scopeA", iss: user.iss, sub: user.sub,
                files: ["fileA"],
                expectedStatus: 200,
            });
            ok(decision);
        });


        it("permit 'fileA' for 'scopeA scopeB'", async () => {
            let decision = await GETfileAccessTestHelper({
                scopes: "scopeA scopeB", iss: user.iss, sub: user.sub,
                files: ["fileA"],
                expectedStatus: 200,
            });
            ok(decision);
        });


        it("deny 'fileA' for 'scopeB'", async () => {
            let decision = await GETfileAccessTestHelper({
                scopes: "scopeB", iss: user.iss, sub: user.sub,
                files: ["fileA"],
                expectedStatus: 200,
            });
            ok(!decision);
        });
    });


    describe("suite one", async () => {
        before(async () => {
            await clearPolicies();
            let filePolicyA = `
                filessRuleA : file { 
                    files = fileA, fileB, fileC;
                    scope = scopeA; 
                }`;
            await sendPolicyHttpHelper({
                token: idToken, code: filePolicyA, name: "filePolicyA",
                expectedStatus: 200
            });

            let filePolicyB = `
                filessRuleB : file { 
                    files = fileD, fileE, fileF;
                    scope = scopeB; 
                }`;
            await sendPolicyHttpHelper({
                token: idToken, code: filePolicyB, name: "filePolicyB",
                expectedStatus: 200
            });

            let scopeDecisionPolicy = `                                
                permitRuleA : true {
                    scope = scopeA; client = clientA;
                }

                permitRuleB : true {
                    scope = scopeB; client = clientB;
                }

                granttoken {
                    permit := false;
                    permit := $permitRuleA;
                    permit := $permitRuleB;
                    permit;
                }`;
            await sendPolicyHttpHelper({
                token: idToken, code: scopeDecisionPolicy, name: "decisionPolicy",
                expectedStatus: 200
            });
        });


        it("list 'fileA' for 'scopeA'", async () => {
            let files = await GETValidFilesTestHelper({
                scopes: "scopeA", iss: user.iss, sub: user.sub,
                expectedStatus: 200,
            });
            ok(isEqual(files, ["fileA", "fileB", "fileC"]));
        });


        it("list 'fileA fileB fileC' for 'scopeA scopeC'", async () => {
            let files = await GETValidFilesTestHelper({
                scopes: "scopeA", iss: user.iss, sub: user.sub,
                expectedStatus: 200,
            });
            ok(isEqual(files, ["fileA", "fileB", "fileC"]));
        });


        it("list files 'A-F' for 'scopeA scopeB'", async () => {
            let files = await GETValidFilesTestHelper({
                scopes: "scopeA scopeB", iss: user.iss, sub: user.sub,
                expectedStatus: 200,
            });
            ok(isEqual(files, ["fileA", "fileB", "fileC", "fileD", "fileE", "fileF"]));
        });


        it("list files 'A-F' for 'scopeA scopeB scopeC'", async () => {
            let files = await GETValidFilesTestHelper({
                scopes: "scopeA scopeB scopeC", iss: user.iss, sub: user.sub,
                expectedStatus: 200,
            });
            ok(isEqual(files, ["fileA", "fileB", "fileC", "fileD", "fileE", "fileF"]));
        });


        it("list nothing for 'scopeC'", async () => {
            let files = await GETValidFilesTestHelper({
                scopes: "scopeC", iss: user.iss, sub: user.sub,
                expectedStatus: 200,
            });
            ok(isArray(files));
            ok(isEmpty(files));
        });


        it("permit 'fileA fileB fileC' for 'scopeA'", async () => {
            let decision = await GETfileAccessTestHelper({
                scopes: "scopeA", iss: user.iss, sub: user.sub,
                files: ["fileA"],
                expectedStatus: 200,
            });
            ok(decision);

            decision = await GETfileAccessTestHelper({
                scopes: "scopeA", iss: user.iss, sub: user.sub,
                files: ["fileB"],
                expectedStatus: 200,
            });
            ok(decision);

            decision = await GETfileAccessTestHelper({
                scopes: "scopeA", iss: user.iss, sub: user.sub,
                files: ["fileC"],
                expectedStatus: 200,
            });
            ok(decision);

            decision = await GETfileAccessTestHelper({
                scopes: "scopeA", iss: user.iss, sub: user.sub,
                files: ["fileA fileB fileC"],
                expectedStatus: 200,
            });
            ok(decision);
        });


        it("permit 'fileA fileB fileC' for 'scopeA scopeC'", async () => {
            let decision = await GETfileAccessTestHelper({
                scopes: "scopeA scopeC", iss: user.iss, sub: user.sub,
                files: ["fileA"],
                expectedStatus: 200,
            });
            ok(decision);

            decision = await GETfileAccessTestHelper({
                scopes: "scopeA scopeC", iss: user.iss, sub: user.sub,
                files: ["fileB"],
                expectedStatus: 200,
            });
            ok(decision);

            decision = await GETfileAccessTestHelper({
                scopes: "scopeA scopeC", iss: user.iss, sub: user.sub,
                files: ["fileC"],
                expectedStatus: 200,
            });
            ok(decision);

            decision = await GETfileAccessTestHelper({
                scopes: "scopeA scopeC", iss: user.iss, sub: user.sub,
                files: ["fileA fileB fileC"],
                expectedStatus: 200,
            });
            ok(decision);
        });



        it("permit files 'A-F' for 'scopeA scopeB'", async () => {
            let decision = await GETfileAccessTestHelper({
                scopes: "scopeA scopeB", iss: user.iss, sub: user.sub,
                files: ["fileA fileB fileC fileD fileE fileF"],
                expectedStatus: 200,
            });
            ok(decision);
        });


        it("deny files 'A-F' for 'scopeC'", async () => {
            let arr = ["fileA fileB fileC fileD fileE fileF"];
            for (let file of arr) {
                let decision = await GETfileAccessTestHelper({
                    scopes: "scopeC", iss: user.iss, sub: user.sub,
                    files: [file],
                    expectedStatus: 200,
                });
                ok(!decision);
            }
            let decision = await GETfileAccessTestHelper({
                scopes: "scopeC", iss: user.iss, sub: user.sub,
                files: arr,
                expectedStatus: 200,
            });
            ok(!decision);
        });
    });

    after(async () => {
        await closeDb();
    });
});