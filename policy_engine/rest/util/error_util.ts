import { BuilderException } from "../../common/exceptions/builder_exception";
import { ExecutionException } from "../../common/exceptions/execution_exception";
import { InvalidIssuerName } from "../../common/exceptions/invalid_issuer_name";
import { InvalidTestSuiteCode } from "../../common/exceptions/invalid_test_suite_code";
import { MissingParameter } from "../../common/exceptions/missing_parameter";
import { ParsingException } from "../../common/exceptions/parsing_exception";
import { getLogger } from '../../common/logger/logger_util'

import { ErrorRequestHandler, NextFunction } from 'express';


function isClientError(error: any) {
    return error instanceof ParsingException ||
        error instanceof MissingParameter ||
        error instanceof SyntaxError ||
        error instanceof InvalidTestSuiteCode ||
        error instanceof InvalidIssuerName ||
        error instanceof BuilderException;
}


function isServerError(error: any) {
    return error instanceof ExecutionException;
}


export const errorMiddleware: ErrorRequestHandler =
    (err: any, req: any, res: any, next: NextFunction): any => {
        if (!err) {
            return next()
        }
        getLogger().error(err);
        if (isClientError(err)) {
            return res.status(400).send({
                message: err.message,
            });
        }
        else {
            return res.status(500).send({
                message: err.message,
            });
        }
    }
