import 'reflect-metadata';

import { builderTestHelper } from "../../builder_test_util";
import {
    oneScope,
    multipleScopes,
    oneClient,
    multipleClients,
    multipleScopesAndOneClient,
    multipleScopesAndClients,
} from "../../../test_data/scope_client_test_data";


describe("scope and client filter tests", () => {
    it("one scope", () => {
        builderTestHelper(oneScope.code, oneScope.expectedObject);
    });

    it("multiple scopes", () => {
        builderTestHelper(multipleScopes.code, multipleScopes.expectedObject);
    });

    it("one client", () => {
        builderTestHelper(oneClient.code, oneClient.expectedObject);
    });

    it("multiple clients", () => {
        builderTestHelper(multipleClients.code, multipleClients.expectedObject);
    });

    it("multiple scopes and one client", () => {
        builderTestHelper(multipleScopesAndOneClient.code,
            multipleScopesAndOneClient.expectedObject);
    });

    it("multiple scopes and clients", () => {
        builderTestHelper(multipleScopesAndClients.code,
            multipleScopesAndClients.expectedObject);
    });
});