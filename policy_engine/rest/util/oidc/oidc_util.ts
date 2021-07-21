import { getLogger } from "../../../common/logger/logger_util";
import { OidcCfg } from "./identity_provider_settings";

import { Issuer } from "openid-client";
import { isEmpty } from "lodash";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwkToPem = require('jwk-to-pem');


const logger = getLogger();


export async function discoverIssuers(issuers: any): Promise<Map<string, OidcCfg>> {
    const result = new Map<string, OidcCfg>();
    for (const issuer of issuers) {
        const oidcCfg = await discoverIssuer(issuer);
        result.set(oidcCfg.name, oidcCfg);
    }
    return result;
}


async function discoverIssuer(cfg: any): Promise<OidcCfg> {
    logger.info(`Disvovering the idP: '${cfg.name}' at: '${cfg.discovery_url}'`)
    const issuer = await Issuer.discover(cfg.discovery_url);
    const keystore = await issuer.keystore();
    const jwkKeys = keystore.all();
    if (isEmpty(jwkKeys)) {
        throw new Error("The jwks_uri keys list is empty");
    }
    // take the first tkey, works with the local 'oidc-provider'
    const rsaKey = keystore.all()[0];
    const pem = jwkToPem(rsaKey);
    return new OidcCfg(
        cfg.discovery_url, cfg.name, pem, cfg.grant_type, cfg.client_id);
}