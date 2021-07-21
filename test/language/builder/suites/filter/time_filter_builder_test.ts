import 'reflect-metadata';

import { builderTestHelper } from "../../builder_test_util";
import {
    onlyHours,
    hoursAndMinutes,
    expectedDayFilter,
} from "../../../test_data/time_filter_test_data";

import { zip } from "lodash";


describe("time filter tests", () => {
    it("hours and minutes", () => {
        for (let zipped of zip(hoursAndMinutes.codeArray, hoursAndMinutes.expectedObjects)) {
            builderTestHelper(zipped[0], zipped[1]);
        }
    });

    it("only hours", () => {
        for (let zipped of zip(onlyHours.codeArray, onlyHours.expectedObjects)) {
            builderTestHelper(zipped[0], zipped[1]);
        }
    });

    it("day filter", () => {
        for (let zipped of zip(expectedDayFilter.codeArray, expectedDayFilter.expectedObjects)) {
            builderTestHelper(zipped[0], zipped[1]);
        }
    });
});