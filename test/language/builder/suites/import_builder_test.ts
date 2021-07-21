import 'reflect-metadata';

import { buildPolicy } from '../../../../policy_engine/language/builder/builder_util';
import { parse } from '../../../../policy_engine/language/parser/parser';
import {
    oneImport,
    twoImports,
    importsFollowedByARule,
    importsWithARuleInBetween,
} from '../../test_data/import_test_data'

import { equal } from 'should';

describe("import command tests", () => {

    it("one import", () => {
        let policy = buildPolicy(parse(oneImport.code, "dummy"));
        equal(JSON.stringify(policy), JSON.stringify(oneImport.expectedObject));
    });

    it("two imports", () => {
        let policy = buildPolicy(parse(twoImports.code, "dummy"));
        equal(JSON.stringify(policy), JSON.stringify(twoImports.expectedObject));
    });

    it("two imports followed by a rule", () => {
        let policy = buildPolicy(parse(importsFollowedByARule.code, "dummy"));
        equal(JSON.stringify(policy), JSON.stringify(importsFollowedByARule.expectedObject));
    });

    it("three imports with a rule in-between", () => {
        let policy = buildPolicy(parse(importsWithARuleInBetween.code, "dummy"));
        equal(JSON.stringify(policy), JSON.stringify(importsWithARuleInBetween.expectedObject));
    });
});