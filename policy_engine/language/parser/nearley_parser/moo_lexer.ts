import moo from "moo";

const ruleScopeDefaultTokens = {
    scopes: { match: 'scopes', push: 'generic_state' },
    clients: { match: 'clients', push: 'generic_state' },
    scope: { match: 'scope', push: 'generic_state' },
    clientID: { match: 'client', push: 'generic_state' },
    files: { match: 'files', push: 'generic_state' },
    day: { match: 'day', push: 'day_filter_state' },
    time: { match: 'time', push: 'time_filter_state' },
    dollar: { match: '$', push: 'rule_call_state' },

    rCparen: { match: '}', next: 'main_state' },

    not: { match: '!', push: 'rule_scope_state' },
    verticalBar: { match: '|', push: 'rule_scope_state' },
    ambersand: { match: '&', push: 'rule_scope_state' },
    lparen: { match: '(', push: 'rule_scope_state' },
    rparen: { match: ')', push: 'rule_scope_state' },
    empty: { match: /[ \t\s]+/, lineBreaks: true },
};

const popStateTokens = {
    not: { match: '!', pop: 1 },
    verticalBar: { match: '|', pop: 1 },
    ambersand: { match: '&', pop: 1 },
    lparen: { match: '(', pop: 1 },
    rparen: { match: ')', pop: 1 },
    semicolon: { match: ';', push: 'rule_scope_state' }
};


export const lexer = moo.states({
    main_state: {
        importToken: /(?:\s|^)*import\s/,
        as: /\sas\s/,
        word: /[a-zA-Z\\._-]+/,
        semicolon: ';',
        colon: { match: ":", next: 'rule_type_state' },
        lCparen: { match: '{', push: 'rule_scope_state' },
        empty: { match: /[ \t\s]+/, lineBreaks: true },
        unknown: /.+/,
    },
    rule_type_state: {
        file: 'file',
        role: 'role',
        boolean: ['true', 'false'],
        lCparen: { match: '{', push: 'rule_scope_state' },
        empty: { match: /[ \t\s]+/, lineBreaks: true },
        unknown: /.+/,
    },
    rule_scope_state: {
        ...ruleScopeDefaultTokens,
        boolean: ['true', 'false'],
        word: /[a-zA-Z\\._-]+/,
        equalAssignment: { match: ':=', push: 'var_init_state' },
        semicolon: ';',
        unknown: /.+/,
    },
    var_init_state: {
        ...ruleScopeDefaultTokens,
        boolean: ['true', 'false'],
        semicolon: { match: ';', pop: 1 },
        unknown: /.+/,
    },
    generic_state: {
        equal: '=',
        word: /[a-zA-Z\\._-]+/,
        comma: ',',
        ...popStateTokens,
        empty: { match: /[ \t\s]+/, lineBreaks: true },
        unknown: /.+/,
    },
    day_filter_state: {
        equal: '=',
        dayName: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        ...popStateTokens,
        empty: { match: /[ \t\s]+/, lineBreaks: true },
        unknown: /.+/,
    },
    time_filter_state: {
        equal: '=',
        lower: '<',
        greater: '>',
        number: /[0-9]/,
        colon: ':',
        ...popStateTokens,
        empty: { match: /[ \t\s]+/, lineBreaks: true },
        unknown: /.+/,
    },
    rule_call_state: {
        stringWithoutDot: /[a-zA-Z]+/,
        dot: '.',
        ...popStateTokens,
        empty: { match: /[ \t\s]+/, lineBreaks: true },
        unknown: /.+/,
    }
});