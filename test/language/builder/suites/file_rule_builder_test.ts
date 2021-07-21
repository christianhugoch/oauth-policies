import 'reflect-metadata';

import { buildPolicy } from '../../../../policy_engine/language/builder/builder_util';
import { parse } from '../../../../policy_engine/language/parser/parser';
import { Policy } from '../../../../policy_engine/language/model/policy/policy';
import {
    emptyRule,
    ruleWithoutScope,
    ruleWithMultipleScopes,
    oneScopeAndOneFile,
    oneScopeAndMultipleFile,
    threeValidFileRules,
    fileRulesWithMoreExpressions,
} from '../../test_data/file_rule_test_data';

import { inspect } from 'util';
import { equal, throws } from 'should';


describe("file rule test", () => {
    it("empty file rule", () => {
        let policy = buildPolicy(parse(emptyRule.code, 'dummy'));
        let expected = emptyRule.expectedModelObject;
        equal(JSON.stringify(policy), JSON.stringify(expected));
    });

    it("file rule with multiple files commands and without scope throws", () => {
        throws( // not yet supported
            () => { buildPolicy(parse(ruleWithoutScope.code, 'dummy')) }
        );
    });

    it("file rule with multiple scope commands and without files throws", () => {
        throws( // not yet supported
            () => { buildPolicy(parse(ruleWithMultipleScopes.code, 'dummy')) }
        );
    });

    it("file rule with one scope and one file", () => {
        let policy: Policy = buildPolicy(parse(oneScopeAndOneFile.code, 'dummy'));
        let expected: Policy = oneScopeAndOneFile.expectedObject;
        equal(JSON.stringify(policy), JSON.stringify(expected));
    });

    it("file rule with one scope and multiple files", () => {
        let policy = buildPolicy(parse(oneScopeAndMultipleFile.code, 'dummy'));
        let expected = oneScopeAndMultipleFile.expectedObject;
        equal(JSON.stringify(policy), JSON.stringify(expected));
    });

    it("two valid file rules", () => {
        let policy = buildPolicy(parse(threeValidFileRules.code, 'dummy'));
        let expected = threeValidFileRules.expectedObject;
        equal(JSON.stringify(policy), JSON.stringify(expected));
    });

    it("two file rules and more expressions", () => {
        let policy = buildPolicy(parse(fileRulesWithMoreExpressions.code, 'dummy'));
        let expected = fileRulesWithMoreExpressions.expectedObject;
        equal(JSON.stringify(policy), JSON.stringify(expected));
    });
});
