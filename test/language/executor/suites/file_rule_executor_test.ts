import 'reflect-metadata';

import { buildPolicy } from '../../../../policy_engine/language/builder/builder_util';
import { permittedFilesOfPolicies, validateFileAccess } from '../../../../policy_engine/language/executor/file_access_util';
import { parse } from '../../../../policy_engine/language/parser/parser';
import {
    emptyRule,
    ruleWithoutScope,
    ruleWithMultipleScopes,
    oneScopeAndOneFile,
    oneScopeAndMultipleFile,
    threeValidFileRules,
} from '../../test_data/file_rule_test_data';

import { isArray, isEmpty, isEqual } from 'lodash';
import { ok, throws } from 'should';


describe("file rule test", () => {
    it("empty file rule", () => {
        let policy = buildPolicy(parse(emptyRule.code, "dummy"));
        let permitted = permittedFilesOfPolicies([policy], ["scopeA"]);
        ok(isArray(permitted));
        ok(isEmpty(permitted));
    });

    it("file rule with two 'files' commands", () => {
        throws(() => { buildPolicy(parse(ruleWithoutScope.code, "dummy")) });

    });

    it("file rule with two 'scope' commands throws", () => {
        throws(() => { buildPolicy(parse(ruleWithMultipleScopes.code, "dummy")) });
    });

    it("file rule with one 'files' and one 'scope' command", () => {
        let policy = buildPolicy(parse(oneScopeAndOneFile.code, "dummy"));
        let permitted = permittedFilesOfPolicies([policy], ["scopeA"]);
        ok(isEqual(permitted, ["fileA"]));
        ok(validateFileAccess(["fileA"], ["scopeA"], [policy]));
        ok(!validateFileAccess(["fileB"], ["scopeA"], [policy]));
        ok(!validateFileAccess(["fileA"], ["scopeB"], [policy]));
        ok(!validateFileAccess(["fileA", "fileB"], ["scopeA"], [policy]));
    });

    it("file rule with one scope and multiple files", () => {
        let policy = buildPolicy(parse(oneScopeAndMultipleFile.code, "dummy"));
        let permitted = permittedFilesOfPolicies([policy], ["scopeA"]);
        ok(isEqual(permitted, ["fileA", "fileB", "fileC"]));
        ok(validateFileAccess(["fileA"], ["scopeA"], [policy]));
        ok(validateFileAccess(["fileA", "fileB"], ["scopeA"], [policy]));
        ok(validateFileAccess(["fileA", "fileB", "fileC"], ["scopeA"], [policy]));

        ok(!validateFileAccess(["fileD"], ["scopeA"], [policy]));
        ok(!validateFileAccess(["fileA", "fileD"], ["scopeA"], [policy]));
        ok(!validateFileAccess(["fileA", "fileB", "fileC", "fileD"], ["scopeA"], [policy]));
    });

    it("policy with three valid file rules", () => {
        let policy = buildPolicy(parse(threeValidFileRules.code, "dummy"));
        let permittedA = permittedFilesOfPolicies([policy], ["scopeA"]);
        ok(isEqual(permittedA, ["fileA", "fileD"]));
        ok(validateFileAccess(["fileA"], ["scopeA"], [policy]));
        ok(validateFileAccess(["fileD"], ["scopeA"], [policy]));
        ok(validateFileAccess(["fileA", "fileD"], ["scopeA"], [policy]));
        ok(!validateFileAccess(["fileD"], ["scopeB"], [policy]));
        ok(!validateFileAccess(["fileA", "fileD"], ["scopeB"], [policy]));

        let permittedB = permittedFilesOfPolicies([policy], ["scopeB"]);
        ok(isEqual(permittedB, ["fileA", "fileB", "fileC"]));
        ok(validateFileAccess(["fileA"], ["scopeB"], [policy]));
        ok(validateFileAccess(["fileA", "fileB"], ["scopeB"], [policy]));
        ok(validateFileAccess(["fileA", "fileB", "fileC"], ["scopeB"], [policy]));
        ok(!validateFileAccess(["fileA", "fileB"], ["scopeA"], [policy]));
        ok(!validateFileAccess(["fileA", "fileB", "fileC"], ["scopeA"], [policy]));
    });
});