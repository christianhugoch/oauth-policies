import { ScopeValidities } from '../../db/util/granted_scopes_db_util';
import { getLogger } from '../logger/logger_util'

import moment from "moment";
import { readFileSync } from 'fs';
import YAML from 'yaml'


const logger = getLogger();


function validateIdPCfg(idPs: any[]): void {
    if (!idPs) {
        throw new Error(`The 'identity_providers' list may not be empty.`);
    }
    for (const idP of idPs) {
        if (!idP.name) {
            throw new Error("Every identity provider configuration needs a 'name'.");
        }
        if (!idP.discovery_url) {
            throw new Error("Every identity provider configuration needs a 'discovery_url'.");
        }
        if (!idP.client_id) {
            throw new Error("Every identity provider configuration needs a 'client_id'.");
        }
        if (!idP.grant_type) {
            logger.info(`The identity provider '${idP.name}' is missing a 'grant_type', the defualt (authorization_code) will be used.`);
        }
    }
}


function buildBorder(validity: any): Date {
    return moment()
        .subtract(validity.seconds, 'seconds')
        .subtract(validity.minutes, 'minutes')
        .subtract(validity.hours, 'hours')
        .subtract(validity.days, 'days')
        .subtract(validity.months, 'months')
        .subtract(validity.years, 'years')
        .toDate();
}


function buildScopeValiditiesCfg(validitiesAsYaml: any): ScopeValidities {
    if(!validitiesAsYaml) {
        return new ScopeValidities(new Date(0), new Map<string, Date>());
    }
    const defaultValidity = validitiesAsYaml.default;
    const explicitValidities = validitiesAsYaml.explicit;
    const timeBorders = new Map<string, Date>();
    for (const explicitScopeValidity of explicitValidities) {
        timeBorders.set(explicitScopeValidity.scope, buildBorder(explicitScopeValidity));
    }
    return new ScopeValidities(buildBorder(defaultValidity), timeBorders);
}


export function readConfiguration(filePath: string): any {
    return parseConfiguration(
        readFileSync(filePath, 'utf8')
    );
}


export function parseConfiguration(cfgStr: string): any {
    const yaml = YAML.parse(cfgStr);
    validateIdPCfg(yaml.identity_providers);
    return {
        scopeValidities: buildScopeValiditiesCfg(yaml.scope_validities),
        identityProviders: yaml.identity_providers,
    };
}