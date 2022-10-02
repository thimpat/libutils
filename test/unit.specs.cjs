const chai = require("chai");
const expect = chai.expect;

const {
    areEquals, joinPath, normalisePath, getGlobalArguments, sleep, getLocalIp, getIps, convertToUrl, isObject,
    mergeDeep, convertArrayToObject, isItemInList, getCommonDir, getCommon, calculateCommon, getAppDataDir,
    importLowerCaseOptions, changeOptionsToLowerCase, addPlural
} = require("../lib-utils.cjs");

describe("Unit: In the libUtils library", function ()
{
    this.timeout(5000);

    describe("The function getGlobalArguments", () =>
    {
        it("should throw an exception when used", () =>
        {
            expect(getGlobalArguments).to.throw("Obsolete function: Available in version 1.9.3");
        });
    });

    describe("The function isItemInList", () =>
    {
        it("should throw an exception when used", () =>
        {
            expect(isItemInList).to.throw("Obsolete function: Available in version 1.10.3");
        });
    });

    describe("The function isObject", () =>
    {
        it("should be false when input is a null", () =>
        {
            const result = isObject(null);
            expect(result).to.be.false;
        });

        it("should be false when input is a string", () =>
        {
            const result = isObject("aa");
            expect(result).to.be.false;
        });

        it("should be false when input is an array", () =>
        {
            const result = isObject(["aa"]);
            expect(result).to.be.false;
        });

        it("should be false when input is an object", () =>
        {
            const result = isObject({aa: 1});
            expect(result).to.be.true;
        });

    });

    describe("The function convertArrayToObject", () =>
    {
        it("should convert an array to object", () =>
        {
            const result = convertArrayToObject([1, 2, 3]);
            expect(result).to.eql({
                "1": 0,
                "2": 1,
                "3": 2
            });
        });
    });

    describe("The function mergeDeep", () =>
    {
        it("should return the same object when the other is null", () =>
        {
            const obj1 = {aa: 1};
            const obj2 = null;
            const res = mergeDeep(obj1, obj2);
            expect(res).to.equal(obj1);
        });

        it("should merge two objects", () =>
        {
            const obj1 = {aa: 1};
            const obj2 = {bb: 2};
            const res = mergeDeep(obj1, obj2);
            expect(res).to.eql({aa: 1, bb: 2});
        });

        it("should merge two nested objects", () =>
        {
            const obj1 = {aa: 1, cc: {dd: 3}};
            const obj2 = {bb: 2, ee: {ff: 4}};
            const res = mergeDeep(obj1, obj2);
            expect(res).to.eql({
                "aa": 1,
                "bb": 2,
                "cc": {
                    "dd": 3
                },
                "ee": {
                    "ff": 4
                }
            });
        });


    });

    describe("The function sleep", () =>
    {
        it("should do a 1 second pause", async () =>
        {
            const d1 = new Date();
            await sleep(300);
            const d2 = new Date();
            const diffTime = (d2.getTime() - d1.getTime());
            expect(diffTime).to.be.greaterThanOrEqual(300);
        });
    });

    describe("the function joinPath", function ()
    {
        it("should join two relative paths", function ()
        {
            const result = normalisePath("C:\\some\\where\\here");
            expect(result).to.contain("/some/where/here");
        });

        it("should join two relative paths", function ()
        {
            const result = joinPath("aaa", "vvv");
            expect(result).to.equal("./aaa/vvv");
        });

        it("should join paths with a trailing slash", function ()
        {
            const result = joinPath("aaa", "vvv/");
            expect(result).to.equal("./aaa/vvv/");
        });
    });

    describe("the function areEquals", () =>
    {
        // ----------------------
        // Truthies and Falsies
        // ----------------------
        it("should be true when the two arguments are both null", function ()
        {
            const result = areEquals(null, null);
            expect(result).to.be.true;
        });

        it("should be true when the two arguments are both undefined", function ()
        {
            const result = areEquals(null, null);
            expect(result).to.be.true;
        });

        it("should be true when the two arguments are both false", function ()
        {
            const result = areEquals(false, false);
            expect(result).to.be.true;
        });

        it("should be true when the two arguments are both true", function ()
        {
            const result = areEquals(true, true);
            expect(result).to.be.true;
        });

        it("should be false when one argument is undefined and the other null", function ()
        {
            const result = areEquals(null, undefined);
            expect(result).to.be.false;
        });

        it("should be false when one argument is undefined and the other false", function ()
        {
            const result = areEquals(null, undefined);
            expect(result).to.be.false;
        });

        it("should be false when one argument is null and the other false", function ()
        {
            const result = areEquals(null, undefined);
            expect(result).to.be.false;
        });

        // ----------------------
        // Integers
        // ----------------------
        it("should be true when when the two arguments are both 0", function ()
        {
            const result = areEquals(0, 0);
            expect(result).to.be.true;
        });

        it("should be true when when the two arguments are two same integers", function ()
        {
            const result = areEquals(456, 456);
            expect(result).to.be.true;
        });

        it("should be true when when the two arguments are two same integers with opposite sign", function ()
        {
            const result = areEquals(456, -456);
            expect(result).to.be.false;
        });

        it("should be false when arguments are two different integers", function ()
        {
            const result = areEquals(556, 58);
            expect(result).to.be.false;
        });


        // ----------------------
        // String
        // ----------------------
        it("should be false when arguments are the same string", function ()
        {
            const result = areEquals("aaaaa", "aaaaa");
            expect(result).to.be.true;
        });

        it("should be false when arguments are two different string", function ()
        {
            const result = areEquals("aaaaa", "bbbbb");
            expect(result).to.be.false;
        });

        // ----------------------
        // Arrays
        // ----------------------
        it("should be true when arguments are the same array", function ()
        {
            const result = areEquals([1, 2, 3, "ewe", "dfdf"], [1, 2, 3, "ewe", "dfdf"]);
            expect(result).to.be.true;
        });

        it("should be false when arguments are two arrays with different order", function ()
        {
            const result = areEquals([1, 2, 3], [1, 3, 2]);
            expect(result).to.be.false;
        });

        it("should be false when arguments are two different arrays", function ()
        {
            const result = areEquals([1, 2, 3, "ewe", "dfdf"], [1, 2, 3, "ewe", 0]);
            expect(result).to.be.false;
        });

        // ----------------------
        // Non primitive entities
        // ----------------------
        it("should be true when arguments are the same Date object", function ()
        {
            const date = new Date();
            const result = areEquals(date, date);
            expect(result).to.be.true;
        });

        it("should be false when arguments are two different dates", function ()
        {
            const date1 = new Date();
            const date2 = new Date("10/23/2015");
            const result = areEquals(date1, date2);
            expect(result).to.be.false;
        });

        it("should be true when arguments are the same function", function ()
        {
            const f1 = () =>
            {
            };
            const result = areEquals(f1, f1);
            expect(result).to.be.true;
        });

        it("should be true when arguments are functions implemented the same way", function ()
        {
            const f1 = () =>
            {
            };
            const f2 = () =>
            {
            };
            const result = areEquals(f1, f2);
            expect(result).to.be.true;
        });

        it("should be false when arguments are two different functions", function ()
        {
            const f1 = () =>
            {
            };
            const f2 = () =>
            {
                return 2;
            };
            const result = areEquals(f1, f2);
            expect(result).to.be.false;
        });

        it("should be false when one argument is a function and the string value of its implementation", function ()
        {
            const f1 = () =>
            {
            };
            const str = "() => {}";
            const result = areEquals(f1, str);
            expect(result).to.be.false;
        });

        it("should be false when arguments are two different functions", function ()
        {
            const s1 = Symbol(1);
            const s2 = Symbol(1);
            const result = areEquals(s1, s2);
            expect(result).to.be.false;
        });

        // ----------------------
        // Objects
        // ----------------------
        it("should be true when arguments are the same object", function ()
        {
            const result = areEquals({ff: 6, ee: 5, dd: 4, cc: 3, bb: 2, aa: 1}, {
                ff: 6,
                ee: 5,
                dd: 4,
                cc: 3,
                bb: 2,
                aa: 1
            });
            expect(result).to.be.true;
        });

        it("should be true when arguments are the same object, but with different order of keys", function ()
        {
            const result = areEquals({ff: 6, ee: 5, dd: 4, cc: 3, bb: 2, aa: 1}, {
                aa: 1,
                bb: 2,
                dd: 4,
                cc: 3,
                ee: 5,
                ff: 6
            });
            expect(result).to.be.true;
        });

        it("should be false when arguments are two different objects", function ()
        {
            const result = areEquals({ff: 6, ee: 5, dd: 4, cc: 4, bb: 4, aa: 1}, {
                ff: 6,
                ee: 5,
                dd: 4,
                cc: 3,
                bb: 2,
                aa: 1
            });
            expect(result).to.be.false;
        });

        it("should be false when arguments are two different objects with one with a different key", function ()
        {
            const result = areEquals({ff: 6, ee: 5, dd: 4, cc: 3, bb: 2, aa: 1}, {
                gg: 6,
                ee: 5,
                dd: 4,
                cc: 3,
                bb: 2,
                aa: 1
            });
            expect(result).to.be.false;
        });

        it("should be false when arguments are two different objects with one missing a key", function ()
        {
            const result = areEquals({ff: 6, ee: 5, dd: 4, cc: 3, bb: 2, aa: 1}, {ff: 6, ee: 5, cc: 3, bb: 2, aa: 1});
            expect(result).to.be.false;
        });

        // ----------------------
        // Complex nested
        // ----------------------
        it("should be true when arguments are the same two complex nested object with depth === 1", function ()
        {
            const result = areEquals(
                {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1},
                {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1},
            );
            expect(result).to.be.true;
        });

        it("should be false when arguments are different two complex nested object with depth === 1", function ()
        {
            const result = areEquals(
                {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1},
                {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "a", "dfdf"], bb: 2, aa: 1},
            );
            expect(result).to.be.false;
        });

        it("should be true when arguments are the same two complex nested array", function ()
        {
            const result = areEquals(
                [
                    {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1},
                    {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}
                ],
                [
                    {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1},
                    {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}
                ],
            );
            expect(result).to.be.true;
        });

        it("should be false when arguments are different complex nested arrays", function ()
        {
            const result = areEquals(
                [
                    {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1},
                    {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}
                ],
                [
                    {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1},
                    {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 5, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}
                ],
            );
            expect(result).to.be.false;
        });

        it("should be true when arguments are the same two complex nested object with depth > 1", function ()
        {
            const result = areEquals(
                {
                    ff                                               : 6, ee                                        : [
                        1, 2, 3, "ewe",
                        [
                            {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}, {
                            ff                                            : 6, ee                                     : [1, 2, 3, "ewe", "dfdf"],
                            dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1
                        }
                        ]
                    ], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1
                },
                {
                    ff                                               : 6, ee                                        : [
                        1, 2, 3, "ewe",
                        [
                            {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}, {
                            ff                                            : 6, ee: [1, 2, 3, "ewe", "dfdf"],
                            dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1
                        }
                        ]
                    ], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1
                },
            );
            expect(result).to.be.true;
        });

        it("should be false when arguments are different two complex nested object with depth > 1", function ()
        {
            const result = areEquals(
                {
                    ff                                               : 6, ee: [
                        1, 2, 3, "ewe",
                        [
                            {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}, {
                            ff                                            : 6, ee                                     : [1, 2, 3, "ewe", "dfdf"],
                            dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1
                        }
                        ]
                    ], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1
                },
                {
                    ff                                               : 6, ee: [
                        1, 2, 3, "ewe",
                        [
                            {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}, {
                            ff                                     : 6, ee                              : [1, 2, 3, "ewe", "dfdf"],
                            dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2
                        }
                        ]
                    ], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1
                },
            );
            expect(result).to.be.false;
        });


    });


    describe("The function convertToUrl", () =>
    {
        it("should return http://localhost:8877/", async () =>
        {
            const str = convertToUrl({host: "localhost", port: 8877});
            expect(str).to.equal("http://localhost:8877/");
        });

        it("should return https://localhost:8877/", async () =>
        {
            const str = convertToUrl({protocol: "https", host: "localhost", port: 8877});
            expect(str).to.equal("https://localhost:8877/");
        });

        it("should return https://somewhere/", async () =>
        {
            const str = convertToUrl({protocol: "https", host: "somewhere"});
            expect(str).to.equal("https://somewhere/");
        });

        it("should return https://somewhere/here", async () =>
        {
            const str = convertToUrl({protocol: "https", host: "somewhere", pathname: "here"});
            expect(str).to.equal("https://somewhere/here");
        });
    });

    describe("The function changeOptionsToLowerCase", () =>
    {
        it("should change the keys to lowercase", () =>
        {
            const cliOptions = changeOptionsToLowerCase({
                    ROOTDIR: "aaa",
                    NOhEADER: "aaa",
                    untouched: "aaa",
                },
            );

            expect(cliOptions).to.have.keys([
                "ROOTDIR", "NOhEADER",
                "noheader",
                "rootdir",
                "untouched"
            ]);
        });
    });

    describe("The function addPlural", () =>
    {
        it("should add an s to a word", () =>
        {
            const str = addPlural(10, "word");
            expect(str).to.equal("s");
        });

        it("should add an s to a word with the 0 numeral", () =>
        {
            const str = addPlural(0, "word");
            expect(str).to.equal("s");
        });

        it("should not add an s to a word with the 1 numeral", () =>
        {
            const str = addPlural(1, "word");
            expect(str).to.equal("");
        });

        it("should add an s to a verb", () =>
        {
            const str = addPlural(1, "verb");
            expect(str).to.equal("s");
        });

        it("should not add an s to a verb", () =>
        {
            const str = addPlural(2, "verb");
            expect(str).to.equal("");
        });
    });

    describe("The function importLowerCaseOptions", () =>
    {
        it("should change the case according to the passed argument", () =>
        {
            const cliOptions = importLowerCaseOptions({
                    ROOTDIR: "aaa",
                    NOhEADER: "aaa",
                    untouched: "aaa",
                    "hi-there": "aaa",
                    "HELLO-YOU": "aaa"
                },
                "rootDir, noHeader, HiThere", "hello-you"
            );

            expect(cliOptions).to.have.keys([
                "hello-you",
                "hi-there",
                "noHeader",
                "rootDir",
                "untouched"
            ]);
        });

        it("should change the case according to the passed argument and replace dashes", () =>
        {
            const cliOptions = importLowerCaseOptions({
                    ROOTDIR: "aaa",
                    NOhEADER: "aaa",
                    untouched: "aaa",
                    "hi-there": "aaa",
                    "HELLO-YOU": "aaa"
                },
                "rootDir, noHeader, HiThere, helloyou",
                {
                    replaceDash: true, uselowercase: true
                }
            );

            expect(cliOptions).to.have.keys([
                "HiThere",
                "helloyou",
                "noHeader",
                "rootDir",
                "untouched"
            ]);
        });

    });

    describe("The function getCommon", () =>
    {
        it("should return the common part of two strings", () =>
        {
            const dir = getCommon("abcde12345", "abcde54321");
            expect(dir).to.equal("12345");
        });

        it("should return an empty string when both strings are empty", () =>
        {
            const dir = getCommon("", "");
            expect(dir).to.equal("");
        });

    });

    describe("The function getCommonDir", () =>
    {
        it("should return the common part between two directories amongst a list of paths", () =>
        {
            const dir = getCommonDir("/a/b/c/d", "/a/b/c/d/e");
            expect(dir).to.equal("/a/b/c/d");
        });

        it("should return the passed directory when both paths are the same", () =>
        {
            const dir = getCommonDir("/a/b/c/d", "/a/b/c/d");
            expect(dir).to.equal("/a/b/c/d");
        });

        it("should return ./ when one of the paths is empty", () =>
        {
            const dir = getCommonDir("", "/a/b/c/d");
            expect(dir).to.equal("./");
        });

    });

    describe("The function calculateCommon", () =>
    {
        it("should return the common part between multiple file paths", () =>
        {
            const dir = calculateCommon(["/a/b/c/d", "/a/b/c/d/e", "/a/b/c/d/e/g/h/i"]);
            expect(dir).to.equal("/a/b/c/");
        });

        it("should return the common part between multiple directories", () =>
        {
            const dir = calculateCommon(["/a/b/c/d/", "/a/b/c/d/e/", "/a/b/c/d/e/g/h/i/"]);
            expect(dir).to.equal("/a/b/c/d/");
        });

        it("should return the original path when only one argument is passed", () =>
        {
            const dir = calculateCommon(["/a/b/c/d/"]);
            expect(dir).to.equal("/a/b/c/d/");
        });

        it("should return ./ when the list of paths is one empty string", () =>
        {
            const dir = calculateCommon([""]);
            expect(dir).to.equal("./");
        });

        it("should return the correct common directory with Windows formatted paths", () =>
        {
            const dir = calculateCommon([
                    "C:/projects/genserve/src/01-assets/templates/project",
                    "C:/projects/genserve/src/01-assets/templates/project/build",
                    "C:/projects/genserve/src/01-assets/templates/project/dynamic",
                    "C:/projects/genserve/src/01-assets/templates/project/dynamic/errors.server.cjs",
                    "C:/projects/genserve/src/01-assets/templates/project/dynamic/index.server.cjs",
                    "C:/projects/genserve/src/01-assets/templates/project/package.json",
                    "C:/projects/genserve/src/01-assets/templates/project/plugins",
                    "C:/projects/genserve/src/01-assets/templates/project/plugins/stats.cjs",
                    "C:/projects/genserve/src/01-assets/templates/project/public",
                    "C:/projects/genserve/src/01-assets/templates/project/public/css",
                    "C:/projects/genserve/src/01-assets/templates/project/public/css/styles.css",
                    "C:/projects/genserve/src/01-assets/templates/project/public/favicon.png",
                    "C:/projects/genserve/src/01-assets/templates/project/public/genserve-errors.log",
                    "C:/projects/genserve/src/01-assets/templates/project/public/index.html",
                    "C:/projects/genserve/src/01-assets/templates/project/start",
                    "C:/projects/genserve/src/01-assets/templates/project/start/start.cjs"
                ]
            );
            expect(dir).to.equal("C:/projects/genserve/src/01-assets/templates/");
        });

    });

    describe("The function getAppDataDir", () =>
    {
        it("should return the app data dir", async () =>
        {
            const dir = getAppDataDir("jjjjj");
            const tmp = process.platform === "win32" ? "/AppData/Roaming/" : "/tmp";
            expect(dir)
                .to.contain(tmp)
                .to.contain("/jjjjj");
        });

        it("should be null when no app name is passed", async () =>
        {
            const dir = getAppDataDir();
            expect(dir).to.equal(null);
        });
    });

    describe("The function getIps", () =>
    {
        it("should return an ip", async () =>
        {
            const ips = getIps();
            expect(Object.keys(ips).length).to.be.greaterThan(0);
        });
    });

    describe("The function getLocalIp", () =>
    {
        it("should return an ip", async () =>
        {
            const localIp = getLocalIp();
            expect(localIp).to.match(/\d+\.\d+\.\d+\.\d+/);
        });
    });


});


