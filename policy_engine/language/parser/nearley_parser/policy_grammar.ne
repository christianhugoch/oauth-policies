@preprocessor typescript
@{%
  import { lexer } from './moo_lexer';
  import { 
    andNodeProcessor, 
    orNodeProcessor,
    stringListProcessor,
    ruleProcessor,
    booleanRuleProcessor,
    fileRuleProcessor,
    roleRuleProcessor } from './post_processors';
%}
@lexer lexer
 
MAIN -> TOP_LEVEL_EXPRESSION:* {% id %}

TOP_LEVEL_EXPRESSION -> RULE {% id %}
                     | BOOLEAN_RULE {% id %}
                     | FILE_RULE {% id %}
                     | ROLE_RULE {% id %}
                     | IMPORT_COMMAND {% id %}

IMPORT_COMMAND -> %importToken _ string _ %as _ string _ %semicolon _
       {% d => { return { type: 'IMPORT', policy: d[2], alias: d[6] } } %}

RULE -> string _ colon _ boolean _ SCOPE _ {% d => ruleProcessor(d) %}
BOOLEAN_RULE -> string _ SCOPE _ {% d => booleanRuleProcessor(d) %}
SCOPE -> lCurlBrack _ SCOPE_LEVEL_EXPRESSION:* rCurlBrack {% d => d[2] %} 
SCOPE_LEVEL_EXPRESSION -> LOGICAL_EXPRESSIONS {% id %}
                       | VAR_INIT_EXPRESSION {% id %}

FILE_RULE -> string _ colon _ file _ FILE_SCOPE _ {% d => fileRuleProcessor(d) %}
FILE_SCOPE -> lCurlBrack _ FILE_EXPRESSION:* rCurlBrack
           {% d => d[2] %}
FILE_EXPRESSION -> SCOPE_LIST {% id %}
                | FILE_LIST {% id %}
                | SINGLE_SCOPE {% id %}

ROLE_RULE -> string _ colon _ role _ ROLE_SCOPE _ {% d => roleRuleProcessor(d) %}
ROLE_SCOPE -> lCurlBrack _ ROLE_EXPRESSION:* rCurlBrack
           {% d => d[2] %}
ROLE_EXPRESSION -> SCOPE_LIST {% id %}
                | CLIENT_LIST {% id %}
                | SINGLE_SCOPE {% id %}

SCOPE_LIST -> scopes _ equal _ STRING_LIST _ %semicolon _
           {% d => { return { type: 'SCOPE_LIST', scopes: d[4] } } %}
SINGLE_SCOPE -> scope _ equal _ string _ %semicolon _
           {% d => { return { type: 'SINGLE_SCOPE', scope: d[4] }; } %}
CLIENT_LIST -> clients _ equal _ STRING_LIST _ %semicolon _
            {% d => { return { type: 'CLIENT_LIST', clients: d[4] } } %}
FILE_LIST -> files _ equal _ STRING_LIST _ %semicolon _
          {% d => { return { type: 'FILE_LIST', files: d[4] } } %}

STRING_LIST -> RECURSIVE_STRING_LIST {% d => stringListProcessor(d) %}
RECURSIVE_STRING_LIST -> string {% id %}
                      | string _ comma _ RECURSIVE_STRING_LIST
                      {% d => { return [ d[0], d[4] ]; } %}

VAR_INIT_EXPRESSION -> string _ %equalAssignment _ LOGICAL_EXPRESSIONS
  {% d => { return { type: 'VAR_INIT_EXPRESSION', varName: d[0], expression: d[4] }; } %}

LOGICAL_EXPRESSIONS -> exp _ %semicolon _ {% id %}

VARIABLE_REF -> string 
             {% d => { return { type: 'VARIABLE_REF', name: d[0] }; } %}

RULE_CALL -> %dollar _ stringWithoutDot
          {% d => { return { type: 'RULE_CALL', ruleName: d[2] } } %} 
          | %dollar _ stringWithoutDot %dot stringWithoutDot
          {% d => { return { type: 'RULE_CALL_WITH_ALIAS', importAlias: d[2], ruleName: d[4]  }  } %}

SCOPE_FILTER -> scope _ equal _ string 
             {% d => { return { type: 'SCOPE_FILTER', scope: d[4] }; } %}

CLIENT_FILTER -> clientID _ equal _ string
             {% d => { return { type: 'CLIENT_FILTER', clientID: d[4] }; } %}

TIME_FILTER -> time _ ( equal | greater | greater_equal | lower | lower_equal ) _ 
    ( HOURS_AND_MINUTES {% id %} | HOURS_ALONE {% id %} )
  {% d => { return { type: 'TIME_FILTER', operator: d[2][0], time: d[4] }; } %}

HOURS_AND_MINUTES -> number number colon number number
  {% d => {return { hours: `${d[0]}${d[1]}`, minutes: `${d[3]}${d[4]}` } } %}

HOURS_ALONE -> number number {% d => {return { hours: `${d[0]}${d[1]}` } } %}

DAY_FILTER -> day _ equal _ dayName
  {% d => { return { type: 'DAY_FILTER', day: d[4].toLowerCase()  }; } %}

BOOLEAN_CONST -> boolean
  {% d => { return { type: 'BOOLEAN_CONST', value: d[0] } } %}

exp -> term {% id %}
     | exp _ %verticalBar _ term {% d => orNodeProcessor(d[0], d[4]) %}
term -> fact {% id %}
      | term _ %ambersand _ fact {% d => andNodeProcessor(d[0], d[4]) %}
fact -> var {% id %}
      | lBrack _ exp _ rBrack 
      {% d => { return d[2] } %}
var -> VARIABLE_REF {% id %}
     | RULE_CALL {% id %}
     | CLIENT_FILTER {% id %}
     | SCOPE_FILTER {% id %}
     | TIME_FILTER {% id %}
     | DAY_FILTER {% id %}
     | BOOLEAN_CONST {% id %}
     | %not fact
     {% d => { return { type: 'NOT', expression: d[1] }; } %}


# ########## Helper ##########
_ -> %empty:* {% d => { return null; } %}
string -> %word {% d => d[0].value %} 
stringWithoutDot -> %stringWithoutDot {% d => d[0].value %} 
dollar -> %dollar {% d => null %}
number -> %number {% d => d[0].value %}
equal -> %equal {% d => { return 'EQUAL'; } %}
lower -> %lower {% d => { return 'LOWER'; } %}
lower_equal -> %lower %equal {% d => { return 'LOWER_EQUAL'; } %}
greater -> %greater {% d => { return 'GREATER'; } %}
greater_equal -> %greater %equal {% d => { return 'GREATER_EQUAL'; } %}
comma -> %comma{% d => d[0].value %} 
scope -> %scope  {% d => null %}
time -> %time {% d => null %}
day -> %day {% d => null %}
dayName -> %dayName {% d => d[0].value %} 
clientID -> %clientID  {% d => null %}
scopes -> %scopes {% d => null %}
clients -> %clients {% d => null %}
files -> %files {% d => null %}
lBrack -> %lparen {% d => d[0].value %} 
rBrack -> %rparen {% d => d[0].value %} 
colon -> %colon{% d => d[0].value %}
file -> %file{% d => d[0].value %}
role -> %role{% d => d[0].value %}
lCurlBrack -> %lCparen {% d => null %} 
rCurlBrack -> %rCparen {% d => null %} 
boolean -> %boolean {% d => { return d[0].value; } %}