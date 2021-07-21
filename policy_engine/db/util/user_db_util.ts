import { User, UserDoc } from '../../db/model/user_schema';
import { LinkedUserDoesNotExist } from '../../common/exceptions/linked_user_does_not_exist';


export async function downloadUser(iss: string, sub: string): Promise<UserDoc> {
    const query = { iss: iss, sub: sub };
    try {
        return await User.findOne(query, { policies: false });
    }
    catch (error) {
        throw new LinkedUserDoesNotExist(
            `A linked user for the issuer '${iss}' with subject '${sub}' does not exist.`);
    }
}


export async function createUser(iss: string, sub: string): Promise<UserDoc> {
    return await User.create({
        iss: iss, sub: sub,
        lastLogin: null, lastLogout: null,
        currentLogin: null,
    });
}


export async function updateUser(user: any): Promise<UserDoc> {
    return await user.save();
}