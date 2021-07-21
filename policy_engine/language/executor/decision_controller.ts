import { ExecutionException } from "../../common/exceptions/execution_exception";
import { Policy } from "../model/policy/policy";
import { Rule } from "../model/policy/rule/rule";
import { ExecutionContext } from "./decision_context";
import { execute } from "./decision_util";
import { StackElement } from './execution_stack';
import { RuleType } from "../model/policy/rule/rule_type";

import { cloneDeep } from "lodash";


export class ExecutionController {
    private scopes: Array<string>;
    private clientId: string;
    private policies: Array<Policy>;

    private entryStackElement: StackElement = null;
    private scopesPreviouslyGranted: Array<string> = [];


    constructor(scopes: Array<string>,
        clientId: string,
        policies: Array<Policy>,
        scopesPreviouslyGranted?: Array<string>
    ) {
        this.scopes = scopes;
        this.clientId = clientId;
        this.policies = policies;
        this.validateParams();
        this.findEntryStackElement();
        if (scopesPreviouslyGranted !== undefined) {
            this.scopesPreviouslyGranted = scopesPreviouslyGranted;
        }
    }


    private validateParams() {
        if (!this.policies || this.policies.length === 0) {
            throw new ExecutionException("No policies given, a decision is not possible.");
        }
        if (!this.scopes || this.scopes.length === 0) {
            throw new ExecutionException('No scopes given, a decision is not possible.');
        }
        if (!this.clientId || this.clientId.length === 0) {
            throw new ExecutionException("No clientId given, a decision is not possible.");
        }
    }


    public decide(): boolean {
        for (let i = 0; i < this.scopes.length; i++) {
            if (!this.getSingleDecision(i)) {
                return false;
            }
        }
        return true;
    }


    public getSingleDecision(scopeIndex: number): boolean {
        const remainingScopes = [...this.scopes];
        const currentScope = remainingScopes.splice(scopeIndex, 1)[0];
        const ctx = new ExecutionContext(
            this.clientId, currentScope, remainingScopes,
            cloneDeep(this.policies), this.scopesPreviouslyGranted);
        ctx.pushRule(cloneDeep(this.entryStackElement));
        const result = execute(ctx);
        ctx.popRule();
        return result;
    }


    private findEntryStackElement(): void {
        for (const policy of this.policies) {
            const entryPointFound = this.findEntryPoint(policy);
            if (!entryPointFound) {
                continue;
            }
            else if (this.entryStackElement !== null) {
                throw new ExecutionException("Found multiple 'granttoken' rules.");
            }
            this.entryStackElement =
                [policy, entryPointFound];
        }
        if (!this.entryStackElement) {
            throw new ExecutionException("Unable to find a policy with a 'granttoken' rule.");
        }
    }


    private findEntryPoint(policy: Policy): Rule {
        return policy.decisionRules.find(rule =>
            rule.type === RuleType.BOOLEAN && rule.name.toUpperCase() === 'GRANTTOKEN');
    }
}