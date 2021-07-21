import { Policy } from "../../language/model/policy/policy";
import { PolicyTestProps, PolicyTestSuiteDoc } from "../../db/model/policy_test_schema";
import { ExecutionController } from "../../language/executor/decision_controller";
import { validateFileAccess } from "../../language/executor/file_access_util";

import MockDate from 'mockdate';


export function testPolicies(
    suites: Array<PolicyTestSuiteDoc>,
    policies: Array<Policy>
): Array<any> {
    const result = new Array<any>();
    for (const suite of suites) {
        result.push(handleTestSuite(suite, policies));
    }
    return result;
}


export function handleTestSuite(
    suite: PolicyTestSuiteDoc,
    policies: Array<Policy>
): any {
    const suiteResults = [];
    const statistics = { successfulChecks: 0, failures: 0 }
    for (const currentTest of suite.tests) {
        mockTimeIfNecessary(currentTest);
        const result = getResult(currentTest, policies);
        suiteResults.push(prepareResultObject(result, currentTest));
        MockDate.reset();
        if (result === currentTest.expectedResult) {
            statistics.successfulChecks++
        } else {
            statistics.failures++;
        }
    }
    return {
        suiteName: suite.name,
        success: statistics.failures === 0,
        statistics: statistics,
        results: suiteResults
    };
}


function mockTimeIfNecessary(test: PolicyTestProps) {
    if (test.type === 'DECISION' && test.time) {
        MockDate.set(test.time);
    }
}


function getResult(test: PolicyTestProps, policies: Array<Policy>): boolean {
    if (test.type === "DECISION") {
        const execController = new ExecutionController(
            test.scopes, test.client, policies);
        return execController.decide();
    }
    else {
        return validateFileAccess(test.files,test.scopes,policies);
    }
}


function prepareResultObject(result: boolean, currentTest: any): any {
    const resultObj: any = {
        testName: currentTest.name,
        expected: currentTest.expectedResult, actual: result,
        scopes: currentTest.scopes
    };
    if (currentTest.type === "DECISION") {
        resultObj.client = currentTest.client;
    }
    else {
        resultObj.files = currentTest.files;
    }
    return resultObj;
}
