import 'reflect-metadata';

import { parseConfiguration } from "../../policy_engine/common/cfg/cfg_util";
import { ScopeValidities } from "../../policy_engine/db/util/granted_scopes_db_util";
import {
    completeAppCfg,
    onlyIdPsCfg,
    onlyValiditiesCfg
} from "../rest/test_util/test_constants/cfg_constants";

import { equal, ok, throws } from "should";
import moment from "moment";
import { isEqual } from "lodash";


describe("YAML configuration tests", () => {
    function checkExpectedIdPs(cfgs: any) {
        let expectedIdPs = [
            {
                name: 'local',
                discovery_url: 'http://localhost:3333',
                grant_type: 'authorization_code',
                client_id: 'foo'
            },
            {
                name: 'second',
                discovery_url: 'http://localhost:3333',
                grant_type: 'implicit',
                client_id: 'foo'
            },
            {
                name: 'third',
                discovery_url: 'http://localhost:3333',
                client_id: 'foo'
            }
        ];
        equal(JSON.stringify(cfgs.identityProviders), JSON.stringify(expectedIdPs));
    }


    it("only with identity providers", () => {
        let cfgs = parseConfiguration(onlyIdPsCfg);
        checkExpectedIdPs(cfgs);
        let defaultValidities = new ScopeValidities(new Date(0), new Map<string, Date>());
        ok(isEqual(cfgs.scopeValidities, defaultValidities));
    });

    it("only with scope validities (throws)", () => {
        throws(() => { parseConfiguration(onlyValiditiesCfg) })
    });

    it("cfg with idPs and scope validities", () => {
        let cfgs = parseConfiguration(completeAppCfg);
        checkExpectedIdPs(cfgs);
        ok(cfgs.scopeValidities instanceof ScopeValidities);
        let expectedScopeBorder = moment().subtract(1, 'days').valueOf();
        for (let suffix of ["A", "B", "C"]) {
            let scopeBorder = cfgs.scopeValidities.scopeBorders.get(`scope${suffix}`).getTime();
            (scopeBorder - expectedScopeBorder).should.be.below(100);
        }
    });

    it("missing identity provider fields (throws)", () => {
        let withoutName = `
identity_providers:
    - discovery_url: http://localhost:3333
      grant_type: authorization_code
      client_id: foo`;
        throws(() => { parseConfiguration(withoutName); });

        let withoutDiscoveryUrl = `
identity_providers:
    - name: local
      grant_type: authorization_code
      client_id: foo`;
        throws(() => { parseConfiguration(withoutDiscoveryUrl); });

        let withoutClientId = `
identity_providers:
    - name: local
      discovery_url: http://localhost:3333
      grant_type: authorization_code`;
        throws(() => { parseConfiguration(withoutClientId); });
    });
});