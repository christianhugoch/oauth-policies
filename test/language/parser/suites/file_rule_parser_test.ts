import 'reflect-metadata';

import { parse } from "../../../../policy_engine/language/parser/parser";
import {
    emptyRule,
    ruleWithoutScope,
    ruleWithMultipleScopes,
    oneScopeAndOneFile,
    oneScopeAndMultipleFile,
    threeValidFileRules,
    fileRulesWithMoreExpressions,
} from "../../test_data/file_rule_test_data"

import { equal, throws } from "should";


describe("file rule parsing", () => {
    it("empty file rule", () => {
        let result = parse(emptyRule.code, "file rule policy");
        equal(JSON.stringify(result.syntaxTree), JSON.stringify(emptyRule.expectedTree));
    });

    it("files without scope", () => {
        let result = parse(ruleWithoutScope.code, "file rule policy");
        equal(JSON.stringify(result.syntaxTree),
            JSON.stringify(ruleWithoutScope.expectedTree));
    });

    it("multiple scopes", () => {
        let result = parse(ruleWithMultipleScopes.code, "file rule policy");
        equal(JSON.stringify(result.syntaxTree),
            JSON.stringify(ruleWithMultipleScopes.expectedTree));
    });

    it("one scope and one file", () => {
        let result = parse(oneScopeAndOneFile.code, "file rule policy");
        equal(JSON.stringify(result.syntaxTree),
            JSON.stringify(oneScopeAndOneFile.expectedTree));
    });

    it("one scope and multiple files", () => {
        let result = parse(oneScopeAndMultipleFile.code, "file rule policy");
        equal(JSON.stringify(result.syntaxTree),
            JSON.stringify(oneScopeAndMultipleFile.expectedTree));
    });

    it("two valid file rules", () => {
        let result = parse(threeValidFileRules.code, "file rule policy");
        equal(JSON.stringify(result.syntaxTree),
            JSON.stringify(threeValidFileRules.expectedTree));
    });

    it("file rules with more expressions", () => {
        let result = parse(fileRulesWithMoreExpressions.code, "file rule policy");
        equal(JSON.stringify(result.syntaxTree),
            JSON.stringify(fileRulesWithMoreExpressions.expectedTree));
    });

    it("file rule with invalid file command throws", () => {
        let code = `
            invalid : file { 
                file = fileA, fileB, fileC;
                scope = scopeA; 
            }`;
        throws(() => {
            parse(code, "file rule policy")
        });
    });

    it("file rule with client command throws", () => {
        let code = `
            invalid : file { 
                files = fileA, fileB, fileC;
                scope = scopeA; 
                client = clientA;
            }`;
        throws(() => {
            parse(code, "file rule policy")
        });
    });

    it("file rule with time command throws", () => {
        let code = `
            invalid : file { 
                files = fileA, fileB, fileC;
                scope = scopeA; 
                time = 13;
            }`;
        throws(() => {
            parse(code, "file rule policy")
        });
    });

    it("file rule with day command throws", () => {
        let code = `
            invalid : file { 
                files = fileA, fileB, fileC;
                scope = scopeA; 
                day = monday;
            }`;
        throws(() => {
            parse(code, "file rule policy")
        });
    });
});