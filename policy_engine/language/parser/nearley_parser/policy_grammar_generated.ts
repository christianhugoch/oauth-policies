// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare let importToken: any;
declare let as: any;
declare let semicolon: any;
declare let equalAssignment: any;
declare let dollar: any;
declare let dot: any;
declare let verticalBar: any;
declare let ambersand: any;
declare let not: any;
declare let empty: any;
declare let word: any;
declare let stringWithoutDot: any;
declare let number: any;
declare let equal: any;
declare let lower: any;
declare let greater: any;
declare let comma: any;
declare let scope: any;
declare let time: any;
declare let day: any;
declare let dayName: any;
declare let clientID: any;
declare let scopes: any;
declare let clients: any;
declare let files: any;
declare let lparen: any;
declare let rparen: any;
declare let colon: any;
declare let file: any;
declare let role: any;
declare let lCparen: any;
declare let rCparen: any;
declare let boolean: any;

  import { lexer } from './moo_lexer';
  import { 
    andNodeProcessor, 
    orNodeProcessor,
    stringListProcessor,
    ruleProcessor,
    booleanRuleProcessor,
    fileRuleProcessor,
    roleRuleProcessor } from './post_processors';

interface NearleyToken {
  value: any;
  [key: string]: any;
}

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: never) => string;
  has: (tokenType: string) => boolean;
}

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
}

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
}

