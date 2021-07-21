import { policyApp } from '../../../policy_engine/rest/server'
import chai from 'chai';
import { equal, ok } from 'should'


export async function sendTestSuiteHttpHelper(args: any): Promise<any> {
    let headers = args.token !== undefined ?
        { 'Authorization': 'id_token ' + args.token } : {};
    let requester: any;
    let params = Array<string>();
    if (args.name !== undefined) params.push(`name=${args.name}`);
    if (args.code !== undefined) params.push(`suite=${escape(args.code)}`);
    if (args.id !== undefined) {
        params.push(`id=${args.id}`)
        requester = chai.request(policyApp).put('/policy_test_suite');
    }
    else {
        requester = chai.request(policyApp).post('/policy_test_suite')
    }
    let response = await requester.set(headers).send(params.join('&'));
    equal(response.status, args.expectedStatus);
    if (args.expectedStatus === 200) {
        ok(response.body !== undefined && response.body !== null);
        ok(response.body.suite !== undefined && response.body.suite !== null);
        return response.body.suite;
    }
}


export async function DELETETestSuiteHttpHelper(args: any) {
    let headers = args.token !== undefined ?
        { 'Authorization': 'id_token ' + args.token } : {};
    let response = await chai.request(policyApp)
        .delete(`/policy_test_suite?id=${args.suiteId}`)
        .set(headers);
    equal(response.status, args.expectedStatus);
}


export async function GETTestSuiteHttpHelper(args: any): Promise<any> {
    let headers = args.token !== undefined ?
        { 'Authorization': 'id_token ' + args.token } : {};
    let response = await chai.request(policyApp)
        .get(args.id !== undefined ? `/policy_test_suite/${args.id}` : '/policy_test_suite')
        .set(headers);
    equal(response.status, args.expectedStatus);
    if (args.expectedStatus === 200) {
        ok(response.body !== undefined && response.body !== null);
        if (args.id !== undefined) {
            equal(args.validId,
                response.body.suite !== undefined &&
                response.body.suite !== null);
            return response.body.suite;
        }
        ok(response.body.suites !== undefined &&
            response.body.suites !== null);
        return response.body.suites;
    }
    return null;
}