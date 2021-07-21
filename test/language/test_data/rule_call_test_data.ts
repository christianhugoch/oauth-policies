import { Policy } from "../../../policy_engine/language/model/policy/policy";
import { BooleanConst } from "../../../policy_engine/language/model/policy/rule/expression/filter/single_filter/boolean_const";
import { RuleCall } from "../../../policy_engine/language/model/policy/rule/expression/filter/single_filter/rule_call";
import { RuleCallWithAlias } from "../../../policy_engine/language/model/policy/rule/expression/filter/single_filter/rule_call_with_alias";
import { Import } from "../../../policy_engine/language/model/policy/rule/expression/import/import_expression";
import { Rule } from "../../../policy_engine/language/model/policy/rule/rule";
import { RuleType } from "../../../policy_engine/language/model/policy/rule/rule_type";
import { Scope } from "../../../policy_engine/language/model/policy/rule/scope";


export let oneRuleInSamePolicy = {
    code: `
        ruleToCall {
            true;
        }

        granttoken {
            $ruleToCall;
        }
    `,
    expectedTree: [
        {
            type: 'BOOLEAN_RULE',
            name: 'ruleToCall',
            effect: 'boolean',
            scope: [{ type: 'BOOLEAN_CONST', value: 'true' }]
        },
        {
            type: 'BOOLEAN_RULE',
            name: 'granttoken',
            effect: 'boolean',
            scope: [{ type: 'RULE_CALL', ruleName: 'ruleToCall' }]
        }
    ],
    expectedObject: ((): Policy => {
        let ruleToCall = new Rule("ruleToCall", RuleType.BOOLEAN,
            new Scope([new BooleanConst(true)])
        );

        let caller = new Rule("granttoken", RuleType.BOOLEAN,
            new Scope([new RuleCall("ruleToCall")])
        );
        return new Policy("dummy", [ruleToCall, caller], [], []);
    })(),
};

export let multipleRulesInSamePolicy = {
    code: `
        ruleToCallA {
            true;
        }
        ruleToCallB {
            false;
        }

        callerA {
            $ruleToCallA;
        }
        callerB : true {
            $ruleToCallB;
        }
        callerC : false  {
            $ruleToCallB;
        }
    `,
    get codeWithGrantToken() {
        return `
            ${this.code}
            granttoken { 
                resultOfCallerA := $callerA;
                
                resultOfCallerB := false;
                resultOfCallerB := $callerB;

                resultOfCallerC := false;
                resultOfCallerC := $callerC;

                resultOfCallerA & scope = scopeA | 
                    resultOfCallerB & scope = scopeB |
                    resultOfCallerC & scope = scopeC;
             }    
        `;
    },
    expectedTree: [
        {
            type: 'BOOLEAN_RULE',
            name: 'ruleToCallA',
            effect: 'boolean',
            scope: [{ type: 'BOOLEAN_CONST', value: 'true' }]
        },
        {
            type: 'BOOLEAN_RULE',
            name: 'ruleToCallB',
            effect: 'boolean',
            scope: [{ type: 'BOOLEAN_CONST', value: 'false' }]
        },
        {
            type: 'BOOLEAN_RULE',
            name: 'callerA',
            effect: 'boolean',
            scope: [{ type: 'RULE_CALL', ruleName: 'ruleToCallA' }]
        },
        {
            type: 'RULE',
            name: 'callerB',
            effect: 'true',
            scope: [{ type: 'RULE_CALL', ruleName: 'ruleToCallB' }]
        },
        {
            type: 'RULE',
            name: 'callerC',
            effect: 'false',
            scope: [{ type: 'RULE_CALL', ruleName: 'ruleToCallB' }]
        }
    ],
    expectedObject: ((): Policy => {
        let rules = new Array<Rule>(
            new Rule("ruleToCallA", RuleType.BOOLEAN,
                new Scope([new BooleanConst(true)])
            ),
            new Rule("ruleToCallB", RuleType.BOOLEAN,
                new Scope([new BooleanConst(false)])
            ),
            new Rule("callerA", RuleType.BOOLEAN,
                new Scope([new RuleCall("ruleToCallA")])
            ),
            new Rule("callerB", RuleType.PERMIT,
                new Scope([new RuleCall("ruleToCallB")])
            ),
            new Rule("callerC", RuleType.DENY,
                new Scope([new RuleCall("ruleToCallB")])
            )
        );
        return new Policy("dummy", rules, [], []);
    })(),
};


export let oneRuleOverAlias = {
    code: `
    import subPolicy as sb;
    caller : true {
        $sb.ruleToCall;
    }
    `,
    get codeWithGrantToken() {
        return `
        ${this.code}
        granttoken {
            result := false;
            result := $caller;
            result;
        }
        `;
    },
    subPolicy: `
        ruleToCall {
            scope = scopeA;
        }
    `,
    expectedTree: [
        { type: 'IMPORT', policy: 'subPolicy', alias: 'sb' },
        {
            type: 'RULE',
            name: 'caller',
            effect: 'true',
            scope: [
                {
                    type: 'RULE_CALL_WITH_ALIAS',
                    importAlias: 'sb',
                    ruleName: 'ruleToCall'
                }
            ]
        }
    ],
    expectedObject: ((): Policy => {
        let importCmd = new Import("subPolicy", "sb");
        let callWithAlias = new RuleCallWithAlias("ruleToCall", "sb");
        let rule = new Rule("caller", RuleType.PERMIT,
            new Scope([callWithAlias])
        );
        return new Policy("dummy", [rule], [], [importCmd]);
    })(),
};


