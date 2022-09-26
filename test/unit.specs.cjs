const chai = require("chai");
const expect = chai.expect;

const {areEquals, joinPath, normalisePath} = require("../lib-utils.cjs");

describe("In the libUtils library", function ()
{
    this.timeout(10000);

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
            const result = areEquals(null,null);
            expect(result).to.be.true;
        });

        it("should be true when the two arguments are both undefined", function ()
        {
            const result = areEquals(null,null);
            expect(result).to.be.true;
        });

        it("should be true when the two arguments are both false", function ()
        {
            const result = areEquals(false,false);
            expect(result).to.be.true;
        });

        it("should be true when the two arguments are both true", function ()
        {
            const result = areEquals(true,true);
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
            const result = areEquals(0,0);
            expect(result).to.be.true;
        });

        it("should be true when when the two arguments are two same integers", function ()
        {
            const result = areEquals(456,456);
            expect(result).to.be.true;
        });

        it("should be true when when the two arguments are two same integers with opposite sign", function ()
        {
            const result = areEquals(456,-456);
            expect(result).to.be.false;
        });

        it("should be false when arguments are two different integers", function ()
        {
            const result = areEquals(556,58);
            expect(result).to.be.false;
        });


        // ----------------------
        // String
        // ----------------------
        it("should be false when arguments are the same string", function ()
        {
            const result = areEquals("aaaaa","aaaaa");
            expect(result).to.be.true;
        });

        it("should be false when arguments are two different string", function ()
        {
            const result = areEquals("aaaaa","bbbbb");
            expect(result).to.be.false;
        });

        // ----------------------
        // Arrays
        // ----------------------
        it("should be true when arguments are the same array", function ()
        {
            const result = areEquals([1, 2, 3, "ewe", "dfdf"],[1, 2, 3, "ewe", "dfdf"]);
            expect(result).to.be.true;
        });

        it("should be false when arguments are two arrays with different order", function ()
        {
            const result = areEquals([1, 2, 3],[1, 3, 2]);
            expect(result).to.be.false;
        });

        it("should be false when arguments are two different arrays", function ()
        {
            const result = areEquals([1, 2, 3, "ewe", "dfdf"],[1, 2, 3, "ewe", 0]);
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
            const f1 = () => {};
            const result = areEquals(f1, f1);
            expect(result).to.be.true;
        });

        it("should be true when arguments are functions implemented the same way", function ()
        {
            const f1 = () => {};
            const f2 = () => {};
            const result = areEquals(f1, f2);
            expect(result).to.be.true;
        });

        it("should be false when arguments are two different functions", function ()
        {
            const f1 = () => {};
            const f2 = () => { return 2; };
            const result = areEquals(f1, f2);
            expect(result).to.be.false;
        });

        it("should be false when one argument is a function and the string value of its implementation", function ()
        {
            const f1 = () => {};
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
            const result = areEquals({ff: 6, ee: 5, dd: 4, cc: 3, bb: 2, aa: 1},{ff: 6, ee: 5, dd: 4, cc: 3, bb: 2, aa: 1});
            expect(result).to.be.true;
        });

        it("should be true when arguments are the same object, but with different order of keys", function ()
        {
            const result = areEquals({ff: 6, ee: 5, dd: 4, cc: 3, bb: 2, aa: 1},{aa: 1, bb: 2, dd: 4, cc: 3, ee: 5, ff: 6});
            expect(result).to.be.true;
        });

        it("should be false when arguments are two different objects", function ()
        {
            const result = areEquals({ff: 6, ee: 5, dd: 4, cc: 4, bb: 4, aa: 1},{ff: 6, ee: 5, dd: 4, cc: 3, bb: 2, aa: 1});
            expect(result).to.be.false;
        });

        it("should be false when arguments are two different objects with one with a different key", function ()
        {
            const result = areEquals({ff: 6, ee: 5, dd: 4, cc: 3, bb: 2, aa: 1},{gg: 6, ee: 5, dd: 4, cc: 3, bb: 2, aa: 1});
            expect(result).to.be.false;
        });

        it("should be false when arguments are two different objects with one missing a key", function ()
        {
            const result = areEquals({ff: 6, ee: 5, dd: 4, cc: 3, bb: 2, aa: 1},{ff: 6, ee: 5, cc: 3, bb: 2, aa: 1});
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
                [{ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}, {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}],
                [{ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}, {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}],
            );
            expect(result).to.be.true;
        });

        it("should be false when arguments are different complex nested arrays", function ()
        {
            const result = areEquals(
                [{ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}, {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}],
                [{ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}, {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 5, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}],
            );
            expect(result).to.be.false;
        });

        it("should be true when arguments are the same two complex nested object with depth > 1", function ()
        {
            const result = areEquals(
                {ff: 6, ee: [1, 2, 3, "ewe",
                             [{ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}, {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"],
                                 dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}]], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1},
                {ff: 6, ee: [1, 2, 3, "ewe",
                             [{ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}, {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"],
                                 dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}]], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1},
            );
            expect(result).to.be.true;
        });

        it("should be false when arguments are different two complex nested object with depth > 1", function ()
        {
            const result = areEquals(
                {ff: 6, ee: [1, 2, 3, "ewe",
                             [{ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}, {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"],
                                 dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}]], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1},
                {ff: 6, ee: [1, 2, 3, "ewe",
                             [{ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}, {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"],
                                 dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2}]], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1},
            );
            expect(result).to.be.false;
        });



    });


});


