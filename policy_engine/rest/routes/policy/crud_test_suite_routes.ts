import { PolicyTestSuiteDoc } from '../../../db/model/policy_test_schema';
import { MissingParameter } from '../../../common/exceptions/missing_parameter';
import { UserDoc } from '../../../db/model/user_schema';
import {
    downloadTestSuite,
    downloadTestSuites,
    createTestSuite,
    updateSuite,
    deleteSuite
} from '../../../db/util/test_suite_db_util';

import express, { Router, NextFunction } from 'express';
import { Types } from 'mongoose';


export const crudTestSuiteRouter: Router = express.Router();


/*
 *  GET all test suites of the authenticated user
 */
crudTestSuiteRouter.get('/', async (req: any, res: any, next: NextFunction) => {
    const authenticatedUser: UserDoc = req.user;
    try {
        const suites: Array<PolicyTestSuiteDoc> = await downloadTestSuites(
            authenticatedUser._id
        );
        res.json({ suites: suites });
    }
    catch (error) {
        next(error);
    }
});


function getSuitePreCheck(req: any, res: any, next: NextFunction) {
    if (!req.params.testSuiteId || req.params.testSuiteId.length !== 24) {
        throw new MissingParameter("A 'testSuiteId' parameter of 24 hex chars is mandatory.");
    }
    next();
}

/*
    GET one suite of the authenticated user by Id
 */
crudTestSuiteRouter.get('/:testSuiteId', getSuitePreCheck,
    async (req: any, res: any, next: NextFunction) => {
        const authenticatedUser: UserDoc = req.user;
        const suiteId = Types.ObjectId(req.params.testSuiteId);
        try {
            const suite: PolicyTestSuiteDoc = await downloadTestSuite(
                suiteId, authenticatedUser._id
            );
            res.json({ suite: suite });
        }
        catch (error) {
            next(error);
        }
    });


function postSuitePreCheck(req: any, res: any, next: NextFunction) {
    if (!req.body.suite || req.body.suite.length === 0) {
        throw new MissingParameter("A 'suite' parameter is mandatory.");
    }
    next();
}

/*
    POST create a new test suite
 */
crudTestSuiteRouter.post('/', postSuitePreCheck,
    async (req: any, res: any, next: NextFunction) => {
        const suiteCode = unescape(req.body.suite);
        const userId = req.user._id;
        try {
            const newSuite = await createTestSuite(suiteCode, userId);
            return res.json({ suite: newSuite });
        }
        catch (error) {
            next(error);
        }
    });


function putSuitePreCheck(req: any, res: any, next: NextFunction) {
    if (!req.body.suite || req.body.suite.length === 0) {
        throw new MissingParameter("A 'suite' parameter is mandatory.");
    }
    next();
}

/*
    PUT update an existing test suite 
 */
crudTestSuiteRouter.put('/', putSuitePreCheck,
    async (req: any, res: any, next: NextFunction) => {
        try {
            const suiteId = Types.ObjectId(req.body.id);
            const suiteCode = unescape(req.body.suite);
            const updatedSuite = await updateSuite(suiteId, req.user._id, suiteCode);
            return res.json({ suite: updatedSuite });
        }
        catch (error) {
            next(error);
        }
    });


function deleteSuitePreCheck(req: any, res: any, next: NextFunction) {
    if (!req.query.id || req.query.id.length !== 24) {
        throw new MissingParameter("A 'id' parameter of 24  hex chars " +
            "is mandatory.");
    }
    next();
}

/*
    DELETE one test suite
 */
crudTestSuiteRouter.delete('/', deleteSuitePreCheck,
    async (req: any, res: any, next: NextFunction) => {
        const suiteId = Types.ObjectId(req.query.id);
        const userId = req.user._id;
        try {
            const success = await deleteSuite(suiteId, userId);
            return res.json({ okay: success });
        }
        catch (error) {
            next(error);
        }
    });
