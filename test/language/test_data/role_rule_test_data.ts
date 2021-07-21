import { Policy } from "../../../policy_engine/language/model/policy/policy";
import { ExpressionBase } from "../../../policy_engine/language/model/policy/rule/expression/expression_base";
import { FilterExpression } from "../../../policy_engine/language/model/policy/rule/expression/filter/filter_expression";
import { LogicalOr } from "../../../policy_engine/language/model/policy/rule/expression/filter/logical_filter/or";
import { ClientFilter } from "../../../policy_engine/language/model/policy/rule/expression/filter/single_filter/client_filter";
import { ScopeFilter } from "../../../policy_engine/language/model/policy/rule/expression/filter/single_filter/scope_filter";
import { Rule } from "../../../policy_engine/language/model/policy/rule/rule";
import { RuleType } from "../../../policy_engine/language/model/policy/rule/rule_type";
import { Scope } from "../../../policy_engine/language/model/policy/rule/scope";


export let emptyRule = {
    code: `empty : role {}`,
    get codeWithGrantToken() {
        return `
            ${this.code}
            granttoken {
                $empty;
            }
        `;
    },
    expectedTree: [
        { type: 'ROLE_RULE', name: 'empty', effect: 'role', scope: new Array<any>() }
    ],
    expectedObject: ((): Policy => {
        let rule = new Rule("empty", RuleType.ROLE, new Scope([]));
        return new Policy("dummy", [rule], [], []);
    })(),
};


export let ruleWithScopes = {
    code: `
    withScopes : role {
        scopes = scopeA,scopeB, scopeC;
    }`,
    get codeWithGrantToken() {
        return `
            ${this.code}
            granttoken { $withScopes; }
        `;
    },
    expectedTree: [
        {
            type: 'ROLE_RULE',
            name: 'withScopes',
            effect: 'role',
            scope: [
                {
                    type: 'SCOPE_LIST',
                    scopes: ['scopeA', 'scopeB', 'scopeC']
                }
            ]
        }
    ],
    expectedObject: ((): Policy => {
        let expressions = Array<ExpressionBase>(
            new LogicalOr(new Array<FilterExpression>(
                new ScopeFilter("scopeA"),
                new ScopeFilter("scopeB"),
                new ScopeFilter("scopeC"),
            ))
        );
        let rule = new Rule("withScopes", RuleType.ROLE, new Scope(expressions));
        return new Policy("dummy", [rule], [], []);
    })(),
}


export let ruleWithTwoScopesCommands = {
    code: `
    withScopes : role {
        scopes = scopeA,scopeB, scopeC;
        scopes=scopeD , scopeE , scopeF;
    }
    `,
    get codeWithGrantToken() {
        return `
            ${this.code}
            granttoken { $withScopes; }
        `;
    },
    expectedTree: [
        {
            type: 'ROLE_RULE',
            name: 'withScopes',
            effect: 'role',
            scope: [
                {
                    type: 'SCOPE_LIST',
                    scopes: ['scopeA', 'scopeB', 'scopeC']
                },
                {
                    type: 'SCOPE_LIST',
                    scopes: ['scopeD', 'scopeE', 'scopeF']
                }
            ]
        }
    ],
    expectedObject: ((): Policy => {
        let expressions = Array<ExpressionBase>(
            new LogicalOr(new Array<FilterExpression>(
                new ScopeFilter("scopeA"),
                new ScopeFilter("scopeB"),
                new ScopeFilter("scopeC"),
                new ScopeFilter("scopeD"),
                new ScopeFilter("scopeE"),
                new ScopeFilter("scopeF"),
            )),
        );
        let rule = new Rule("withScopes", RuleType.ROLE, new Scope(expressions));
        return new Policy("dummy", [rule], [], []);
    })(),
};


