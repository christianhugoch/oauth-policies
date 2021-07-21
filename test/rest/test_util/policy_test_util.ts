import {policyApp} from '../../../policy_engine/rest/server'
import chai from 'chai';
import { equal, ok } from 'should'


export async function executePolicyHttpHelper(args: any) {
    let response = await chai.request(policyApp)
        .post('/policy_test_suite/exec')
        .set({ 'Authorization': 'id_token ' + args.token });
    equal(response.status, args.expectedStatus);
    if (args.expectedStatus === 200) {
        ok(response.body !== undefined && response.body !== null);
        ok(response.body.statistics !== undefined && response.body.statistics !== null);
        return response.body.statistics;
    }
    return null;
}


export async function sendPolicyHttpHelper(args: any): Promise<any> {
    let requester: any;
    let headers = args.token !== undefined ?
        { 'Authorization': 'id_token ' + args.token } : {};
    let params = Array<string>();
    if (args.name !== undefined) params.push(`name=${args.name}`);
    if (args.code !== undefined) params.push(`policy=${escape(args.code)}`);
    if (args.id !== undefined) {
        params.push(`policyId=${args.id}`)
        requester = chai.request(policyApp).put('/policy');
    }
    else {
        requester = chai.request(policyApp).post('/policy')
    }
    let response = await requester.set(headers).send(params.join('&'));
    equal(response.status, args.expectedStatus);
    if (args.expectedStatus === 200) {
        ok(response.body !== undefined && response.body !== null);
        ok(response.body.policy !== undefined && response.body.policy !== null);
        return response.body.policy;
    }
    return null;
}


export async function GETPolicyHttpHelper(args: any): Promise<any> {
    let headers = args.token !== undefined ?
        { 'Authorization': 'id_token ' + args.token } : {};
    let response = await chai.request(policyApp)
        .get(args.id !== undefined ? `/policy/${args.id}` : '/policy')
        .set(headers);
    equal(response.status, args.expectedStatus);
    if (args.expectedStatus === 200) {
        ok(response.body !== undefined && response.body !== null);
        if (args.id !== undefined) {
            equal(args.validId,
                response.body.policy !== undefined &&
                response.body.policy !== null);
            return response.body.policy;
        }
        ok(response.body.policies !== undefined &&
            response.body.policies !== null);
        return response.body.policies;
    }
    return null;
}


export async function DELETEPolicyHttpHelper(args: any) {
    let headers = args.token !== undefined ?
        { 'Authorization': 'id_token ' + args.token } : {};
    let response = await chai.request(policyApp)
        .delete(`/policy?id=${args.policyId}`)
        .set(headers);
    equal(response.status, args.expectedStatus);
}
