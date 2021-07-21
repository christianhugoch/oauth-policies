import policyGrammar from './nearley_parser/policy_grammar_generated';
import { ParsedPolicy } from './parsed_policy'
import { ParsingException } from '../../common/exceptions/parsing_exception';

import nearley from 'nearley';


export function parse(code: string, policyName: string): ParsedPolicy {
    const parser = new nearley.Parser(
        nearley.Grammar.fromCompiled(policyGrammar));
    try {
        parser.feed(code.trim());
    }
    catch (error) {
        throw new ParsingException(error.message);
    }
    if (parser.results.length > 1) {
        throw new ParsingException("the grammar is ambiguous");
    }
    const ast = parser.results[0];
    if (!ast) {
        throw new ParsingException("unable to find any valid policy code");
    }
    return new ParsedPolicy(ast, policyName);
}