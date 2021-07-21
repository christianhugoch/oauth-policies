import 'reflect-metadata';

import { testHelper } from "../../parser_test_util";
import { parenthesesTestData } from "../../../test_data/parentheses_test_data";


describe('parentheses tests', () => {
    it('test expressions', () => {
        for (let testData of parenthesesTestData) {
            testHelper(testData.code, testData.expectedExpressions);
        }
    });
});