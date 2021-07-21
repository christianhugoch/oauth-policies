import { Scope } from "../../../policy_engine/language/model/policy/rule/scope";
import { ExpressionBase } from "../../../policy_engine/language/model/policy/rule/expression/expression_base";
import { LogicalOr } from "../../../policy_engine/language/model/policy/rule/expression/filter/logical_filter/or";
import { VariableReference } from "../../../policy_engine/language/model/policy/rule/expression/filter/single_filter/variable_reference";
import { ScopeFilter } from "../../../policy_engine/language/model/policy/rule/expression/filter/single_filter/scope_filter";
import { LogicalAnd } from "../../../policy_engine/language/model/policy/rule/expression/filter/logical_filter/and";
import { ClientFilter } from "../../../policy_engine/language/model/policy/rule/expression/filter/single_filter/client_filter";
import { LogicalNot } from "../../../policy_engine/language/model/policy/rule/expression/filter/logical_filter/not";


export let parenthesesTestData = [
    {
        code: '(var_ref | scope = myScope);',
        expectedExpressions: [{
            type: 'OR',
            expressions: [
                { type: 'VARIABLE_REF', name: 'var_ref' },
                { type: 'SCOPE_FILTER', scope: 'myScope' }
            ]
        }],
        expectedRuleScope: ((): Scope => {
            let expressions = new Array<ExpressionBase>();
            expressions.push(
                new LogicalOr([
                    new VariableReference('var_ref'),
                    new ScopeFilter('myScope')
                ])
            )
            return new Scope(expressions);
        })(),
    },
    {
        code: '(var_ref & scope = myScope);',
        expectedExpressions: [{
            type: 'AND',
            expressions: [
                { type: 'VARIABLE_REF', name: 'var_ref' },
                { type: 'SCOPE_FILTER', scope: 'myScope' }
            ]
        }],
        expectedRuleScope: ((): Scope => {
            let expressions = new Array<ExpressionBase>();
            expressions.push(
                new LogicalAnd([
                    new VariableReference('var_ref'),
                    new ScopeFilter('myScope')
                ])
            )
            return new Scope(expressions);
        })(),
    },
    {
        code: '(var_ref | scope = myScope & client = myClient);',
        expectedExpressions: [{
            type: 'OR',
            expressions: [
                { type: 'VARIABLE_REF', name: 'var_ref' },
                {
                    type: 'AND',
                    expressions: [
                        { type: 'SCOPE_FILTER', scope: 'myScope' },
                        { type: 'CLIENT_FILTER', clientID: 'myClient' }
                    ]
                }
            ]
        }],
        expectedRuleScope: ((): Scope => {
            let expressions = new Array<ExpressionBase>();
            expressions.push(
                new LogicalOr([
                    new VariableReference('var_ref'),
                    new LogicalAnd([
                        new ScopeFilter('myScope'),
                        new ClientFilter('myClient')
                    ])
                ])
            )
            return new Scope(expressions);
        })(),
    },
    {
        code: `(scope = myScope & client = myClient | refA | refB & refC
            & scope = myScopeB | client = provider );`,
        expectedExpressions: [{
            type: 'OR',
            expressions: [
                {
                    type: 'AND',
                    expressions: [
                        { type: 'SCOPE_FILTER', scope: 'myScope' },
                        { type: 'CLIENT_FILTER', clientID: 'myClient' }
                    ]
                },
                { type: 'VARIABLE_REF', name: 'refA' },
                {
                    type: 'AND',
                    expressions: [
                        { type: 'VARIABLE_REF', name: 'refB' },
                        { type: 'VARIABLE_REF', name: 'refC' },
                        { type: 'SCOPE_FILTER', scope: 'myScopeB' }
                    ]
                },
                { type: 'CLIENT_FILTER', clientID: 'provider' }
            ]
        }],
        expectedRuleScope: ((): Scope => {
            let expressions = new Array<ExpressionBase>();
            expressions.push(
                new LogicalOr([
                    new LogicalAnd([
                        new ScopeFilter('myScope'),
                        new ClientFilter('myClient')
                    ]),
                    new VariableReference('refA'),
                    new LogicalAnd([
                        new VariableReference('refB'),
                        new VariableReference('refC'),
                        new ScopeFilter('myScopeB')
                    ]),
                    new ClientFilter('provider')
                ]),
            );
            return new Scope(expressions);
        })(),
    },

    {  // #4
        code: '(var_ref & scope = myScope & client = myClient);',
        expectedExpressions: [{
            type: 'AND',
            expressions: [
                { type: 'VARIABLE_REF', name: 'var_ref' },
                { type: 'SCOPE_FILTER', scope: 'myScope' },
                { type: 'CLIENT_FILTER', clientID: 'myClient' }
            ]
        }],
        expectedRuleScope: ((): Scope => {
            let expressions = new Array<ExpressionBase>();
            expressions.push(
                new LogicalAnd([
                    new VariableReference('var_ref'),
                    new ScopeFilter('myScope'),
                    new ClientFilter('myClient')
                ])
            );
            return new Scope(expressions);
        })(),
    },

    { //# 5
        code: `(A | scope = myScopeA) & 
            (B | scope = myScopeB) | 
            (C | scope = myScopeC);`,
        expectedExpressions: [{
            type: 'OR',
            expressions: [
                {
                    type: 'AND',
                    expressions: [
                        {
                            type: 'OR',
                            expressions: [
                                { type: 'VARIABLE_REF', name: 'A' },
                                { type: 'SCOPE_FILTER', scope: 'myScopeA' }
                            ]
                        },
                        {
                            type: 'OR',
                            expressions: [
                                { type: 'VARIABLE_REF', name: 'B' },
                                { type: 'SCOPE_FILTER', scope: 'myScopeB' }
                            ]
                        }
                    ]
                },
                {
                    type: 'OR',
                    expressions: [
                        { type: 'VARIABLE_REF', name: 'C' },
                        { type: 'SCOPE_FILTER', scope: 'myScopeC' }
                    ]
                }
            ]
        }],
        expectedRuleScope: ((): Scope => {
            let expressions = new Array<ExpressionBase>();
            expressions.push(
                new LogicalOr([
                    new LogicalAnd([
                        new LogicalOr([
                            new VariableReference('A'),
                            new ScopeFilter('myScopeA')
                        ]),
                        new LogicalOr([
                            new VariableReference('B'),
                            new ScopeFilter('myScopeB')
                        ]),
                    ]),
                    new LogicalOr([
                        new VariableReference('C'),
                        new ScopeFilter('myScopeC')
                    ])
                ])
            )
            return new Scope(expressions);
        })(),
    },



    { // # 6
        code: `( 
            var_ref | scope = myScope | 
          ( scope = ScopeB & client = myClient ) |
            client = superProvider 
        );`,
        expectedExpressions: [{
            type: 'OR',
            expressions: [
                { type: 'VARIABLE_REF', name: 'var_ref' },
                { type: 'SCOPE_FILTER', scope: 'myScope' },
                {
                    type: 'AND',
                    expressions: [
                        { type: 'SCOPE_FILTER', scope: 'ScopeB' },
                        { type: 'CLIENT_FILTER', clientID: 'myClient' }
                    ]
                },
                { type: 'CLIENT_FILTER', clientID: 'superProvider' }
            ]
        }],
        expectedRuleScope: ((): Scope => {
            let expressions = new Array<ExpressionBase>();
            expressions.push(
                new LogicalOr([
                    new VariableReference('var_ref'),
                    new ScopeFilter('myScope'),
                    new LogicalAnd([
                        new ScopeFilter('ScopeB'),
                        new ClientFilter('myClient')
                    ]),
                    new ClientFilter('superProvider')
                ])
            );
            return new Scope(expressions);
        })(),
    },


    { // # 7
        code: `( 
                scope = myScope | 
              ( scope = ScopeB & ( client = myClient | client = otherClient ) ) |
                client = superProvider  &
                (scope = dummyScope | scope = ScopeC  & allow ) & !deny
            );`,
        expectedExpressions: [{
            type: 'OR',
            expressions: [
                { type: 'SCOPE_FILTER', scope: 'myScope' },
                {
                    type: 'AND',
                    expressions: [
                        { type: 'SCOPE_FILTER', scope: 'ScopeB' },
                        {
                            type: 'OR',
                            expressions: [
                                { type: 'CLIENT_FILTER', clientID: 'myClient' },
                                { type: 'CLIENT_FILTER', clientID: 'otherClient' }
                            ]
                        }
                    ]
                },
                {
                    type: 'AND',
                    expressions: [
                        { type: 'CLIENT_FILTER', clientID: 'superProvider' },
                        {
                            type: 'OR',
                            expressions: [
                                { type: 'SCOPE_FILTER', scope: 'dummyScope' },
                                {
                                    type: 'AND',
                                    expressions: [
                                        { type: 'SCOPE_FILTER', scope: 'ScopeC' },
                                        { type: 'VARIABLE_REF', name: 'allow' }
                                    ]
                                }
                            ]
                        },
                        {
                            type: 'NOT',
                            expression: { type: 'VARIABLE_REF', name: 'deny' }
                        }
                    ]
                }
            ]
        }],
        expectedRuleScope: ((): Scope => {
            let expressions = new Array<ExpressionBase>();
            expressions.push(
                new LogicalOr([
                    new ScopeFilter('myScope'),
                    new LogicalAnd([
                        new ScopeFilter('ScopeB'),
                        new LogicalOr([
                            new ClientFilter('myClient'),
                            new ClientFilter('otherClient')
                        ])
                    ]),
                    new LogicalAnd([
                        new ClientFilter('superProvider'),
                        new LogicalOr([
                            new ScopeFilter('dummyScope'),
                            new LogicalAnd([
                                new ScopeFilter('ScopeC'),
                                new VariableReference('allow')
                            ])
                        ]),
                        new LogicalNot(new VariableReference('deny'))
                    ])
                ])
            )
            return new Scope(expressions);
        })(),
    },
    { // #8
        code: `allow & 
            ( permitAll & (client = superProvider | client = providerB) ) |
            (scope =myScope & client = myClient) & !deny;`,
        expectedExpressions: [{
            type: 'OR',
            expressions: [
                {
                    type: 'AND',
                    expressions: [
                        { type: 'VARIABLE_REF', name: 'allow' },
                        {
                            type: 'AND',
                            expressions: [
                                { type: 'VARIABLE_REF', name: 'permitAll' },
                                {
                                    type: 'OR',
                                    expressions: [
                                        { type: 'CLIENT_FILTER', clientID: 'superProvider' },
                                        { type: 'CLIENT_FILTER', clientID: 'providerB' }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    type: 'AND',
                    expressions: [
                        { type: 'SCOPE_FILTER', scope: 'myScope' },
                        { type: 'CLIENT_FILTER', clientID: 'myClient' },
                        {
                            type: 'NOT',
                            expression: { type: 'VARIABLE_REF', name: 'deny' }
                        }
                    ]
                }
            ]
        }],
        expectedRuleScope: ((): Scope => {
            let expressions = new Array<ExpressionBase>();
            expressions.push(
                new LogicalOr([
                    new LogicalAnd([
                        new VariableReference('allow'),
                        new LogicalAnd([
                            new VariableReference('permitAll'),
                            new LogicalOr([
                                new ClientFilter('superProvider'),
                                new ClientFilter('providerB')
                            ])
                        ])
                    ]),
                    new LogicalAnd([
                        new ScopeFilter('myScope'),
                        new ClientFilter('myClient'),
                        new LogicalNot(new VariableReference('deny'))
                    ])
                ])
            )
            return new Scope(expressions);
        })(),
    }
];