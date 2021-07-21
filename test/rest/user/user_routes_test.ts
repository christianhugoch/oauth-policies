import 'reflect-metadata';

import { OidcCfg } from "../../../policy_engine/rest/util/oidc/identity_provider_settings";
import { UserDoc } from "../../../policy_engine/db/model/user_schema";
import { GETLinkedUserTestHelper, sendUserHelper } from "../test_util/user_test_util";
import {
    clearDb,
    buildIdPs,
    generateIdToken,
    initInMemoryDb,
    initServerWithIdPs,
    readValidKeyPairs,
    closeDb,
} from "../test_util/rest_common_test_util";

import { isEqual } from "lodash";
import { equal, notEqual, ok } from "should";
import moment from "moment";


describe("user routes", () => {
    let idPCfg: OidcCfg;
    let validKeyPair: any;
    let createdUser: UserDoc;


    function checkUserMatch(oldUser: any, newUser: any) {
        equal(oldUser._id, newUser._id);
        equal(oldUser.iss, newUser.iss);
        equal(oldUser.sub, newUser.sub);

        equal(newUser._id, createdUser._id);
        equal(newUser.iss, createdUser.iss);
        equal(newUser.sub, createdUser.sub);
    }

    before(async () => {
        await initInMemoryDb();
        await clearDb();
        let keyPairs = readValidKeyPairs();
        let idP: Map<string, OidcCfg> = buildIdPs(keyPairs);
        initServerWithIdPs(idP);
        validKeyPair = keyPairs[0];
        idPCfg = [...idP.values()][0];
    });

    it("POST linked user with invalid identity provider name", async () => {
        let idToken = generateIdToken(
            idPCfg.issuer, 'myTestUser', validKeyPair.privateKey);
        createdUser = await sendUserHelper({
            token: idToken, expectedStatus: 400, idPName: "invalidIdPName",
            url: "/user/linkedUser", method: "POST",
        });
    });


    it("POST linked user", async () => {
        let subject = 'myTestUser';
        let idToken = generateIdToken(
            idPCfg.issuer, subject, validKeyPair.privateKey);
        createdUser = await sendUserHelper({
            token: idToken, expectedStatus: 200, idPName: idPCfg.name,
            url: "/user/linkedUser", method: "POST",
        });
        equal(createdUser.iss, idPCfg.issuer);
        equal(createdUser.sub, subject);
        equal(createdUser.lastLogin, null);
        equal(createdUser.lastLogout, null);
        equal(createdUser.currentLogin, null);
    });

    it("PUT login statistics (first time)", async () => {
        let now = Date.now();
        let allowedTimeDiff = 100;
        let idToken = generateIdToken(
            idPCfg.issuer, createdUser.sub, validKeyPair.privateKey);

        let oldUser = createdUser;
        let newLoggedInUser = await sendUserHelper({
            token: idToken, expectedStatus: 200, idPName: idPCfg.name,
            url: "/user/loginStats",
        });
        checkUserMatch(oldUser, newLoggedInUser);

        let currentLogin = moment(newLoggedInUser.currentLogin);
        let lastLogin = moment(newLoggedInUser.lastLogin);
        ok(currentLogin.isValid());
        ok(isEqual(currentLogin, lastLogin));
        (currentLogin.valueOf() - now).should.be.lessThan(allowedTimeDiff);
        equal(newLoggedInUser.lastLogout, null);

        let userFromServer = await GETLinkedUserTestHelper(idToken, 200);
        ok(isEqual(newLoggedInUser, userFromServer));
    });


    it("another client calls the login service, the first login statistic does not change",
        async () => {
            let idToken = generateIdToken(
                idPCfg.issuer, createdUser.sub, validKeyPair.privateKey);
            let oldUser = await GETLinkedUserTestHelper(idToken, 200);
            let newUser = await sendUserHelper({
                token: idToken, expectedStatus: 200, idPName: idPCfg.name,
                url: "/user/loginStats",
            });
            checkUserMatch(oldUser, newUser);
            ok(isEqual(oldUser, newUser));
        });


    it("PUT logout statistics (first time)", async () => {
        let allowedTimeDiff = 100;
        let idToken = generateIdToken(
            idPCfg.issuer, createdUser.sub, validKeyPair.privateKey);

        let loggedInUser = await GETLinkedUserTestHelper(idToken, 200);
        let now = Date.now();
        let newLoggedOutUser = await sendUserHelper({
            token: idToken, expectedStatus: 200, url: "/user/logoutStats"
        });
        checkUserMatch(loggedInUser, newLoggedOutUser);

        let lastLogout = moment(newLoggedOutUser.lastLogout);
        ok(lastLogout.isValid());
        (lastLogout.valueOf() - now).should.be.lessThan(allowedTimeDiff);
        equal(newLoggedOutUser.currentLogin, null);

        oldUser = newLoggedOutUser;
    });
    let oldUser: any;

    it("PUT login statistics (second time)", async () => {
        let allowedTimeDiff = 100;

        let idToken = generateIdToken(
            idPCfg.issuer, createdUser.sub, validKeyPair.privateKey);

        await GETLinkedUserTestHelper(idToken, 403);
        let now = Date.now();
        let newLoggedInUser = await sendUserHelper({
            token: idToken, expectedStatus: 200, idPName: idPCfg.name,
            url: "/user/loginStats",
        });
        checkUserMatch(oldUser, newLoggedInUser);

        ok(!moment(oldUser.currentLogin).isValid());
        equal(oldUser.lastLogin, newLoggedInUser.lastLogin);
        equal(oldUser.lastLogout, newLoggedInUser.lastLogout);

        let currentLogin = moment(newLoggedInUser.currentLogin);
        ok(currentLogin.isValid());
        (currentLogin.valueOf() - now).should.be.lessThan(allowedTimeDiff);

        let lastLogin = moment(newLoggedInUser.lastLogin);
        ok(lastLogin.isValid());
        (lastLogin.valueOf()).should.be.lessThan(currentLogin.valueOf());

        let lastLogout = moment(newLoggedInUser.lastLogout);
        ok(lastLogout.isValid());
        (lastLogout.valueOf()).should.be.greaterThan(lastLogin.valueOf());
        (lastLogout.valueOf()).should.be.lessThan(currentLogin.valueOf());
    });


    it("another client calls the login service, the second login statistic does not change",
        async () => {
            let idToken = generateIdToken(
                idPCfg.issuer, createdUser.sub, validKeyPair.privateKey);
            let alreadyLoggedIn = await GETLinkedUserTestHelper(idToken, 200);
            let newUser = await sendUserHelper({
                token: idToken, expectedStatus: 200, idPName: idPCfg.name,
                url: "/user/loginStats",
            });
            checkUserMatch(alreadyLoggedIn, newUser);
            ok(isEqual(alreadyLoggedIn, newUser));
        });


    it("PUT logout statistics (second time)", async () => {
        let now = Date.now();
        let allowedTimeDiff = 100;
        let idToken = generateIdToken(
            idPCfg.issuer, createdUser.sub, validKeyPair.privateKey);

        let loggedInUser = await GETLinkedUserTestHelper(idToken, 200);
        let newLoggedOutUser = await sendUserHelper({
            token: idToken, expectedStatus: 200, url: "/user/logoutStats",
        });
        checkUserMatch(loggedInUser, newLoggedOutUser);

        notEqual(newLoggedOutUser.lastLogout, loggedInUser.lastLogout);
        notEqual(newLoggedOutUser.lastLogin, loggedInUser.lastLogin);
        notEqual(newLoggedOutUser.currentLogin, loggedInUser.currentLogin);

        equal(newLoggedOutUser.lastLogin, loggedInUser.currentLogin);
        equal(newLoggedOutUser.currentLogin, null);

        let lastLogout = moment(newLoggedOutUser.lastLogout);
        ok(lastLogout.isValid());
        (lastLogout.valueOf() - now).should.be.lessThan(allowedTimeDiff);
    });

    after(async () => {
        await closeDb();
    });
});