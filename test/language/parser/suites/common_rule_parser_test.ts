import 'reflect-metadata';

import { parse } from "../../../../policy_engine/language/parser/parser";

import { equal, throws } from "should";


function testHelper(
    ruleName: string, typeSuffix: string,
    expectedType: string, expectedEffect: string
): void {
    let ruleCode = `${ruleName}${typeSuffix} {}`;
    {
        let policy = parse(ruleCode, ruleName);
        let ast = policy.syntaxTree;
        equal(ast.length, 1);
        equal(ast[0].type, expectedType);
        equal(ast[0].name, ruleName);
        equal(ast[0].effect, expectedEffect);
        equal(policy.name, ruleName);
    }
    {
        let policy = parse(`dummyRule : true {} ${ruleCode}`, ruleName);
        let ast = policy.syntaxTree;
        equal(ast.length, 2);
        equal(ast[1].type, expectedType);
        equal(ast[1].name, ruleName);
        equal(policy.name, ruleName);
    }
}


describe("parse rule", () => {
    describe('parse rule types:', () => {
        it('boolean rule', () => {
            testHelper('boolean_rule', '', 'BOOLEAN_RULE', 'boolean');
            testHelper('boolean_rule', ''.repeat(100), 'BOOLEAN_RULE', 'boolean');
        });

        it('permit rule', () => {
            testHelper('permit_rule', ' : true', 'RULE', 'true');
            testHelper('permit_rule', ':true', 'RULE', 'true');
            testHelper('permit_rule', `${' '.repeat(100)}:${' '.repeat(100)}true${' '.repeat(100)}`, 'RULE', 'true');
        });

        it('deny rule', () => {
            testHelper('deny_rule', ' : false', 'RULE', 'false');
            testHelper('deny_rule', ':false', 'RULE', 'false');
            testHelper('deny_rule', `${' '.repeat(100)}:${' '.repeat(100)}false${' '.repeat(100)}`, 'RULE', 'false');
        });

        it('role rule', () => {
            testHelper('Role_rule', ' : role', 'ROLE_RULE', 'role');
            testHelper('Role_rule', ':role', 'ROLE_RULE', 'role');
            testHelper('Role_rule', `${' '.repeat(100)}:${' '.repeat(100)}role${' '.repeat(100)}`, 'ROLE_RULE', 'role');
        });

        it('file rule', () => {
            testHelper('File_rule', ' : file', 'FILE_RULE', 'file');
            testHelper('File_rule', ':file', 'FILE_RULE', 'file');
            testHelper('File_rule', `${' '.repeat(100)}:${' '.repeat(100)}file${' '.repeat(100)}`, 'FILE_RULE', 'file');
        });
    });

    describe('reject invalid rule', () => {
        it('case sensitive', () => {
            throws(() => parse('invalidRule : File {}', 'invalid'));
            throws(() => parse('invalidRule : True {}', 'invalid'));
            throws(() => parse('invalidRule : False {}', 'invalid'));
            throws(() => parse('invalidRule : Role {}', 'invalid'));
        });

        it('wrong filter', () => {
            throws(() => parse(`invalidRule : file {
                client = myClient;
            }`, 'invalid'));

            throws(() => parse(`invalidRule : file {
                time = 12:33;
            }`, 'invalid'));

            throws(() => parse(`invalidRule : file {
                day = saturday;
            }`, 'invalid'));

            throws(() => parse(`invalidRule : true {
                files = myFileA, myFileB;
            }`, 'invalid'));

        });

        it('invalid syntax', () => {
            throws(() => parse('invalidRule : true {', 'invalid'));
            throws(() => parse('invalidRule : false ', 'invalid'));
            throws(() => parse('invalidRule : role ', 'invalid'));
        });

        it('invalid syntax mixed with valid syntax', () => {
            throws(() => parse(`permit : true { scope = scope; }
                invalidRule : true {`, 'invalid')
            );
            throws(() => parse(`permit : true { scope = scope; }
                invalidRule : false `, 'invalid'));
            throws(() => parse(`permit : true { scope = scope; }
                invalidRule : role `, 'invalid'));
        });
    });
});