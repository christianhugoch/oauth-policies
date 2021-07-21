import { parse } from '../../../language/parser/parser';
import { ParsedPolicy } from '../../../language/parser/parsed_policy';
import { Policy } from '../../../language/model/policy/policy';
import { buildPolicy } from '../../../language/builder/builder_util'
import { MissingParameter } from '../../../common/exceptions/missing_parameter';
import {
    downloadPoliciesOfUser,
    downloadPolicy,
    deletePolicy,
    updatePolicy,
    createPolicy
} from '../../../db/util/policy_db_util';

import { Types } from 'mongoose';
import express, { Router, NextFunction } from 'express';


const policyRouter: Router = express.Router();


function postPolicyPreCheck(req: any, res: any, next: NextFunction) {
    if (!req.body.policy || req.body.policy.length === 0) {
        throw new MissingParameter("A 'policy' parameter is mandatory.");
    }
    if (!req.body.name || req.body.name.length === 0) {
        throw new MissingParameter("A 'name' parameter is mandatory.");
    }
    next();
}

/*
    POST create a new policy
 */
policyRouter.post('/', postPolicyPreCheck,
    async (req: any, res: any, next: NextFunction) => {
        const userId = req.user._id;
        const code = unescape(req.body.policy);
        try {
            const parsedPolicy: ParsedPolicy = parse(code, req.body.name);
            const policy: Policy = buildPolicy(parsedPolicy);
            const newPolicy = await createPolicy(policy, code, userId);
            res.json({ policy: newPolicy });
        }
        catch (error) {
            return next(error);
        }
    });


function putPolicyPreCheck(req: any, res: any, next: NextFunction) {
    if (!req.body.policy || req.body.policy.length === 0) {
        throw new MissingParameter("A 'policy' parameter is mandatory.");
    }
    if (!req.body.name || req.body.name.length === 0) {
        throw new MissingParameter("A 'name' parameter is mandatory.");
    }
    if (!req.body.policyId || req.body.policyId.length !== 24) {
        throw new MissingParameter("A 'policyId' parameter of 24 hex chars is mandatory.");
    }
    next();
}

/*
    PUT update an existing policy
 */
policyRouter.put('/', putPolicyPreCheck,
    async (req: any, res: any, next: NextFunction) => {
        const userId = req.user._id;
        const code = unescape(req.body.policy);
        const policyId = Types.ObjectId(req.body.policyId);
        try {
            const parsedPolicy: ParsedPolicy = parse(code, req.body.name);
            const policy: Policy = buildPolicy(parsedPolicy);
            const updatedPolicy = await updatePolicy(policyId, policy, code, userId);
            res.json({ policy: updatedPolicy });
        }
        catch (error) {
            return next(error);
        }
    });




function deletePolicyPreCheck(req: any, res: any, next: NextFunction) {
    if (!req.query.id || req.query.id.length !== 24) {
        throw new MissingParameter("A 'id' parameter of 24 hex chars is mandatory.");
    }
    next();
}

/*
    DELETE a policy
 */
policyRouter.delete('/', deletePolicyPreCheck,
    async (req: any, res: any, next: NextFunction) => {
        const policyId = Types.ObjectId(req.query.id);
        try {
            const success = await deletePolicy(policyId);
            res.json({ okay: success });
        }
        catch (error) {
            return next(error);
        }
    });


/*
    GET all policies of the authenticated user
 */
policyRouter.get('/', async (req: any, res: any, next: NextFunction) => {
    const userId = req.user._id;
    try {
        const policies = await downloadPoliciesOfUser(userId);
        res.json({ policies: policies });
    }
    catch (error) {
        return next(error);
    }
});


function getPolicyPreCheck(req: any, res: any, next: NextFunction) {
    if (req.params.policyId.length !== 24) {
        throw new MissingParameter("A 'policyId' parameter of 24 hex chars is mandatory.");
    }
    next();
}

/*
    GET one policy of the authenticated user by Id
 */
policyRouter.get('/:policyId', getPolicyPreCheck,
    async (req: any, res: any, next: NextFunction) => {
        try {
            const policyId = Types.ObjectId(req.params.policyId);
            const policy = await downloadPolicy(policyId);
            res.json({ policy: policy });
        }
        catch (error) {
            return next(error);
        }
    });

export { policyRouter };
