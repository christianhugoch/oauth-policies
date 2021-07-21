import { createSchema, ExtractDoc, ExtractProps, Type, typedModel } from 'ts-mongoose';


const UserSchema = createSchema({
    iss: Type.string({ required: true, minLength: 1, maxLength: 128, index: true }),
    sub: Type.string({ required: true, minLength: 1, maxLength: 128, index: true }),
    lastLogin: Type.date(),
    lastLogout: Type.date(),
    currentLogin: Type.date(),
});


const User = typedModel('User', UserSchema);
type UserProps = ExtractProps<typeof UserSchema>;
type UserDoc = ExtractDoc<typeof UserSchema>;
export { User, UserProps, UserDoc, UserSchema };