const grammar: Grammar = {
  Lexer: lexer,
  ParserRules: [
    {"name": "MAIN$ebnf$1", "symbols": []},
    {"name": "MAIN$ebnf$1", "symbols": ["MAIN$ebnf$1", "TOP_LEVEL_EXPRESSION"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "MAIN", "symbols": ["MAIN$ebnf$1"], "postprocess": id},
    {"name": "TOP_LEVEL_EXPRESSION", "symbols": ["RULE"], "postprocess": id},
    {"name": "TOP_LEVEL_EXPRESSION", "symbols": ["BOOLEAN_RULE"], "postprocess": id},
    {"name": "TOP_LEVEL_EXPRESSION", "symbols": ["FILE_RULE"], "postprocess": id},
    {"name": "TOP_LEVEL_EXPRESSION", "symbols": ["ROLE_RULE"], "postprocess": id},
    {"name": "TOP_LEVEL_EXPRESSION", "symbols": ["IMPORT_COMMAND"], "postprocess": id},
    {"name": "IMPORT_COMMAND", "symbols": [(lexer.has("importToken") ? {type: "importToken"} : importToken), "_", "string", "_", (lexer.has("as") ? {type: "as"} : as), "_", "string", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"], "postprocess": d => { return { type: 'IMPORT', policy: d[2], alias: d[6] } }},
    {"name": "RULE", "symbols": ["string", "_", "colon", "_", "boolean", "_", "SCOPE", "_"], "postprocess": d => ruleProcessor(d)},
    {"name": "BOOLEAN_RULE", "symbols": ["string", "_", "SCOPE", "_"], "postprocess": d => booleanRuleProcessor(d)},
    {"name": "SCOPE$ebnf$1", "symbols": []},
    {"name": "SCOPE$ebnf$1", "symbols": ["SCOPE$ebnf$1", "SCOPE_LEVEL_EXPRESSION"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "SCOPE", "symbols": ["lCurlBrack", "_", "SCOPE$ebnf$1", "rCurlBrack"], "postprocess": d => d[2]},
    {"name": "SCOPE_LEVEL_EXPRESSION", "symbols": ["LOGICAL_EXPRESSIONS"], "postprocess": id},
    {"name": "SCOPE_LEVEL_EXPRESSION", "symbols": ["VAR_INIT_EXPRESSION"], "postprocess": id},
    {"name": "FILE_RULE", "symbols": ["string", "_", "colon", "_", "file", "_", "FILE_SCOPE", "_"], "postprocess": d => fileRuleProcessor(d)},
    {"name": "FILE_SCOPE$ebnf$1", "symbols": []},
    {"name": "FILE_SCOPE$ebnf$1", "symbols": ["FILE_SCOPE$ebnf$1", "FILE_EXPRESSION"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "FILE_SCOPE", "symbols": ["lCurlBrack", "_", "FILE_SCOPE$ebnf$1", "rCurlBrack"], "postprocess": d => d[2]},
    {"name": "FILE_EXPRESSION", "symbols": ["SCOPE_LIST"], "postprocess": id},
    {"name": "FILE_EXPRESSION", "symbols": ["FILE_LIST"], "postprocess": id},
    {"name": "FILE_EXPRESSION", "symbols": ["SINGLE_SCOPE"], "postprocess": id},
    {"name": "ROLE_RULE", "symbols": ["string", "_", "colon", "_", "role", "_", "ROLE_SCOPE", "_"], "postprocess": d => roleRuleProcessor(d)},
    {"name": "ROLE_SCOPE$ebnf$1", "symbols": []},
    {"name": "ROLE_SCOPE$ebnf$1", "symbols": ["ROLE_SCOPE$ebnf$1", "ROLE_EXPRESSION"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "ROLE_SCOPE", "symbols": ["lCurlBrack", "_", "ROLE_SCOPE$ebnf$1", "rCurlBrack"], "postprocess": d => d[2]},
    {"name": "ROLE_EXPRESSION", "symbols": ["SCOPE_LIST"], "postprocess": id},
    {"name": "ROLE_EXPRESSION", "symbols": ["CLIENT_LIST"], "postprocess": id},
    {"name": "ROLE_EXPRESSION", "symbols": ["SINGLE_SCOPE"], "postprocess": id},
    {"name": "SCOPE_LIST", "symbols": ["scopes", "_", "equal", "_", "STRING_LIST", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"], "postprocess": d => { return { type: 'SCOPE_LIST', scopes: d[4] } }},
    {"name": "SINGLE_SCOPE", "symbols": ["scope", "_", "equal", "_", "string", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"], "postprocess": d => { return { type: 'SINGLE_SCOPE', scope: d[4] }; }},
    {"name": "CLIENT_LIST", "symbols": ["clients", "_", "equal", "_", "STRING_LIST", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"], "postprocess": d => { return { type: 'CLIENT_LIST', clients: d[4] } }},
    {"name": "FILE_LIST", "symbols": ["files", "_", "equal", "_", "STRING_LIST", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"], "postprocess": d => { return { type: 'FILE_LIST', files: d[4] } }},
    {"name": "STRING_LIST", "symbols": ["RECURSIVE_STRING_LIST"], "postprocess": d => stringListProcessor(d)},
    {"name": "RECURSIVE_STRING_LIST", "symbols": ["string"], "postprocess": id},
    {"name": "RECURSIVE_STRING_LIST", "symbols": ["string", "_", "comma", "_", "RECURSIVE_STRING_LIST"], "postprocess": d => { return [ d[0], d[4] ]; }},
    {"name": "VAR_INIT_EXPRESSION", "symbols": ["string", "_", (lexer.has("equalAssignment") ? {type: "equalAssignment"} : equalAssignment), "_", "LOGICAL_EXPRESSIONS"], "postprocess": d => { return { type: 'VAR_INIT_EXPRESSION', varName: d[0], expression: d[4] }; }},
    {"name": "LOGICAL_EXPRESSIONS", "symbols": ["exp", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"], "postprocess": id},
    {"name": "VARIABLE_REF", "symbols": ["string"], "postprocess": d => { return { type: 'VARIABLE_REF', name: d[0] }; }},
    {"name": "RULE_CALL", "symbols": [(lexer.has("dollar") ? {type: "dollar"} : dollar), "_", "stringWithoutDot"], "postprocess": d => { return { type: 'RULE_CALL', ruleName: d[2] } }},
    {"name": "RULE_CALL", "symbols": [(lexer.has("dollar") ? {type: "dollar"} : dollar), "_", "stringWithoutDot", (lexer.has("dot") ? {type: "dot"} : dot), "stringWithoutDot"], "postprocess": d => { return { type: 'RULE_CALL_WITH_ALIAS', importAlias: d[2], ruleName: d[4]  }  }},
    {"name": "SCOPE_FILTER", "symbols": ["scope", "_", "equal", "_", "string"], "postprocess": d => { return { type: 'SCOPE_FILTER', scope: d[4] }; }},
    {"name": "CLIENT_FILTER", "symbols": ["clientID", "_", "equal", "_", "string"], "postprocess": d => { return { type: 'CLIENT_FILTER', clientID: d[4] }; }},
    {"name": "TIME_FILTER$subexpression$1", "symbols": ["equal"]},
    {"name": "TIME_FILTER$subexpression$1", "symbols": ["greater"]},
    {"name": "TIME_FILTER$subexpression$1", "symbols": ["greater_equal"]},
    {"name": "TIME_FILTER$subexpression$1", "symbols": ["lower"]},
    {"name": "TIME_FILTER$subexpression$1", "symbols": ["lower_equal"]},
    {"name": "TIME_FILTER$subexpression$2", "symbols": ["HOURS_AND_MINUTES"], "postprocess": id},
    {"name": "TIME_FILTER$subexpression$2", "symbols": ["HOURS_ALONE"], "postprocess": id},
    {"name": "TIME_FILTER", "symbols": ["time", "_", "TIME_FILTER$subexpression$1", "_", "TIME_FILTER$subexpression$2"], "postprocess": d => { return { type: 'TIME_FILTER', operator: d[2][0], time: d[4] }; }},
    {"name": "HOURS_AND_MINUTES", "symbols": ["number", "number", "colon", "number", "number"], "postprocess": d => {return { hours: `${d[0]}${d[1]}`, minutes: `${d[3]}${d[4]}` } }},
    {"name": "HOURS_ALONE", "symbols": ["number", "number"], "postprocess": d => {return { hours: `${d[0]}${d[1]}` } }},
    {"name": "DAY_FILTER", "symbols": ["day", "_", "equal", "_", "dayName"], "postprocess": d => { return { type: 'DAY_FILTER', day: d[4].toLowerCase()  }; }},
    {"name": "BOOLEAN_CONST", "symbols": ["boolean"], "postprocess": d => { return { type: 'BOOLEAN_CONST', value: d[0] } }},
    {"name": "exp", "symbols": ["term"], "postprocess": id},
    {"name": "exp", "symbols": ["exp", "_", (lexer.has("verticalBar") ? {type: "verticalBar"} : verticalBar), "_", "term"], "postprocess": d => orNodeProcessor(d[0], d[4])},
    {"name": "term", "symbols": ["fact"], "postprocess": id},
    {"name": "term", "symbols": ["term", "_", (lexer.has("ambersand") ? {type: "ambersand"} : ambersand), "_", "fact"], "postprocess": d => andNodeProcessor(d[0], d[4])},
    {"name": "fact", "symbols": ["var"], "postprocess": id},
    {"name": "fact", "symbols": ["lBrack", "_", "exp", "_", "rBrack"], "postprocess": d => { return d[2] }},
    {"name": "var", "symbols": ["VARIABLE_REF"], "postprocess": id},
    {"name": "var", "symbols": ["RULE_CALL"], "postprocess": id},
    {"name": "var", "symbols": ["CLIENT_FILTER"], "postprocess": id},
    {"name": "var", "symbols": ["SCOPE_FILTER"], "postprocess": id},
    {"name": "var", "symbols": ["TIME_FILTER"], "postprocess": id},
    {"name": "var", "symbols": ["DAY_FILTER"], "postprocess": id},
    {"name": "var", "symbols": ["BOOLEAN_CONST"], "postprocess": id},
    {"name": "var", "symbols": [(lexer.has("not") ? {type: "not"} : not), "fact"], "postprocess": d => { return { type: 'NOT', expression: d[1] }; }},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", (lexer.has("empty") ? {type: "empty"} : empty)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": d => { return null; }},
    {"name": "string", "symbols": [(lexer.has("word") ? {type: "word"} : word)], "postprocess": d => d[0].value},
    {"name": "stringWithoutDot", "symbols": [(lexer.has("stringWithoutDot") ? {type: "stringWithoutDot"} : stringWithoutDot)], "postprocess": d => d[0].value},
    {"name": "dollar", "symbols": [(lexer.has("dollar") ? {type: "dollar"} : dollar)], "postprocess": d => null},
    {"name": "number", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": d => d[0].value},
    {"name": "equal", "symbols": [(lexer.has("equal") ? {type: "equal"} : equal)], "postprocess": d => { return 'EQUAL'; }},
    {"name": "lower", "symbols": [(lexer.has("lower") ? {type: "lower"} : lower)], "postprocess": d => { return 'LOWER'; }},
    {"name": "lower_equal", "symbols": [(lexer.has("lower") ? {type: "lower"} : lower), (lexer.has("equal") ? {type: "equal"} : equal)], "postprocess": d => { return 'LOWER_EQUAL'; }},
    {"name": "greater", "symbols": [(lexer.has("greater") ? {type: "greater"} : greater)], "postprocess": d => { return 'GREATER'; }},
    {"name": "greater_equal", "symbols": [(lexer.has("greater") ? {type: "greater"} : greater), (lexer.has("equal") ? {type: "equal"} : equal)], "postprocess": d => { return 'GREATER_EQUAL'; }},
    {"name": "comma", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": d => d[0].value},
    {"name": "scope", "symbols": [(lexer.has("scope") ? {type: "scope"} : scope)], "postprocess": d => null},
    {"name": "time", "symbols": [(lexer.has("time") ? {type: "time"} : time)], "postprocess": d => null},
    {"name": "day", "symbols": [(lexer.has("day") ? {type: "day"} : day)], "postprocess": d => null},
    {"name": "dayName", "symbols": [(lexer.has("dayName") ? {type: "dayName"} : dayName)], "postprocess": d => d[0].value},
    {"name": "clientID", "symbols": [(lexer.has("clientID") ? {type: "clientID"} : clientID)], "postprocess": d => null},
    {"name": "scopes", "symbols": [(lexer.has("scopes") ? {type: "scopes"} : scopes)], "postprocess": d => null},
    {"name": "clients", "symbols": [(lexer.has("clients") ? {type: "clients"} : clients)], "postprocess": d => null},
    {"name": "files", "symbols": [(lexer.has("files") ? {type: "files"} : files)], "postprocess": d => null},
    {"name": "lBrack", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen)], "postprocess": d => d[0].value},
    {"name": "rBrack", "symbols": [(lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": d => d[0].value},
    {"name": "colon", "symbols": [(lexer.has("colon") ? {type: "colon"} : colon)], "postprocess": d => d[0].value},
    {"name": "file", "symbols": [(lexer.has("file") ? {type: "file"} : file)], "postprocess": d => d[0].value},
    {"name": "role", "symbols": [(lexer.has("role") ? {type: "role"} : role)], "postprocess": d => d[0].value},
    {"name": "lCurlBrack", "symbols": [(lexer.has("lCparen") ? {type: "lCparen"} : lCparen)], "postprocess": d => null},
    {"name": "rCurlBrack", "symbols": [(lexer.has("rCparen") ? {type: "rCparen"} : rCparen)], "postprocess": d => null},
    {"name": "boolean", "symbols": [(lexer.has("boolean") ? {type: "boolean"} : boolean)], "postprocess": d => { return d[0].value; }}
  ],
  ParserStart: "MAIN",
};

export default grammar;
