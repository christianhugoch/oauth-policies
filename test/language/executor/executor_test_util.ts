import { buildPolicy } from "../../../policy_engine/language/builder/builder_util";
import { ExecutionController } from "../../../policy_engine/language/executor/decision_controller";
import { RuleType } from "../../../policy_engine/language/model/policy/rule/rule_type";
import { parse } from "../../../policy_engine/language/parser/parser";
import { Policy } from "../../../policy_engine/language/model/policy/policy";

import { equal } from "should";


function prepareCode(code: string, ruleType: RuleType): string {
    let policyCode;
    switch (ruleType) {
        case RuleType.BOOLEAN: {
            policyCode = `granttoken { ${code} }`;
            break;
        }
        case RuleType.PERMIT:
        case RuleType.DENY: {
            policyCode = `
                rule : ${ruleType === RuleType.PERMIT ? "true" : "false"} {
                    ${code}
                }
                granttoken { 
                    result := ${ruleType === RuleType.PERMIT ? "false" : "true"};
                    result := $rule; 
                    result;
                }
            `
            break;
        }
        default: {
            throw new Error("invalid rule type");
        }
    }
    return policyCode;
}


export function buildPolicyHelper(testData: any, ruleType: RuleType) {
    let normalCode = prepareCode(testData.code, ruleType);
    let codeWithNot = prepareCode(testData.codeWithNot, ruleType);
    return [
        buildPolicy(parse(normalCode, "dummy")),
        buildPolicy(parse(codeWithNot, "dummy"))
    ];
}


export function checkHelper(input: any, normalArgs: any, withNotArgs: any) {
    equal(new ExecutionController(input.scopes, input.client, [normalArgs.policy]).decide(), normalArgs.expected);
    equal(new ExecutionController(input.scopes, input.client, [withNotArgs.policy]).decide(), withNotArgs.expected);
}


export function buildPolicyWithGrantToken(expression: string, varInits: string): Policy {
    return buildPolicy(
        parse(`granttoken {
            ${varInits}
            ${expression}
        }`, "dummy")
    );
}