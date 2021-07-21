describe("builder test", () => {
    require('./suites/file_rule_builder_test');
    require('./suites/import_builder_test');
    require('./suites/role_rule_builder_test');
    
    describe("filter test", () => {
        require("./suites/filter/rule_call_builder_test");
        require('./suites/filter/parentheses_builder_test');
        require("./suites/filter/scope_client_builder_test");
        require("./suites/filter/time_filter_builder_test");
    });
});