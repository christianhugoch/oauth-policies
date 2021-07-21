import { createSchema, ExtractDoc, ExtractProps, Type, typedModel } from 'ts-mongoose';
import { UserSchema } from './user_schema';


const GrantedScopeSchema = createSchema({
    scope: Type.string({ required: true, minLength: 1, maxLength: 128 }),
    clientId: Type.string({ required: true, minLength: 1, maxLength: 128 }),
    date: Type.date({ required: true, index: true }),
    userId: Type.ref(Type.objectId({ required: true, index: true })).to('User', UserSchema)
});


const GrantedScope = typedModel('GrantedScope', GrantedScopeSchema);
type GrantedScopeProps = ExtractProps<typeof GrantedScopeSchema>;
type GrantedScopeDoc = ExtractDoc<typeof GrantedScopeSchema>;
export { GrantedScope, GrantedScopeProps, GrantedScopeDoc, GrantedScopeSchema };