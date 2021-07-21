describe("suite", async () => {
    require("./suites/file_rule_executor_test");
    require("./suites/role_rule_executor_test");
    describe("filter", () => {
        require("./suites/filter/scope_client_executor_test");
        require("./suites/filter/rule_call_executor_test");
        require("./suites/filter/time_day_executor_test");
        require("./suites/filter/parentheses_executor_test");
    });
});