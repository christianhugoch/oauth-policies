import { createUser, updateUser } from '../../../db/util/user_db_util';
import { myMiddleware } from '../../util/middleware/my_auth_middleware';

import express, { Router, NextFunction } from 'express';


export const userRouterWithoutPassport: Router = express.Router();


/*
    PUT do a login and update the login/logout times
 */
userRouterWithoutPassport.put('/loginStats', myMiddleware,
    async (req: any, res: any, next: NextFunction) => {
        const oldUser = req.user;
        if (!oldUser.currentLogin) {
            const now = new Date(Date.now());
            oldUser.currentLogin = now;
            if (!oldUser.lastLogin) {
                oldUser.lastLogin = now;
            }
            try {
                const newUser = await updateUser(oldUser);
                return res.json({ user: newUser });
            }
            catch (error) {
                return next(error);
            }
        }
        return res.json({ user: oldUser });
    });


/*
    POST a new local user user, linked to the identity provider of the id_token
 */
userRouterWithoutPassport.post('/linkedUser', myMiddleware,
    async (req: any, res: any, next: NextFunction) => {
        const userFromDb = req.user;
        const decodedToken = req.token;
        if (userFromDb) {
            return res.json({ user: userFromDb });
        }
        try {
            const newUser = await createUser(decodedToken.iss, decodedToken.sub);
            return res.json({ user: newUser });
        }
        catch(error) {
            return next(error);
        }
    });