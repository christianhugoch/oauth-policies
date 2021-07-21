import 'reflect-metadata';

import { parse } from "../../../../../policy_engine/language/parser/parser";
import { testHelper } from "../../parser_test_util";
import {
    dayNames,
    expectedDayFilter,
    hoursAndMinutes,
    onlyHours
} from "../../../test_data/time_filter_test_data";

import { ok } from "should";
import { isEqual, zip } from "lodash";


describe('time filter test', () => {
    it('hours and minutes', () => {
        for (let zipped of zip(hoursAndMinutes.codeArray, hoursAndMinutes.expectedSyntaxTrees)) {
            testHelper(zipped[0], zipped[1]);
        }
    });

    it('only hours', () => {
        for (let zipped of zip(onlyHours.codeArray, onlyHours.expectedSyntaxTrees)) {
            testHelper(zipped[0], zipped[1]);
        }
    });

    it("day filter", () => {
        for (let zipped of zip(expectedDayFilter.codeArray, expectedDayFilter.expectedSyntaxTrees)) {
            testHelper(zipped[0], zipped[1]);
        }
    });

    it('day names may be lower or uppercase', () => {
        for (let i = 0; i < 7; i++) {
            let lowerCase = parse(`permit : true { day = ${dayNames[i]}; }`, 'lower');
            let upperCase = parse(`permit : true { day = ${dayNames[i + 7]}; }`, 'upper');
            ok(isEqual(lowerCase.syntaxTree, upperCase.syntaxTree));
        }
    });
});