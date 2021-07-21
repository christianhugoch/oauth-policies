import { Policy } from '../../language/model/policy/policy';
import { UserSchema } from './user_schema';

import { plainToClass } from 'class-transformer';
import { createSchema, ExtractDoc, ExtractProps, Type, typedModel } from 'ts-mongoose';


const PolicySchema = createSchema({
    resourceOwnerId: Type.ref(Type.objectId({ required: true, index: true })).to('User', UserSchema),
    name: Type.string({ required: true, minLength: 1, maxLength: 128 }),
    policyObject: Type.mixed({ required: true }),
    code: Type.string({ required: true, minLength: 1, maxLength: 8192 }),
    createdAt: Type.date({ required: true, default: Date.now as any }),
    lastModified: Type.date({})
});


PolicySchema.statics.resolvePolicyObject = (doc: MongoosePolicyDoc): any => {
    return {
        _id: doc._id,
        name: doc.name,
        policyObject: plainToClass(Policy, doc.policyObject),
        code: doc.code,
        createAt: doc.createdAt,
        lastModified: doc.lastModified
    }
}


const MongoosePolicy = typedModel('Policy', PolicySchema);
type MongoosePolicyProp = ExtractProps<typeof PolicySchema>;
type MongoosePolicyDoc = ExtractDoc<typeof PolicySchema>;
export { MongoosePolicy, MongoosePolicyProp, MongoosePolicyDoc, PolicySchema };