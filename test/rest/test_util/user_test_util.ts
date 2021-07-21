import { policyApp } from '../../../policy_engine/rest/server'
import chai from 'chai';
import { equal, ok } from 'should'


export async function GETLinkedUserTestHelper(token: string, expectedStatus: number) {
    let headers = token !== undefined ?
        { 'Authorization': 'id_token ' + token } : {};
    let response =
        await chai.request(policyApp).get("/user/linkedUser").set(headers).send();
    equal(response.status, expectedStatus);
    if (expectedStatus === 200) {
        ok(response.body !== undefined && response.body !== null);
        ok(response.body.user !== undefined && response.body.user !== null);
        return response.body.user;
    }
    return null;
}


export async function sendUserHelper(args: any) {
    let headers: any = args.token ?
        { 'Authorization': 'id_token ' + args.token, } : {};
    if (args.idPName) {
        headers.oidc_issuer = args.idPName;
    }
    let requester: any;
    if (args.method === "POST") {
        requester = chai.request(policyApp).post(args.url);
    }
    else {
        requester = chai.request(policyApp).put(args.url);
    }
    let response = await requester.set(headers).send();
    equal(response.status, args.expectedStatus);
    if (args.expectedStatus === 200) {
        ok(response.body !== undefined && response.body !== null);
        ok(response.body.user !== undefined && response.body.user !== null);
        return response.body.user;
    }
    return null;
}
