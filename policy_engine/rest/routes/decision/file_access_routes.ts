import { permittedFilesOfPolicies, validateFileAccess } from '../../../language/executor/file_access_util';
import { downloadUser } from '../../../db/util/user_db_util';
import { downloadPoliciesOfUser } from '../../../db/util/policy_db_util';
import { MongoosePolicyDoc, MongoosePolicy } from '../../../db/model/policy_schema';

import express, { Router, NextFunction } from 'express';
import { MissingParameter } from '../../../common/exceptions/missing_parameter';


const validationRoutes: Router = express.Router();


function checkFilesPreCheck(req: any, res: any, next: NextFunction) {
    if (!req.query.scopes || req.query.scopes.length === 0) {
        throw new MissingParameter("A 'scope' parameter is mandatory.");
    }
    if (!req.query.files || req.query.files.length === 0) {
        throw new MissingParameter("A 'files' parameter is mandatory.");
    }
    if (!req.query.iss || req.query.iss.length === 0 ||
        !req.query.sub || req.query.sub.length === 0) {
        throw new MissingParameter("An 'iss' (issuer) and a 'sub' (subject) Parameter are mandatory.");
    }
    next();
}

/*
    GET decide if 'scopes' permits the access of 'files'
 */
validationRoutes.get('/', checkFilesPreCheck,
    async (req: any, res: any, next: NextFunction) => {
        const scopes = req.query.scopes.split(' ');
        const files = req.query.files.split(' ');
        try {
            const user = await downloadUser(req.query.iss, req.query.sub);
            const policies = (await downloadPoliciesOfUser(user._id))
                .map((element: MongoosePolicyDoc) => {
                    return MongoosePolicy.resolvePolicyObject(element).policyObject;
                });
            const valid = validateFileAccess(files, scopes, policies);
            return res.json({ valid: valid });
        }
        catch (error) {
            return next(error);
        }
    });


function permittedFilesPreCheck(req: any, res: any, next: NextFunction) {
    if (!req.query.scopes || req.query.scopes.length === 0) {
        throw new MissingParameter('A scope parameter is mandatory');
    }
    if (!req.query.iss || req.query.iss.length === 0 ||
        !req.query.sub || req.query.sub.length === 0) {
        throw new MissingParameter("An 'iss' (issuer) and a 'sub' (subject) " +
            "Parameter are mandatory");
    }
    next();
}

/*
    GET list all files that are permitted by 'scopes'
 */
validationRoutes.get('/permittedFiles', permittedFilesPreCheck,
    async (req: any, res: any, next: NextFunction) => {
        const scopes = req.query.scopes.split(' ');
        try {
            const user = await downloadUser(req.query.iss, req.query.sub);
            const policies = (await downloadPoliciesOfUser(user._id))
                .map((element: MongoosePolicyDoc) => {
                    return MongoosePolicy.resolvePolicyObject(element).policyObject;
                });

            const permittedFiles = permittedFilesOfPolicies(policies, scopes);
            return res.json({ files: permittedFiles });
        }
        catch (error) {
            return next(error);
        }
    });

export { validationRoutes };
