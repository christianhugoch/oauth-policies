describe("parser test", () => {
    require("./suites/common_rule_parser_test");
    require("./suites/file_rule_parser_test");
    require("./suites/import_parser_test");
    require("./suites/role_rule_parser_test");
    
    describe("filter test", () => {
        require("./suites/filter/rule_call_parser_test");
        require("./suites/filter/parentheses_parser_test");
        require("./suites/filter/scope_client_parser_test");
        require("./suites/filter/time_filter_parser_test");
    });
});