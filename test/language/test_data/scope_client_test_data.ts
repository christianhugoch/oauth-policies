import { ClientFilter } from "../../../policy_engine/language/model/policy/rule/expression/filter/single_filter/client_filter";
import { ScopeFilter } from "../../../policy_engine/language/model/policy/rule/expression/filter/single_filter/scope_filter";


export let oneScope = {
    code: `scope = scope;`,
    codeWithNot: `!scope = scope;`,
    expectedTree: [
        { type: 'SCOPE_FILTER', scope: 'scope' },
    ],
    expectedObject: (() => {
        return [
            new ScopeFilter("scope"),
        ];
    })(),
};


export let multipleScopes = {
    code: `scope = scope; scope = scopeB;`,
    codeWithNot: `!scope = scope; !scope = scopeB;`,
    expectedTree: [
        { type: 'SCOPE_FILTER', scope: 'scope' },
        { type: 'SCOPE_FILTER', scope: 'scopeB' },
    ],
    expectedObject: (() => {
        return [
            new ScopeFilter("scope"),
            new ScopeFilter("scopeB"),
        ];
    })(),
};


export let oneClient = {
    code: `
    client = client;
    `,
    codeWithNot: `
    !client = client;
    `,
    expectedTree: [
        { type: 'CLIENT_FILTER', clientID: 'client' },
    ],
    expectedObject: (() => {
        return [
            new ClientFilter("client"),
        ];
    })(),
};


export let multipleClients = {
    code: `
    client = client; client = clientB;
    `,
    codeWithNot: `
    !client = client; !client = clientB;
    `,
    expectedTree: [
        { type: 'CLIENT_FILTER', clientID: 'client' },
        { type: 'CLIENT_FILTER', clientID: 'clientB' },
    ],
    expectedObject: (() => {
        return [
            new ClientFilter("client"),
            new ClientFilter("clientB"),
        ];
    })(),
};


export let multipleScopesAndOneClient = {
    code: `
    
        scope = scope; scope = scopeB; 
        client = client;
    
    `,
    codeWithNot: `
    
    !scope = scope; !scope = scopeB; 
    !client = client;

    `,
    expectedTree: [
        { type: 'SCOPE_FILTER', scope: 'scope' },
        { type: 'SCOPE_FILTER', scope: 'scopeB' },
        { type: 'CLIENT_FILTER', clientID: 'client' },
    ],
    expectedObject: (() => {
        return [
            new ScopeFilter("scope"),
            new ScopeFilter("scopeB"),
            new ClientFilter("client"),
        ];
    })(),
};


export let multipleScopesAndClients = {
    code: `
    
        scope = scope; scope = scopeB; 
        client = client; client = clientB;
    
    `,
    codeWithNot: `
    
    !scope = scope; !scope = scopeB; 
    !client = client; !client = clientB;

    `,
    expectedTree: [
        { type: 'SCOPE_FILTER', scope: 'scope' },
        { type: 'SCOPE_FILTER', scope: 'scopeB' },
        { type: 'CLIENT_FILTER', clientID: 'client' },
        { type: 'CLIENT_FILTER', clientID: 'clientB' },
    ],
    expectedObject: (() => {
        return [
            new ScopeFilter("scope"),
            new ScopeFilter("scopeB"),
            new ClientFilter("client"),
            new ClientFilter("clientB"),
        ];
    })(),
};