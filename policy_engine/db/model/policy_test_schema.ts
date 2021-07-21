import { isEmpty } from 'lodash';
import { createSchema, ExtractDoc, ExtractProps, Type, typedModel } from 'ts-mongoose';
import { UserSchema } from './user_schema';


const testTypes = ['DECISION', 'VALIDATION'] as const;

const PolicyTestSchema = createSchema({
    name: Type.string({ minLength: 0, maxLength: 128 }),
    scopes: Type.array({ required: true, minLength: 1, maxLength: 128 }).of(Type.string({ maxLength: 128 })),
    client: Type.string({ maxLength: 128 }),
    time: Type.date(),
    files: Type.array({ maxLength: 128 }).of(Type.string({ maxLength: 512 })),
    expectedResult: Type.boolean({ required: true }),
    type: Type.string({ required: true, enum: testTypes })
});


const PolicyTestSuiteSchema = createSchema({
    resourceOwnerId: Type.ref(Type.objectId({required: true, index: true})).to('User', UserSchema),
    name: Type.string({ required: true, minLength: 1, maxLength: 128, index:true }),
    tests: Type.array({ required: true, maxLength: 512 }).of(PolicyTestSchema),
    orginalCode: Type.string({ required: true, maxLength: 8192 }),
    createdAt: Type.date({ required: true, default: Date.now as any }),
    lastModified: Type.date({})
});


PolicyTestSuiteSchema.post("validate", (data: any) => {
    for (const test of data.tests) {
        if (test.type === "DECISION") {
            validateDecisionTest(test);
        }
        else {
            validateAccessTest(test);
        }
    }
});


function validateDecisionTest(test: any) {
    if (isEmpty(test.scopes)) {
        throw new Error("A 'scopes' array is mandatory.");
    }
    if (isEmpty(test.client)) {
        throw new Error("A 'client' field is mandatory.")
    }
}


function validateAccessTest(test: any) {
    if (isEmpty(test.scopes)) {
        throw new Error("A 'scopes' array is mandatory.");
    }
    if (isEmpty(test.files)) {
        throw new Error("A 'files' array is mandatory.");
    }
}


const PolicyTest = typedModel('PolicyTest', PolicyTestSchema);
type PolicyTestDoc = ExtractDoc<typeof PolicyTestSchema>;
type PolicyTestProps = ExtractProps<typeof PolicyTestSchema>;
export { PolicyTest, PolicyTestProps, PolicyTestDoc, PolicyTestSchema };


const PolicyTestSuite = typedModel('PolicyTestSuite', PolicyTestSuiteSchema);
type PolicyTestSuiteDoc = ExtractDoc<typeof PolicyTestSuiteSchema>;
type PolicyTestSuiteProps = ExtractProps<typeof PolicyTestSuiteSchema>;
export { PolicyTestSuite, PolicyTestSuiteProps, PolicyTestSuiteDoc, PolicyTestSuiteSchema }


