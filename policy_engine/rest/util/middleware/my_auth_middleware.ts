import { MissingParameter } from '../../../common/exceptions/missing_parameter';
import { InvalidIssuerName } from '../../../common/exceptions/invalid_issuer_name';
import { getOidcCfg } from '../../auth/auth_config';
import { downloadUser } from '../../../db/util/user_db_util';

import jwt, { VerifyErrors } from 'jsonwebtoken';
import { NextFunction } from 'express';


function myMiddlewarePreCheck(req: any) {
    if (!req.headers.authorization || req.headers.authorization.length === 0) {
        throw new MissingParameter("A 'authorization' header is mandatory.");
    }
    if (!req.headers.oidc_issuer || req.headers.oidc_issuer.length === 0) {
        throw new MissingParameter("A 'oidc_issuer' header is mandatory.");
    }
}


const tokenPattern = /(\S+)\s+(\S+)/;
function parseAuthHeader(headerValue: string) {
    const matches = headerValue.match(tokenPattern);
    return matches && { scheme: matches[1], value: matches[2] };
}


export async function myMiddleware(req: any, res: any, next: NextFunction): Promise<void> {
    try {
        myMiddlewarePreCheck(req);
        const authHeader = req.headers.authorization;
        const parsed = parseAuthHeader(authHeader);
        const issuerName = req.headers.oidc_issuer;
        const requestedIssuer = getOidcCfg(issuerName);
        if (!requestedIssuer) {
            throw new InvalidIssuerName(`THe issuer ${issuerName} does not exist.`)
        }
        jwt.verify(parsed.value, requestedIssuer.publicKey, async (err: VerifyErrors, decoded: any) => {
            if (err) {
                next(err);
            }
            const oldUser = await downloadUser(decoded.iss, decoded.sub);
            req.user = oldUser;
            req.token = decoded;
            return next();
        })
    }
    catch (error) {
        return next(error);
    }
}