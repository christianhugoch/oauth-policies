import { ExecutionController } from '../../../language/executor/decision_controller';
import { downloadPoliciesOfUser } from '../../../db/util/policy_db_util';
import { downloadGrantedScopes, insertGrantedScopes } from '../../../db/util/granted_scopes_db_util';
import { downloadUser } from '../../../db/util/user_db_util';
import { MongoosePolicyDoc, MongoosePolicy } from '../../../db/model/policy_schema';

import express, { Router, NextFunction } from 'express';
import { MissingParameter } from '../../../common/exceptions/missing_parameter';


const decisionRouter: Router = express.Router();


function decisionPreCheck(req: any, res: any, next: NextFunction) {
    if (!req.query.scopes || req.query.scopes.length === 0) {
        throw new MissingParameter('A scope parameter is mandatory.');
    }
    if (!req.query.clientId || req.query.clientId.length === 0) {
        throw new MissingParameter('A clientId parameter is mandatory.');
    }
    if (!req.query.iss || req.query.iss.length === 0 ||
        !req.query.sub || req.query.sub.length === 0) {
        throw new MissingParameter("An 'iss' (issuer) and a 'sub' (subject) Parameter are mandatory.");
    }
    next();
}


/*
    GET decide if a scope should be granted
 */
decisionRouter.get('/', decisionPreCheck,
    async (req: any, res: any, next: NextFunction) => {
        const scopes = req.query.scopes.split(' ');
        const clientId = req.query.clientId;
        try {
            const user = await downloadUser(req.query.iss, req.query.sub);
            const policies = (await downloadPoliciesOfUser(user._id)).
                map((policy: MongoosePolicyDoc) => {
                    return MongoosePolicy.resolvePolicyObject(policy).policyObject;
                });
            const previouslygranted = await downloadGrantedScopes(
                clientId, user._id, req.app.get('scopeValidities'));
            const executor = new ExecutionController(
                scopes, clientId, policies, previouslygranted);
            const decision = executor.decide();
            if (decision) {
                await insertGrantedScopes(clientId, user._id, scopes);
            }
            res.send({ decision: decision });
        }
        catch (error) {
            return next(error);
        }
    });

export { decisionRouter };