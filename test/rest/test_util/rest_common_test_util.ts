import { OidcCfg } from '../../../policy_engine/rest/util/oidc/identity_provider_settings';
import { PolicyTestSuite } from '../../../policy_engine/db/model/policy_test_schema';
import { GrantedScope } from '../../../policy_engine/db/model/granted_scopes';
import { completeAppCfg } from './test_constants/cfg_constants';
import { UserDoc, User } from '../../../policy_engine/db/model/user_schema';
import { MongoosePolicy } from '../../../policy_engine/db/model/policy_schema';
import { parseConfiguration } from '../../../policy_engine/common/cfg/cfg_util';
import { initDecisionServer, initPolicyServer } from '../../../policy_engine/rest/server'

import { disconnect } from 'mongoose';
import { readFileSync } from 'fs';
import jwt, { SignOptions } from 'jsonwebtoken';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
let mongod: any = null;

export function generateIdToken(
    iss: string, sub: string, privateKey: string
): string {
    let signOptions: SignOptions = {
        issuer: iss,
        subject: sub,
        audience: 'engine/policy',
        expiresIn: '12h',
        algorithm: 'RS256'
    }
    return jwt.sign({}, privateKey, signOptions);
}


export function readKeyPair(issuerPrefix: string) {
    return {
        publicKey: readFileSync(
            `${__dirname}//keypairs//${issuerPrefix}_pub_key`, "utf-8"),
        privateKey: readFileSync(
            `${__dirname}//keypairs//${issuerPrefix}_priv_key`, "utf-8"),
    };
}


export function readInvalidKeyPair(): any {
    return readKeyPair("test_issuer_C");
}


export function readValidKeyPairs(): Array<any> {
    return [
        readKeyPair("test_issuer_A"),
        readKeyPair("test_issuer_B"),
    ];
}


export async function initInMemoryDb() {
    mongod = new MongoMemoryServer();
    const uri = await mongod.getUri();
    const mongooseOpts = {
        useNewUrlParser: true,
        autoReconnect: true,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 1000
    };
    await mongoose.connect(uri, mongooseOpts);
}


export function buildIdPs(keyPairs: Array<any>): Map<string, OidcCfg> {
    let result = new Map<string, OidcCfg>();
    let charCode = 'A'.charCodeAt(0);
    for (let keyPair of keyPairs) {
        let charSuffix = String.fromCharCode(charCode++);
        let issuerACfg = new OidcCfg(
            `http://test-issuer-${charSuffix}`, `test-issuer-${charSuffix}`,
            keyPair.publicKey, undefined, `clientId${charSuffix}`);
        result.set(issuerACfg.name, issuerACfg);
    }
    return result;
}


export function initServerWithIdPs(idPs: Map<string, OidcCfg>) {
    let cfgs = parseConfiguration(completeAppCfg);
    initPolicyServer({
        issuers: idPs, scopeValidities: cfgs.scopeValidities,
        nodeEnv: "test",
    });
    initDecisionServer({
        scopeValidities: cfgs.scopeValidities,
        nodeEnv: "test",
    });
}


export async function initData(idPs: Map<string, OidcCfg>): Promise<Array<UserDoc>> {
    await MongoosePolicy.remove({});
    await User.remove({});
    let createdUsers = new Array<UserDoc>();
    for (let idP of [...idPs.values()]) {
        createdUsers.push(await User.create({
            iss: idP.issuer, sub: 'myTestUser',
            lastLogin: new Date(Date.now()),
            lastLogout: new Date(Date.now()),
            currentLogin: new Date(Date.now()),
        }));
    }
    return createdUsers;
}


export async function clearDb() {
    await clearPoliciesAndTests();
    await User.remove({});
}


export async function clearPoliciesAndTests() {
    await MongoosePolicy.remove({});
    await PolicyTestSuite.remove({});
}


export async function clearPreviouslyGrantedScopes() {
    await GrantedScope.remove({});
}


export async function clearPolicies() {
    await MongoosePolicy.remove({});
}


export async function prepareGrantedScopes(docs: Array<any>) {
    await GrantedScope.remove({});
    await GrantedScope.insertMany(docs);
}


export async function closeDb() {
    await disconnect();
    await mongod.stop();
}