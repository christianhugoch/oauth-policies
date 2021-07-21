import { Policy } from '../model/policy/policy';
import { Rule } from '../model/policy/rule/rule';
import { ExecutionStack, StackElement, StackElementType } from './execution_stack';


export class ExecutionContext {
    clientId: string;
    currentScope: string;
    remainingScopes: string[];
    policies: Array<Policy>;
    currentScopeWasMatched: boolean = null;

    private stack: ExecutionStack = new ExecutionStack();
    private currentStackElement: StackElement = undefined;
    previouslyGrantedScopes: Array<string>;


    constructor(clientId: string,
        currentScope: string, remainingScopes: string[],
        policies: Array<Policy>,
        scopesPreviouslyGranted: Array<string>) {

        this.clientId = clientId;
        this.currentScope = currentScope;
        this.remainingScopes = remainingScopes;
        this.policies = policies;
        this.previouslyGrantedScopes = scopesPreviouslyGranted;
    }


    pushRule(stackElement: StackElement): void {
        this.stack.push(stackElement);
        this.currentStackElement = stackElement;
    }


    popRule(): StackElement {
        const result = this.stack.pop();
        this.currentStackElement = this.stack.peek();
        return result;
    }


    currentRule(): Rule {
        return this.currentStackElement[StackElementType.RULE];
    }


    currentPolicy(): Policy {
        return this.currentStackElement[StackElementType.POLICY];
    }
}
