import { Policy } from '../model/policy/policy';
import { difference, union } from 'lodash';
import { getLogger } from '../../common/logger/logger_util';


const logger = getLogger();

export function validateFileAccess(
    requested: Array<string>,
    oauthScopes: Array<string>,
    policies: Array<Policy>,
): boolean {
    const permitted = permittedFilesOfPolicies(policies, oauthScopes);
    const denied = difference(requested, permitted);
    if (denied.length === 0) {
        logger.info('all files are permitted');
        return true;
    }
    logger.info(`some files are not permitted: '${denied}'`);
    return false;
}


export function permittedFilesOfPolicies(
    policies: Array<Policy>, oauthScopes: Array<string>
): Array<string> {
    const result = Array<string>();
    for (const policy of policies) {
        result.push(...permittedFilesOfPolicy(policy, oauthScopes));
    }
    return result;
}


function permittedFilesOfPolicy(
    policy: Policy, oauthScopes: string[]
): Array<string> {
    logger.info(`retrieving permitted files for scopes: '${oauthScopes}' and policy: '${policy.name}'`);
    let allPermittedFiles = Array<string>();
    for (let i = 0; i < oauthScopes.length; i++) {
        const oauthScope = oauthScopes[i];
        const permittedFiles = permittedFilesForScope(policy, oauthScope);
        logger.info(`scope: '${oauthScope}' permits: '${permittedFiles}'`);
        allPermittedFiles = union(allPermittedFiles, permittedFiles);
    }
    logger.info(`the combined list from all scopes is: ${allPermittedFiles}`);
    return allPermittedFiles;

}


function permittedFilesForScope(
    policy: Policy, oauthScope: string
): Array<string> {
    let result = new Array<string>();
    const fileRulesWithScope = policy.getFileRulesWithScope(oauthScope);
    for (let i = 0; i < fileRulesWithScope.length; i++) {
        const fileRule = fileRulesWithScope[i];
        result = result.concat(fileRule.files);
    }
    return result;
}
