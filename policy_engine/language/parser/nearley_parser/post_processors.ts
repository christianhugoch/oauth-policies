import { flattenDepth } from 'lodash';


export function andNodeProcessor(leftNode: any, rightNode: any): any {
    return chainNodeProcessor('AND', leftNode, rightNode);
}


export function orNodeProcessor(leftNode: any, rightNode: any): any {
    return chainNodeProcessor('OR', leftNode, rightNode);
}


function chainNodeProcessor(chainType: string, leftNode: any, rightNode: any): any {
    const expressions = leftNode.type === chainType ?
        [...leftNode.expressions, rightNode] : [leftNode, rightNode];
    return { type: chainType, expressions: expressions };
}


export function ruleProcessor(data: any): any {
    return {
        type: 'RULE',
        name: data[0],
        effect: data[4],
        scope: data[6]
    };
}


export function booleanRuleProcessor(data: any): any {
    return {
        type: 'BOOLEAN_RULE',
        name: data[0],
        effect: 'boolean',
        scope: data[2]
    };
}


export function fileRuleProcessor(data: any): any {
    return {
        type: 'FILE_RULE',
        name: data[0],
        effect: 'file',
        scope: data[6]
    };
}


export function roleRuleProcessor(data: any): any {
    return {
        type: 'ROLE_RULE',
        name: data[0],
        effect: 'role',
        scope: data[6]
    };
}


export function stringListProcessor(data: any): any {
    data = flattenDepth(data, Infinity);
    return data;
}