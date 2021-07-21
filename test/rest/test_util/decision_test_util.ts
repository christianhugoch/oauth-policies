import { decisionApp } from '../../../policy_engine/rest/server'
import { isEmpty } from 'lodash';
import chai from 'chai';
import { equal, ok } from 'should'


export async function GETDecisionTestHelper(args: any) {
    let url = '/decision' +
        `?scopes=${escape(args.scopes)}&clientId=${args.clientId}` +
        `&iss=${escape(args.iss)}&sub=${args.sub}`;
    let response = await chai.request(decisionApp).get(url);
    equal(response.status, args.expectedStatus);
    if (args.expectedStatus === 200) {
        ok(response.body !== null && response.body !== undefined);
        ok(response.body.decision !== null && response.body.decision !== undefined);
        equal(response.body.decision, args.expectedDecision);
    }
}


export async function GETValidFilesTestHelper(args: any) {
    let url = '/validation/permittedFiles';
    let paramsArray = new Array<string>();
    if (args.scopes !== undefined) { paramsArray.push(`scopes=${args.scopes}`); }
    if (args.iss !== undefined) { paramsArray.push(`iss=${args.iss}`); }
    if (args.sub !== undefined) { paramsArray.push(`sub=${args.sub}`); }
    let query = paramsArray.join('&');
    if (!isEmpty(query)) {
        url = url.concat(`?${query}`);
    }
    let response = await chai.request(decisionApp).get(url);
    equal(response.status, args.expectedStatus);
    if (args.expectedStatus === 200) {
        ok(response.body !== null && response !== undefined);
        ok(response.body.files !== null && response.body.files !== undefined);
        return response.body.files;
    }
    return null;
}


export async function GETfileAccessTestHelper(args: any) {
    let url = '/validation';
    let paramsArray = new Array<string>();
    if (args.scopes !== undefined) { paramsArray.push(`scopes=${args.scopes}`); }
    if (args.files !== undefined) { paramsArray.push(`files=${args.files}`) }
    if (args.iss !== undefined) { paramsArray.push(`iss=${args.iss}`); }
    if (args.sub !== undefined) { paramsArray.push(`sub=${args.sub}`); }
    let query = paramsArray.join('&');
    if (!isEmpty(query)) {
        url = url.concat(`?${query}`);
    }
    let response = await chai.request(decisionApp).get(url);
    equal(response.status, args.expectedStatus);
    if (args.expectedStatus === 200) {
        ok(response.body !== null && response !== undefined);
        ok(response.body.valid !== null && response.body.valid !== undefined);
        return response.body.valid;
    }
    return null;
}