export let ruleWithClientsCommand = {
    code: `
    withClients : role {
        clients = clientA,clientB, clientC;
    }
    `,
    get codeWithGrantToken() {
        return `
            ${this.code}
            granttoken { $withClients; }
        `;
    },
    expectedTree: [
        {
            type: 'ROLE_RULE',
            name: 'withClients',
            effect: 'role',
            scope: [
                {
                    type: 'CLIENT_LIST',
                    clients: ['clientA', 'clientB', 'clientC']
                }
            ]
        }
    ],
    expectedObject: ((): Policy => {
        let expressions = Array<ExpressionBase>(
            new LogicalOr(new Array<FilterExpression>(
                new ClientFilter("clientA"),
                new ClientFilter("clientB"),
                new ClientFilter("clientC"),
            ))
        );
        let rule = new Rule("withClients", RuleType.ROLE, new Scope(expressions));
        return new Policy("dummy", [rule], [], []);
    })(),
};


export let ruleWithMultipleClientCommands = {
    code: `
    withClients : role {
        clients = clientA,clientB, clientC;
        clients=clientD , clientE , clientF;
    }
    `,
    get codeWithGrantToken() {
        return `
            ${this.code}
            granttoken { $withClients; }
        `;
    },
    expectedTree: [
        {
            type: 'ROLE_RULE',
            name: 'withClients',
            effect: 'role',
            scope: [
                {
                    type: 'CLIENT_LIST',
                    clients: ['clientA', 'clientB', 'clientC']
                },
                {
                    type: 'CLIENT_LIST',
                    clients: ['clientD', 'clientE', 'clientF']
                }
            ]
        }
    ],
    expectedObject: ((): Policy => {
        let expressions = Array<ExpressionBase>(
            new LogicalOr(new Array<FilterExpression>(
                new ClientFilter("clientA"),
                new ClientFilter("clientB"),
                new ClientFilter("clientC"),
                new ClientFilter("clientD"),
                new ClientFilter("clientE"),
                new ClientFilter("clientF"),
            )),
        );
        let rule = new Rule("withClients", RuleType.ROLE, new Scope(expressions));
        return new Policy("dummy", [rule], [], []);
    })(),
};

export let ruleWithMultipleScopesAndClients = {
    code: `
    withClientsAndScopes : role {
        clients = clientA,clientB, clientC;
        clients=clientD , clientE , clientF;
        scopes = scopeA,scopeB, scopeC;
        scopes=scopeD , scopeE , scopeF;
    }`,
    get codeWithGrantToken() {
        return `
            ${this.code}
            granttoken { $withClientsAndScopes; }
        `;
    },
    expectedTree: [
        {
            type: 'ROLE_RULE',
            name: 'withClientsAndScopes',
            effect: 'role',
            scope: [
                {
                    type: 'CLIENT_LIST',
                    clients: ['clientA', 'clientB', 'clientC']
                },
                {
                    type: 'CLIENT_LIST',
                    clients: ['clientD', 'clientE', 'clientF']
                },
                {
                    type: 'SCOPE_LIST',
                    scopes: ['scopeA', 'scopeB', 'scopeC']
                },
                {
                    type: 'SCOPE_LIST',
                    scopes: ['scopeD', 'scopeE', 'scopeF']
                }
            ]
        }
    ],
    expectedObject: ((): Policy => {
        let expressions = Array<ExpressionBase>(
            new LogicalOr(new Array<FilterExpression>(
                new ClientFilter("clientA"),
                new ClientFilter("clientB"),
                new ClientFilter("clientC"),
                new ClientFilter("clientD"),
                new ClientFilter("clientE"),
                new ClientFilter("clientF"),
            )),
            new LogicalOr(new Array<FilterExpression>(
                new ScopeFilter("scopeA"),
                new ScopeFilter("scopeB"),
                new ScopeFilter("scopeC"),
                new ScopeFilter("scopeD"),
                new ScopeFilter("scopeE"),
                new ScopeFilter("scopeF"),
            )),
        );
        let rule = new Rule("withClientsAndScopes", RuleType.ROLE, new Scope(expressions));
        return new Policy("dummy", [rule], [], []);
    })(),
}