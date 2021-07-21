import 'reflect-metadata';

import { testHelper } from "../../parser_test_util";
import {
    oneScope,
    multipleScopes,
    oneClient,
    multipleClients,
    multipleScopesAndOneClient,
    multipleScopesAndClients,
} from "../../../test_data/scope_client_test_data";


describe('scope and client parser test:', () => {
    it("one scope", () => {
        testHelper(oneScope.code, oneScope.expectedTree);
    });

    it("multiple scopes", () => {
        testHelper(multipleScopes.code, multipleScopes.expectedTree);
    });

    it('client filter with value client', () => {
        testHelper(oneClient.code, oneClient.expectedTree);
    });

    it('client filter with value: client and a scope filter', () => {
        testHelper(multipleClients.code, multipleClients.expectedTree);
    });

    it('client filter with value: client and a scope filter', () => {
        testHelper(multipleScopesAndOneClient.code, multipleScopesAndOneClient.expectedTree);
    });
    
    it('client filter with value: client and a scope filter', () => {
        testHelper(multipleScopesAndClients.code, multipleScopesAndClients.expectedTree);
    });
});
