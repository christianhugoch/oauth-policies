import { OidcCfg } from '../util/oidc/identity_provider_settings';

import express, { Router } from 'express';


const oidcRouter: Router = express.Router();


/*
    GET all identity providers from the configuration file
 */
oidcRouter.get('/cfgs', async (req: any, res: any) => {
    const oidcCfgs: Map<string, OidcCfg> = req.app.get('issuerCfgs');
    const cfgsArray = Array.from(oidcCfgs.values());
    return res.json({ cfgs: cfgsArray });
});

export { oidcRouter };