import { updateUser} from '../../../db/util/user_db_util';

import express, { Router, NextFunction} from 'express';


export const userRouterWithPassport: Router = express.Router();


/*
    GET the local user, linked to the identity provider of the id_token
 */
userRouterWithPassport.get('/linkedUser', async (req: any, res: any) => {
    return res.json({ user: req.user });
});


/*
    PUT do a logout and update the login/logout dates
 */
userRouterWithPassport.put('/logoutStats', async (req: any, res: any, next: NextFunction) => {
    const user = req.user;
    user.lastLogout = new Date(Date.now());
    user.lastLogin = user.currentLogin;
    user.currentLogin = null;
    try {
        const newUser = await updateUser(user);
        return res.json({ user: newUser });
    }
    catch (error) {
        return next(error);
    }
});