export let multipleRulesOverAliases = {
    code: `
    import subPolicyA as sbA;
    import subPolicyB as sbB;

    caller : true {
        $sbA.ruleToCallA;
        $sbA.ruleToCallB;
        $sbB.ruleToCallA;
        $sbB.ruleToCallB;
    }
    `,
    get codeWithGrantToken() {
        return `
            ${this.code}
            granttoken {
                result := false;
                result := $caller;
                result;
            }
        `;
    },
    subPolicyA: `
        ruleToCallA {
            scope = scopeA;
        }
        ruleToCallB {
            !client = clientA;
        }
    `,
    subPolicyB: `
        ruleToCallA {
            scope = scopeB;
        }
        ruleToCallB {
            !client = clientB;
        }
    `,
    expectedTree: [
        { type: 'IMPORT', policy: 'subPolicyA', alias: 'sbA' },
        { type: 'IMPORT', policy: 'subPolicyB', alias: 'sbB' },
        {
            type: 'RULE',
            name: 'caller',
            effect: 'true',
            scope: [
                {
                    type: 'RULE_CALL_WITH_ALIAS',
                    importAlias: 'sbA',
                    ruleName: 'ruleToCallA'
                },
                {
                    type: 'RULE_CALL_WITH_ALIAS',
                    importAlias: 'sbA',
                    ruleName: 'ruleToCallB'
                },
                {
                    type: 'RULE_CALL_WITH_ALIAS',
                    importAlias: 'sbB',
                    ruleName: 'ruleToCallA'
                },
                {
                    type: 'RULE_CALL_WITH_ALIAS',
                    importAlias: 'sbB',
                    ruleName: 'ruleToCallB'
                }
            ]
        }
    ],
    expectedObject: ((): Policy => {
        let importCmds = Array<Import>(
            new Import("subPolicyA", "sbA"),
            new Import("subPolicyB", "sbB")
        );
        let caller = new Rule("caller", RuleType.PERMIT,
            new Scope([
                new RuleCallWithAlias("ruleToCallA", "sbA"),
                new RuleCallWithAlias("ruleToCallB", "sbA"),
                new RuleCallWithAlias("ruleToCallA", "sbB"),
                new RuleCallWithAlias("ruleToCallB", "sbB"),
            ])
        );
        return new Policy("dummy", [caller], [], importCmds);
    })(),
};

export let aliasesAndInSamePolicy = {
    code: `
    import subPolicyA as sbA;
    import subPolicyB as sbB;

    ruleToCallA { true; }
    ruleToCallB { true; }
    caller : true {
        $sbA.ruleToCallA;
        $sbA.ruleToCallB;
        $sbB.ruleToCallA;
        $sbB.ruleToCallB;
        $ruleToCallA;
        $ruleToCallB;       
    }
 
    `,
    get codeWithGrantToken() {
        return `
            ${this.code}
            granttoken {
                result := false;
                result := $caller;
                result;
            }
        `;
    },
    subPolicyA: `
        ruleToCallA {
            scope = scopeA;
        }
        ruleToCallB {
            !client = clientA;
        }
    `,
    subPolicyB: `
        ruleToCallA {
            scope = scopeB;
        }
        ruleToCallB {
            !client = clientB;
        }
    `,
    expectedTree: [
        { type: 'IMPORT', policy: 'subPolicyA', alias: 'sbA' },
        { type: 'IMPORT', policy: 'subPolicyB', alias: 'sbB' },
        {
            type: 'BOOLEAN_RULE',
            name: 'ruleToCallA',
            effect: 'boolean',
            scope: [{ type: 'BOOLEAN_CONST', value: 'true' }]
        },
        {
            type: 'BOOLEAN_RULE',
            name: 'ruleToCallB',
            effect: 'boolean',
            scope: [{ type: 'BOOLEAN_CONST', value: 'true' }]
        },
        {
            type: 'RULE',
            name: 'caller',
            effect: 'true',
            scope: [
                {
                    type: 'RULE_CALL_WITH_ALIAS',
                    importAlias: 'sbA',
                    ruleName: 'ruleToCallA'
                },
                {
                    type: 'RULE_CALL_WITH_ALIAS',
                    importAlias: 'sbA',
                    ruleName: 'ruleToCallB'
                },
                {
                    type: 'RULE_CALL_WITH_ALIAS',
                    importAlias: 'sbB',
                    ruleName: 'ruleToCallA'
                },
                {
                    type: 'RULE_CALL_WITH_ALIAS',
                    importAlias: 'sbB',
                    ruleName: 'ruleToCallB'
                },
                { type: 'RULE_CALL', ruleName: 'ruleToCallA' },
                { type: 'RULE_CALL', ruleName: 'ruleToCallB' }
            ]
        }
    ],
    expectedObject: ((): Policy => {
        let importCmds = Array<Import>(
            new Import("subPolicyA", "sbA"),
            new Import("subPolicyB", "sbB")
        );
        let ruleToCallA = new Rule("ruleToCallA", RuleType.BOOLEAN,
            new Scope([new BooleanConst(true)])
        );
        let ruleToCallB = new Rule("ruleToCallB", RuleType.BOOLEAN,
            new Scope([new BooleanConst(true)])
        );
        let caller = new Rule("caller", RuleType.PERMIT,
            new Scope([
                new RuleCallWithAlias("ruleToCallA", "sbA"),
                new RuleCallWithAlias("ruleToCallB", "sbA"),
                new RuleCallWithAlias("ruleToCallA", "sbB"),
                new RuleCallWithAlias("ruleToCallB", "sbB"),
                new RuleCall("ruleToCallA"),
                new RuleCall("ruleToCallB"),
            ])
        );
        return new Policy("dummy", [ruleToCallA, ruleToCallB, caller], [], importCmds);
    })(),
}