import 'reflect-metadata';

import { parse } from "../../../../policy_engine/language/parser/parser";
import {
    oneImport,
    twoImports,
    importsFollowedByARule,
    importsWithARuleInBetween,
} from "../../test_data/import_test_data";

import { equal } from "should";


describe("import commands", () => {
    it("parse one import command", () => {
        let result = parse(oneImport.code, 'dummy');
        equal(JSON.stringify(result.syntaxTree),
            JSON.stringify(oneImport.expectedTree));
    });

    it("parse two import commands", () => {
        let result = parse(twoImports.code, 'dummy');
        equal(JSON.stringify(result.syntaxTree),
            JSON.stringify(twoImports.expectedTree));
    });

    it("parse two import commands followed by a rule", () => {
        let result = parse(importsFollowedByARule.code, 'dummy');
        equal(JSON.stringify(result.syntaxTree),
            JSON.stringify(importsFollowedByARule.expectedTree));
    });

    it("parse three import commands with a rule in-between", () => {
        let result = parse(importsWithARuleInBetween.code, 'dummy');
        equal(JSON.stringify(result.syntaxTree),
            JSON.stringify(importsWithARuleInBetween.expectedTree));
    });
});

