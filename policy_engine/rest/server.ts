import { decisionRouter } from './routes/decision/scope_decision_routes';
import { policyRouter } from './routes/policy/crud_policy_routes';
import { validationRoutes } from './routes/decision/file_access_routes';
import { execTestSuiteRouter } from './routes/policy/exec_test_suite_routes';
import { crudTestSuiteRouter } from './routes/policy/crud_test_suite_routes';
import { oidcRouter } from './routes/oidc_routes';
import { userRouterWithPassport } from './routes/user/user_routes_with_passport';
import { userRouterWithoutPassport } from './routes/user/user_routes_without_passport';
import { getStrategyNames, initPassport } from './auth/auth_config';
import { getLogger } from "../common/logger/logger_util";
import { discoverIssuers } from "./util/oidc/oidc_util";
import { errorMiddleware } from "./util/error_util";
import { readConfiguration } from "../common/cfg/cfg_util";
import { OidcCfg } from "./util/oidc/identity_provider_settings";

import { createServer } from 'https';
import express, { Application } from "express";
import expressPino from 'express-pino-logger';
import passport from "passport";
import { connect, ConnectOptions } from 'mongoose';
import cors from 'cors';
import { readFileSync } from 'fs';
import helmet from "helmet";
import mongoSanitize from 'express-mongo-sanitize';


export let policyApp: Application = null;
export let decisionApp: Application = null;

const logger = getLogger();
const expressLogger = expressPino({ logger });


export async function initServer(): Promise<void> {
    await initDbConnection({
        dbHost: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER, password: process.env.DB_USER_PASSWORD,
        ssl: process.env.DB_SSL === "true",
        sslValidate: process.env.DB_SSL_VALIDATE === "true",
    });
    const cfgs = readConfiguration(process.env.CONFIGURATION_FILE);
    const issuers: Map<string, OidcCfg> = await discoverIssuers(cfgs.identityProviders);
    initPolicyServer({
        domainName: process.env.DOMAIN_NAME, port: process.env.POLICY_SERVER_PORT,
        tlsCert: process.env.CERT_FILE,
        tlsKey: process.env.KEY_FILE,
        issuers: issuers,
        nodeEnv: process.env.NODE_ENV,
    });
    initDecisionServer({
        domainName: process.env.DOMAIN_NAME, port: process.env.DECISION_SERVER_PORT,
        tlsCert: process.env.CERT_FILE,
        tlsKey: process.env.KEY_FILE,
        certAuth: process.env.CA_CERT_FILE,
        scopeValidities: cfgs.scopeValidities,
        nodeEnv: process.env.NODE_ENV,
    });
}


export function initDecisionServer(args: any): void {
    decisionApp = express();
    decisionApp.use(cors());
    decisionApp.use(express.json());
    decisionApp.use(express.urlencoded({ extended: true }));
    decisionApp.use(mongoSanitize());
    decisionApp.set('scopeValidities', args.scopeValidities);
    decisionApp.use('/decision', decisionRouter);
    decisionApp.use('/validation', validationRoutes);
    decisionApp.use(expressLogger);
    decisionApp.use(errorMiddleware);
    if (args.nodeEnv === "prod") {
        console.log("prod");

        decisionApp.use(helmet());
        logger.info(`launching decision server with mTLS cert: ${args.tlsCert}, privateKey: ${args.tlsKey} and ca: ${args.certAuth}`);
        createServer({
            key: readFileSync(args.tlsKey),
            cert: readFileSync(args.tlsCert),
            ca: readFileSync(args.certAuth),
        }, decisionApp).listen(args.port, () => {
            logger.info(`Decision Server is reachable at: https://${args.domainNam}:${args.port}`);
        });
    }
    else if (args.nodeEnv === "dev") {
        console.log("dev");

        decisionApp.listen(args.port, () => {
            logger.info(`Decision Server is reachable at: http://${args.domainNam}:${args.port}`);
        });
    }
    else if (args.nodeEnv === "test") {
        console.log("test");

        logger.info("launched the Express decision app for testing purpose")
    }
}


export async function initPolicyServer(args: any): Promise<void> {
    initPassport(args.issuers);
    policyApp = express();
    policyApp.use(cors());
    policyApp.use(express.json());
    policyApp.use(express.urlencoded({ extended: true }));
    policyApp.use(mongoSanitize());
    policyApp.set('issuerCfgs', args.issuers);
    policyApp.use('/policy', passport.authenticate(getStrategyNames(), { session: false }),
        policyRouter);
    policyApp.use('/policy_test_suite', passport.authenticate(getStrategyNames(), { session: false }),
        crudTestSuiteRouter);
    policyApp.use('/policy_test_suite', passport.authenticate(getStrategyNames(), { session: false }),
        execTestSuiteRouter);
    policyApp.use('/user', userRouterWithoutPassport);
    policyApp.use('/user', passport.authenticate(getStrategyNames(), { session: false }),
        userRouterWithPassport);
    policyApp.use("/oidc", oidcRouter);
    policyApp.use(expressLogger);
    policyApp.use(errorMiddleware);
    if (args.nodeEnv === 'prod') {
        console.log("prod");
        policyApp.use(helmet());
        logger.info(`launching policy server with TLS cert: ${args.tlsCert} and privateKey: ${args.tlsCert}`)
        createServer({
            key: readFileSync(args.tlsKey),
            cert: readFileSync(args.tlsCert),
        }, policyApp).listen(args.port, () => {
            logger.info(`policy server is reachable at: https://${args.domainName}:${args.port}`);
        });
    }
    else if (args.nodeEnv === "dev") {
        console.log("dev");

        logger.info("launching policy server without TLS.");
        policyApp.listen(args.port, () => {
            logger.info(`Policy Server is reachable at: http://${args.domainName}:${args.port}`);
        });
    }
    else if (args.nodeEnv === "test") {
        console.log("test");

        logger.info("launched the Express policy app for testing purpose")
    }
}


export async function initDbConnection(args: any): Promise<void> {
    const options: ConnectOptions = {
        useNewUrlParser: true, useUnifiedTopology: true,
        user: args.user, pass: args.password,
        ssl: args.ssl,
        sslValidate: args.sslValidate,
    };
    if (args.dbCA) {
        options.sslCA = args.dbCA;
    }
    try {
        logger.info(`Connecting to mongoDb at ${args.dbHost}/${args.database}`);
        await connect(`${args.dbHost}/${encodeURI(args.database)}?retryWrites=true&w=majority`, options)
        logger.info("Sucessfully connected to Db")
    }
    catch (error) {
        logger.error("Unable to connect to database.");
        throw error;
    }
}
