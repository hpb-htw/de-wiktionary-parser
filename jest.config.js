module.exports =  {
    "transform": {
        "^.+\\.(t|j)sx?$": "ts-jest"
    },
    transformIgnorePatterns: ['^.+\\.js$'],
    //"testRegex": "(/tests/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    //testRegex: "(/src/tests/.*|(\\.|/)test)\\.(tsx?)$",
    testRegex: "(/src/tests/.*\\.test)\\.(ts)$",
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
/*
    "collectCoverage": true,
    "coverageReporters": ["text","json", "lcov"],
    "coverageDirectory": "coverage"
*/
};