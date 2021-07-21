import { Policy } from "../model/policy/policy"
import { Rule } from "../model/policy/rule/rule"


export type StackElement = [Policy, Rule];

export enum StackElementType {
    POLICY, RULE
}


export class ExecutionStack {
    items: Array<StackElement> = new Array<StackElement>();


    push(element: StackElement): void {
        this.items.push(element);
    }


    pop(): StackElement {
        return this.items.pop();
    }


    peek(): StackElement {        
        return this.size() > 0 ? this.items[this.size() - 1] : null;
    }


    size(): number {
        return this.items.length;
    }
}
