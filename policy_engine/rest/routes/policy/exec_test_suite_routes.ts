import { downloadPoliciesOfUser } from '../../../db/util/policy_db_util';
import { PolicyTestSuiteDoc } from '../../../db/model/policy_test_schema';
import { Policy } from '../../../language/model/policy/policy';
import { testPolicies } from '../../util/test_suite_util';
import { MongoosePolicyDoc, MongoosePolicy } from '../../../db/model/policy_schema';
import { UserDoc } from '../../../db/model/user_schema';
import { downloadTestSuites } from '../../../db/util/test_suite_db_util';

import express, { Router, NextFunction } from 'express';


export const execTestSuiteRouter: Router = express.Router();


/*
    POST execute test suites of the authenticated user
 */
execTestSuiteRouter.post('/exec', async (req: any, res: any, next: NextFunction) => {
    const authenticatedUser: UserDoc = req.user;
    try {
        // load suites
        const suites: Array<PolicyTestSuiteDoc> = await downloadTestSuites(
            authenticatedUser._id,
            req.body.testSuites !== undefined ?
                unescape(<string>req.body.testSuites).split(' ') : undefined
        );
        // load policies
        const policies: Array<Policy> = (await downloadPoliciesOfUser(authenticatedUser._id))
            .map((element: MongoosePolicyDoc) => {
                return MongoosePolicy.resolvePolicyObject(element).policyObject;
            });
        // execute
        const execResult = testPolicies(suites, policies);
        return res.json({ statistics: execResult })
    }
    catch (error) {
        next(error);
    }
});