import { DayFilter } from "../../../policy_engine/language/model/policy/rule/expression/filter/single_filter/day_filter";
import { TimeFilter } from "../../../policy_engine/language/model/policy/rule/expression/filter/single_filter/time_filter";
import { timeFilterType } from "../../../policy_engine/language/model/policy/rule/expression/filter/single_filter/time_filter_type";


let operatorsArr = [
    {
        code: '=', expectedFromParser: 'EQUAL',
        expectedFromBuilder: timeFilterType.EQUAL
    },
    {
        code: '>', expectedFromParser: 'GREATER',
        expectedFromBuilder: timeFilterType.GREATER
    },
    {
        code: '>=', expectedFromParser: 'GREATER_EQUAL',
        expectedFromBuilder: timeFilterType.GREATER_EQUAL
    },
    {
        code: '<', expectedFromParser: 'LOWER',
        expectedFromBuilder: timeFilterType.LOWER
    },
    {
        code: '<=', expectedFromParser: 'LOWER_EQUAL',
        expectedFromBuilder: timeFilterType.LOWER_EQUAL
    },
]


export let onlyHours = {
    codeArray: operatorsArr.map((value) => {
        return `time ${value.code} 14;`;

    }),
    get codeArrayWithGrantToken() {
        return this.codeArray.map((value, index) => {
            return {
                code: `granttoken { ${value} }`,
                filterType: operatorsArr[index].expectedFromBuilder,
            }
        });
    },
    expectedSyntaxTrees: operatorsArr.map((value) => {
        return [{
            type: 'TIME_FILTER', "operator": value.expectedFromParser,
            time: { hours: '14' }
        }];
    }),
    expectedObjects: operatorsArr.map((value) => {
        return [
            new TimeFilter(14, NaN, value.expectedFromBuilder)
        ];
    })
};


export let hoursAndMinutes = {
    codeArray: operatorsArr.map((value) => {
        return `time ${value.code} 14:15;`;

    }),
    get codeArrayWithGrantToken() {
        return this.codeArray.map((value, index) => {
            return {
                code: `granttoken { ${value} }`,
                filterType: operatorsArr[index].expectedFromBuilder,
            }
        });
    },
    expectedSyntaxTrees: operatorsArr.map((value) => {
        return [
            {
                type: 'TIME_FILTER', "operator": value.expectedFromParser,
                time: { hours: '14', minutes: '15' }
            }]
    }),
    expectedObjects: operatorsArr.map((value) => {
        return [
            new TimeFilter(14, 15, value.expectedFromBuilder)
        ];
    }),
}


export let dayNames = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];


export let dayMockData = new Map<string, string>(
    dayNames.slice(0, 7).map((dayName, index) => {
        let dayIndex = (5 + index).toString().padStart(2, "0");
        return [dayName, `2020-10-${dayIndex}`];
    })
);


export let expectedDayFilter = {
    codeArray: dayNames.map((value) => {
        return `day = ${value.toLowerCase()};`
    }),
    get codeArrayWithGrantToken() {
        return this.codeArray.slice(0, 7).map((value, index) => {
            return {
                dayName: dayNames[index],
                code: `granttoken { ${value} }`,
            }
        });
    },
    expectedSyntaxTrees: dayNames.map((value) => {
        return [
            { type: 'DAY_FILTER', day: value.toLowerCase() }
        ];
    }
    ),
    expectedObjects: dayNames.map((value) => {
        return [
            new DayFilter(value.toLowerCase())
        ];
    }),
};