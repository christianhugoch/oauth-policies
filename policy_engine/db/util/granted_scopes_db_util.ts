import { GrantedScope } from "../model/granted_scopes";

import moment from "moment";
import { Types } from "mongoose";


export class ScopeValidities {
    defaultBoder: Date;
    scopeBorders: Map<string, Date> = new Map<string, Date>();
    constructor(defaultBorder: Date, scopeBorders: Map<string, Date>) {
        this.defaultBoder = defaultBorder;
        this.scopeBorders = scopeBorders;
    }
}


export function getDummyValidities(): ScopeValidities {
    const defaultBoder = moment().subtract(2, 'days').toDate();
    const scopeBorder: Date = moment().subtract(2, 'days').toDate();
    const scopeBorders = new Map<string, Date>();
    for (const scope of ['scopeA', 'scopeB', 'scopeC']) {
        scopeBorders.set(scope, scopeBorder);
    }
    return new ScopeValidities(defaultBoder, scopeBorders);
}


function buildDefaultBorderChecks(defaultBorder: Date, explicitFiltered: Array<string>): any {
    return {
        $and: [
            {
                scope: { $nin: explicitFiltered },
                date: { $gt: defaultBorder }
            }]
    };
}


function buildExplicitFilterChecks(
    scopeBorders: Map<string, Date>, explicitFilteredScopes: Array<string>): any {
    const checksArray = Array<any>();
    for (const [scope, border] of scopeBorders) {
        checksArray.push({
            $and: [
                { scope: scope }, { date: { $gt: border } }
            ]
        });
    }
    return {
        $and: [
            { scope: { $in: explicitFilteredScopes } },
            { $or: checksArray }
        ]
    };
}


export async function downloadGrantedScopes(clientId: string, userId: Types.ObjectId,
    scopeValidities: ScopeValidities): Promise<string[]> {
    const explicitFilteredScopes = [...scopeValidities.scopeBorders.keys()];
    const condition = {
        userId: userId, clientId: clientId, $or: [
            buildDefaultBorderChecks(scopeValidities.defaultBoder, explicitFilteredScopes),
            buildExplicitFilterChecks(scopeValidities.scopeBorders, explicitFilteredScopes)
        ]
    };
    const projection = { _id: false, scope: true };
    const grantedScopes = await GrantedScope.find(condition, projection);
    return grantedScopes.map((element: any) => element.scope);
}


export async function insertGrantedScopes(clientId: string, userId: Types.ObjectId, scopes: Array<string>): Promise<void> {
    const now = Date.now();
    const grantedScopes = new Array<any>();
    for (const scope of scopes) {
        grantedScopes.push(new GrantedScope({ scope: scope, date: now, userId: userId, clientId: clientId }));
    }
    await GrantedScope.insertMany(grantedScopes);
}