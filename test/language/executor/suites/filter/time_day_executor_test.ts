import 'reflect-metadata';

import { buildPolicy } from "../../../../../policy_engine/language/builder/builder_util";
import { parse } from "../../../../../policy_engine/language/parser/parser";
import { timeFilterType } from "../../../../../policy_engine/language/model/policy/rule/expression/filter/single_filter/time_filter_type";
import { equal, ok } from "should";
import { ExecutionController } from "../../../../../policy_engine/language/executor/decision_controller";
import {
    onlyHours,
    hoursAndMinutes,
    expectedDayFilter,
    dayMockData,
} from "../../../test_data/time_filter_test_data";

import MockDate from 'mockdate';


describe("time / day filter executor test", () => {
    it("only hours without minutes, time: 14", () => {
        for (let testData of onlyHours.codeArrayWithGrantToken) {
            let policy = buildPolicy(parse(testData.code, "dummy"));
            if (testData.filterType === timeFilterType.EQUAL) {
                MockDate.set("2020-10-05T14:00:00");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:30:00");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:59:59");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T15:00:00");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
            }
            else if (testData.filterType === timeFilterType.GREATER) {
                MockDate.set("2020-10-05T14:00:00");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:30:00");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:59:59");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());

                MockDate.set("2020-10-05T15:00:00");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T23:59:59");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());

                MockDate.set("2020-10-05T00:00:00");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T13:59:59");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
            }
            else if (testData.filterType === timeFilterType.GREATER_EQUAL) {
                MockDate.set("2020-10-05T14:00:00");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:30:00");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:59:59");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());

                MockDate.set("2020-10-05T15:00:00");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T23:59:59");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());

                MockDate.set("2020-10-05T00:00:00");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T13:59:59");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
            }
            else if (testData.filterType === timeFilterType.LOWER) {
                MockDate.set("2020-10-05T14:00:00");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:30:00");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:59:59");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());

                MockDate.set("2020-10-05T15:00:00");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T23:59:59");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());

                MockDate.set("2020-10-05T00:00:00");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T13:59:59");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
            }
            else if (testData.filterType === timeFilterType.LOWER_EQUAL) {
                MockDate.set("2020-10-05T14:00:00");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:30:00");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:59:59");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());

                MockDate.set("2020-10-05T15:00:00");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T23:59:59");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());

                MockDate.set("2020-10-05T00:00:00");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T13:59:59");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
            }
        }
    });

    it("hours with minutes, time: 14:15", () => {
        for (let testData of hoursAndMinutes.codeArrayWithGrantToken) {
            let policy = buildPolicy(parse(testData.code, "dummy"));
            if (testData.filterType === timeFilterType.EQUAL) {
                MockDate.set("2020-10-05T14:15:00");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:15:30");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:15:59");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());

                MockDate.set("2020-10-05T14:16:00");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T23:59:59");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T00:00:00");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:00:00");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:14:59");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
            }
            else if (testData.filterType === timeFilterType.GREATER) {
                MockDate.set("2020-10-05T14:15:00");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:15:30");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:15:59");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());

                MockDate.set("2020-10-05T14:16:00");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T23:59:59");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T00:00:00");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:00:00");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:14:59");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
            }
            else if (testData.filterType === timeFilterType.GREATER_EQUAL) {
                MockDate.set("2020-10-05T14:15:00");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:15:30");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:15:59");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());

                MockDate.set("2020-10-05T14:16:00");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T23:59:59");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T00:00:00");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:00:00");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:14:59");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
            }
            else if (testData.filterType === timeFilterType.LOWER) {
                MockDate.set("2020-10-05T14:15:00");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:15:30");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:15:59");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());

                MockDate.set("2020-10-05T14:16:00");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T23:59:59");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T00:00:00");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:00:00");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:14:59");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
            }
            else if (testData.filterType === timeFilterType.LOWER_EQUAL) {
                MockDate.set("2020-10-05T14:15:00");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:15:30");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:15:59");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());

                MockDate.set("2020-10-05T14:16:00");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T23:59:59");
                ok(!new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T00:00:00");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:00:00");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
                MockDate.set("2020-10-05T14:14:59");
                ok(new ExecutionController(["scopeA"], "clientA", [policy]).decide());
            }
        }
    });

    it("day filter test", () => {
        for (let testData of expectedDayFilter.codeArrayWithGrantToken) {
            let policy = buildPolicy(parse(testData.code, "dummy"));
            dayMockData.forEach((dateWithoutTime, dayName) => {
                MockDate.set(dateWithoutTime);
                let shouldPass = dayName === testData.dayName;
                equal(new ExecutionController(["scopeA"], "clientA", [policy]).decide(), shouldPass);
                MockDate.set(`${dateWithoutTime}T00:00:00`);
                equal(new ExecutionController(["scopeA"], "clientA", [policy]).decide(), shouldPass);
                MockDate.set(`${dateWithoutTime}T12:00:00`);
                equal(new ExecutionController(["scopeA"], "clientA", [policy]).decide(), shouldPass);
                MockDate.set(`${dateWithoutTime}T23:59:59`);
                equal(new ExecutionController(["scopeA"], "clientA", [policy]).decide(), shouldPass);
            });
        }
    });

    after(() => {
        MockDate.reset();
    })
});
