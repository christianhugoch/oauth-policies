import { Policy } from '../../language/model/policy/policy';
import { MongoosePolicy, MongoosePolicyDoc } from '../model/policy_schema';

import { Types } from "mongoose";


export async function createPolicy(
    policy: Policy, orginalCode: string, userId: Types.ObjectId
): Promise<MongoosePolicyDoc> {
    const policyDoc = new MongoosePolicy({
        resourceOwnerId: userId,
        name: policy.name, policyObject: policy,
        code: orginalCode
    });
    return await MongoosePolicy.create(policyDoc);
}


export async function updatePolicy(
    policyId: Types.ObjectId, policy: Policy, orginalCode: string,
    userId: Types.ObjectId
): Promise<MongoosePolicyDoc> {
    const updateQuery = {
        resourceOwnerId: userId,
        name: policy.name, policyObject: policy,
        code: orginalCode
    };
    return await MongoosePolicy.findByIdAndUpdate(
        policyId, updateQuery, { new: true });
}


export async function downloadPoliciesOfUser(
    userId: Types.ObjectId
): Promise<Array<MongoosePolicyDoc>> {
    const condition = { resourceOwnerId: userId };
    return await MongoosePolicy.find(condition);
}


export async function downloadPolicy(policyId: Types.ObjectId
): Promise<MongoosePolicyDoc> {
    const policy = await MongoosePolicy.findOne({ _id: policyId });
    return policy;
}


export async function deletePolicy(policyId: Types.ObjectId
): Promise<boolean> {
    const deleteResult = await MongoosePolicy.deleteOne({ _id: policyId });
    return deleteResult.deletedCount === 1;
}