/** to-esm-esm: add
 import fs from "fs";
 import chai from "chai";
 import sinon from "../node_modules/sinon/pkg/sinon-esm.js";
 import memfs from "memfs";
 import {createAppDataDir} from "../lib-utils.cjs";
 **/

/** to-esm-all: remove **/
// ------------
const fs = require("fs");
const chai = require("chai");
const sinon = require("sinon");
const memfs = require("memfs");
const {createAppDataDir} = require("../lib-utils.cjs");
// ------------
/** to-esm-all: end-remove **/


const expect = chai.expect;

describe("Integration: In the libUtils library", function ()
{
    this.timeout(5000);

    before(() =>
    {
        sinon.stub(fs, "mkdirSync").callsFake(function (path, data)
        {
            if (path && /<>/.test(path))
            {
                // memory-fs does not throws an exception on illegal charact
                throw {
                    errno  : -4058,
                    syscall: "mkdir",
                    code   : "ENOENT",
                    path,
                    stack  : `Error: ENOENT: no such file or directory, mkdir '${path}'`,
                    message: `ENOENT: no such file or directory, mkdir '${path}'`
                };
            }
            return memfs.mkdirpSync(path, data);
        });

        sinon.stub(fs, "existsSync").callsFake(function (path)
        {
            return memfs.existsSync(path);
        });

        sinon.stub(fs, "lstatSync").callsFake(function (path)
        {
            return memfs.statSync(path);
        });

    });

    after(() =>
    {
        sinon.restore();
    });

    describe("The function createAppDataDir", () =>
    {
        it("should return the app data dir", async () =>
        {
            const dir = createAppDataDir("jjjjj");
            expect(dir).to.be.true;
        });

        it("should return false when no app name is passed", async () =>
        {
            const dir = createAppDataDir();
            expect(dir).to.be.false;
        });

        /**
         * Memory fs does
         */
        it("should return false when the path contain invalid characters", async () =>
        {
            const dir = createAppDataDir("//%^45#\\-\"'1`<>");
            expect(dir).to.be.false;
        });

        it.skip("should return false when the path is not a string", async () =>
        {
            const dir = createAppDataDir(123);
            expect(dir).to.be.false;
        });

    });
});


