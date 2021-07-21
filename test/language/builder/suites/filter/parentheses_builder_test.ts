import 'reflect-metadata';

import { builderTestHelper } from "../../builder_test_util";
import { parenthesesTestData } from "../../../test_data/parentheses_test_data";

describe('parentheses tests', () => {
    it('test expressions', () => {
        for (let testData of parenthesesTestData) {
            builderTestHelper(testData.code, testData.expectedRuleScope.expressions);
        }
    });
});
