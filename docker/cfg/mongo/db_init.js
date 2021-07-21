db.createRole({
    role: "EngineRole", privileges: [
        {
            resource: { collection: "policies", db: "policy_system" },
            actions: ["find", "remove", "update", "insert"]
        },
        {
            resource: { collection: "grantedscopes", db: "policy_system" },
            actions: ["find", "remove", "update", "insert"]
        },
        {
            resource: { collection: "policytests", db: "policy_system" },
            actions: ["find", "remove", "update", "insert"]
        },
        {
            resource: { collection: "policytests", db: "policy_system" },
            actions: ["find", "remove", "update", "insert"]
        },
        {
            resource: { collection: "policytestsuites", db: "policy_system" },
            actions: ["find", "remove", "update", "insert"]
        },
        {
            resource: { collection: "users", db: "policy_system" },
            actions: ["find", "remove", "update", "insert"]
        },
    ]
    , roles: []
});

db.createUser({
    user: "EngineUser", pwd: "PGqq3fßo4dqQ34",
    roles: ["EngineRole"]
});
