import { InvalidTestSuiteCode } from "../../common/exceptions/invalid_test_suite_code";
import { PolicyTestSuite, PolicyTestSuiteDoc } from "../model/policy_test_schema";

import { Types } from "mongoose";


export async function createTestSuite(
    suiteCode: string, userId: Types.ObjectId
): Promise<PolicyTestSuiteDoc> {
    const suiteDoc = new PolicyTestSuite(JSON.parse(suiteCode));
    suiteDoc.orginalCode = suiteCode;
    suiteDoc.resourceOwnerId = userId;
    try {
        await suiteDoc.validate();
    }
    catch (error) {
        throw new InvalidTestSuiteCode(error.message);
    }
    return await PolicyTestSuite.create(suiteDoc);
}


export async function updateSuite(
    suiteId: Types.ObjectId, userId: Types.ObjectId,
    suiteCode: string,
): Promise<PolicyTestSuiteDoc> {
    const updateQuery = JSON.parse(suiteCode);
    updateQuery.orginalCode = suiteCode;
    updateQuery.resourceOwnerId = userId;
    updateQuery.lastModified = Date.now();
    try {
        await new PolicyTestSuite(updateQuery).validate();
    }
    catch (error) {
        throw new InvalidTestSuiteCode(error.message);
    }
    return await PolicyTestSuite.findByIdAndUpdate(
        suiteId, updateQuery, { new: true });
}


export async function deleteSuite(
    suiteId: Types.ObjectId, userId: Types.ObjectId
): Promise<boolean> {
    const deleteResult = await PolicyTestSuite.deleteOne({
        _id: suiteId, resourceOwnerId: userId
    });
    return deleteResult.deletedCount === 1;
}


export async function downloadTestSuites(
    resourceOwnerId: Types.ObjectId, suiteNames?: Array<string>
): Promise<Array<PolicyTestSuiteDoc>> {
    const filter: any = { resourceOwnerId: resourceOwnerId };
    if (suiteNames !== undefined) {
        filter.name = { $in: suiteNames }
    }
    const result: Array<PolicyTestSuiteDoc> =
        await PolicyTestSuite.find(filter);
    return result;
}


export async function downloadTestSuite(
    suiteId: Types.ObjectId, resourceOwnerId: Types.ObjectId
): Promise<PolicyTestSuiteDoc> {
    const conditions: any = { _id: suiteId, resourceOwnerId: resourceOwnerId };
    const result: PolicyTestSuiteDoc = await PolicyTestSuite.findOne(conditions);
    return result;
}