import { User } from '../../db/model/user_schema';
import { OidcCfg } from '../util/oidc/identity_provider_settings';
import { getLogger } from '../../common/logger/logger_util'

import passport from 'passport';
import { Strategy as JWTstrategy, ExtractJwt } from 'passport-jwt'


let _issuers: Map<string, OidcCfg> = null;
const logger = getLogger();


const passportCb = async (token: any, next: any) => {
    try {
        const user = await User.findOne(
            { iss: token.iss, sub: token.sub },
        );
        if (!user || !user.currentLogin) {
            return next(null, null, 403);
        }
        return next(null, user);
    } catch (error) {
        return next(error);
    }
}


export function initPassport(issuers: Map<string, OidcCfg>): void {
    _issuers = issuers;
    for (const value of issuers.values()) {
        passport.use(value.name,
            new JWTstrategy({
                secretOrKey: value.publicKey,
                jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('id_token')
            }, passportCb)
        );
    }
}


export function getStrategyNames(): Array<string> {
    if (!_issuers) {
        logger.warn('passport is not initalized');
        return [];
    }
    return Array.from(_issuers.keys());
}


export function getOidcCfg(issuer: string): OidcCfg {
    return _issuers.get(issuer);
}
