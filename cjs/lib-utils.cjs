/**
 *
 */

// ==================================================================
// Built-ins
// ==================================================================
/** to-esm-browser: remove **/
const path = require("path");
const fs = require("fs");
const https = require("https");
const crypto = require("crypto");
/** to-esm-browser: end-remove **/

const minimist = require("minimist");

// ==================================================================
// Constants
// ==================================================================
const {PATH_ERRORS} = require("./constants/constants.cjs");

// ==================================================================
// Generic functions
// ==================================================================
/**
 * Delay code execution for a number of milliseconds
 * @param {number} ms Number of milliseconds to delay the code
 * @returns {Promise<unknown>}
 */
function sleep(ms)
{
    return new Promise((resolve) =>
    {
        setTimeout(resolve, ms);
    });
}

function convertArrayToObject(array, defaultValue = undefined)
{
    const object = {};
    const n = array.length;
    for (let i = 0; i < n; ++i)
    {
        const v = array[i];
        object[v] = defaultValue === undefined ? i : defaultValue;
    }
    return object;
}

/**
 * Simple object check
 * @param item
 * @returns {boolean}
 */
function isObject(item)
{
    // null is an object
    if (!item)
    {
        return false;
    }
    // Arrays are objects
    else if (Array.isArray(item))
    {
        return false;
    }
    return typeof item === "object";
}

/**
 * Deep merge two objects.
 * @param target
 * @param sources
 * @see https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
 */
function mergeDeep(target, ...sources)
{
    if (!sources.length)
    {
        return target;
    }
    const source = sources.shift();

    if (isObject(target) && isObject(source))
    {
        for (const key in source)
        {
            if (isObject(source[key]))
            {
                if (!target[key])
                {
                    Object.assign(target, {[key]: {}});
                }
                mergeDeep(target[key], source[key]);
            }
            else
            {
                Object.assign(target, {[key]: source[key]});
            }
        }
    }

    return mergeDeep(target, ...sources);
}

/**
 * Generate a random name
 * @param {string} prefix Prefix generated name with given value
 * @param suffix
 * @param size
 * @param replacementChar
 * @return {string}
 */
function generateTempName({prefix = "", suffix = "", size = 16, replacementChar = "_"} = {})
{
    size = size - prefix.length;
    if (size < 0)
    {
        return prefix;
    }
    return prefix +
        crypto.randomBytes(size).toString("base64").replace(/[^\w\d]/g, replacementChar) +
        suffix;
}

/**
 * Convert a session key property into a CLI argument
 * @example
 *
 * convertSessionKeyNameToArg("staticDirs", ["./", "./public"])
 * // ["--dir", "./", "--dir", "./public"]
 *
 * convertSessionKeyNameToArg("silent")
 * // ["--silent"]
 *
 * convertSessionKeyNameToArg("enableapi", false)
 * // ["--disableapi"]
 * convertSessionKeyNameToArg("enableapi", true)
 * // []
 *
 * convertSessionKeyNameToArg("port", 3000)
 * // ["--port", 3000]
 *
 * convertSessionKeyNameToArg("defaultPage", "index.html")
 * // ["--defaultpage", "index.html"]
 *
 * @param key
 * @param value
 * @returns {(string|*)[]|*[]|*}
 */
const convertSessionKeyNameToArg = (key, value = undefined) =>
{
    const table = {
        port       : "port",
        protocol   : "protocol",
        timeout    : "timeout",
        host       : "host",
        defaultPage: "defaultpage",
        silent     : () => ["--silent"],
        staticDirs : (inputs) =>
        {
            const arr = [];
            inputs.forEach((input) =>
            {
                arr.push("--dir");
                arr.push(input);
            });
            return arr;
        },
        enableapi  : (input) =>
        {
            if (!input)
            {
                return ["--disableapi"];
            }

            return [];
        }
    };

    let arg = table[key];
    if (!arg)
    {
        return [];
    }

    if (typeof arg === "function")
    {
        return arg(value);
    }

    const option = `--${arg}`;
    return [option, value];
};

/**
 * Convert session properties to CLI array
 * @param session
 * @param argv
 * @param scriptPath
 * @param command
 * @param target
 * @returns {*}
 */
const convertSessionToArg = (session, argv, {scriptPath = "", command = "", target = ""} = {}) =>
{
    const argumentsFromSession = argv.slice(0, 1);

    if (scriptPath)
    {
        if (!fs.existsSync(scriptPath))
        {
            throw new Error(`[${scriptPath}] could not be found`);
        }

        argumentsFromSession.push(scriptPath);
    }

    if (command)
    {
        argumentsFromSession.push(command);
        if (target)
        {
            argumentsFromSession.push(target);
        }
    }

    for (const [key, values] of Object.entries(session))
    {
        const res = convertSessionKeyNameToArg(key, values);
        if (!res || !res.length)
        {
            continue;
        }
        argumentsFromSession.push(...res);
    }
    return argumentsFromSession;
};

/**
 * Transform a given path following some conventions.
 * @param somePath
 * @param filepath
 * @param isFolder
 * @returns {string}
 *
 * CONVENTIONS:
 * - All folders must finish with a "/"
 * - Paths must be made of forward slashes (no backward slash)
 */
const normalisePath = (filepath, {
    isFolder = false,
    isForceLinuxFormat = false,
    isForceRelative = true,
    uncRoot = ""
} = {}) =>
{
    let somePath = filepath;
    try
    {
        if (somePath === undefined || somePath === null)
        {
            return somePath;
        }

        if (!somePath.trim())
        {
            return "./";
        }

        if (isFolder === undefined)
        {
            isFolder = isArgsDir(filepath);
        }

        somePath = path.normalize(somePath);
        somePath = somePath.replace(/\\/gm, "/");

        if (isFolder)
        {
            if (!isConventionalFolder(somePath))
            {
                somePath = somePath + "/";
            }
        }

        if (path.isAbsolute(somePath))
        {
            if (isForceLinuxFormat)
            {
                const arr = somePath.split(":/");
                if (arr.length > 1)
                {
                    arr[0] = uncRoot || arr[0];
                    somePath = arr.join("/");
                }
            }

            return somePath;
        }

        const firstChar = somePath.charAt(0);
        if (isForceRelative)
        {
            if (!(firstChar === "." || firstChar === "/"))
            {
                somePath = "./" + somePath;
            }
        }

    }
    catch (e)
    {
        console.error(`Could not normalize path [${filepath}]: ${e.message}`);
    }

    return somePath;
};

const normaliseDirPath = (filepath, {
    isForceLinuxFormat = false,
    isForceRelative = true,
    uncRoot = ""
} = {}) =>
{
    return normalisePath(filepath, {
        isFolder: true,
        isForceLinuxFormat,
        isForceRelative,
        uncRoot
    });
};

const normaliseFileName = (sessionName) =>
{
    try
    {
        if (!sessionName)
        {
            return "";
        }

        sessionName = sessionName.trim().toLowerCase();
        return sessionName;
    }
    catch (e)
    {
        console.error(e);
    }
};

const isArgsDir = (...args) =>
{
    try
    {
        if (args === undefined)
        {
            return false;
        }

        let lastArg = args[args.length - 1];
        if (!lastArg)
        {
            return false;
        }

        lastArg = lastArg.trim();
        // return lastArg.charAt(lastArg.length - 1) === "/";
        return lastArg.slice(-1) === "/";
    }
    catch (e)
    {
        console.error({lid: 1151}, "Missed case The developer has omitted a use case. Please, send us an email" +
            " containing this error if possible => " + e.message);
    }
    return false;
};

/**
 * Join and optimise path
 * @alias path.join
 * @param args
 * @returns {any}
 */
const joinPath = (...args) =>
{
    const isFolder = isArgsDir(...args);
    let filepath = path.join(...args);
    filepath = normalisePath(filepath, {isFolder});
    return filepath;
};

/**
 * Resolve and optimise path (replace backslashes with forward slashes)
 * @alias path.resolve
 * @param filepath
 * @returns {*}
 */
const resolvePath = (filepath) =>
{
    const isFolder = isArgsDir(filepath);
    filepath = path.resolve(filepath);
    filepath = normalisePath(filepath, {isFolder});
    return filepath;
};

const isItemInList = (item, list = []) =>
{
    if (!item)
    {
        return false;
    }

    if (!Array.isArray(list))
    {
        throw new Error("list should be an array");
    }

    if (!list || !list.length)
    {
        return false;
    }
    return list.includes(item);
};

/**
 * Calculate file size
 * @param file
 * @returns {number}
 */
const getFilesizeInBytes = (file) =>
{
    const stats = fs.statSync(file);
    return stats.size;
};

/**
 * Get file text content
 * @alias fs.readFileSync
 * @param filepath
 * @param options
 * @returns {string}
 */
const getFileContent = function (filepath, options = {encoding: "utf-8"})
{
    return fs.readFileSync(filepath, options);
};

/**
 * @alias fs.writeFileSync
 * @param filepath
 * @param options
 */
const writeFileContent = function (filepath, str, options = {encoding: "utf-8"})
{
    return fs.writeFileSync(filepath, str, options);
};

const loadJsonFile = function (filepath)
{
    const rawContent = getFileContent(filepath);
    let json;
    try
    {
        json = JSON.parse(rawContent);
    }
    catch (e)
    {
        console.error(e);
    }
    return json;
};

const saveJsonFile = function (filepath, obj, {indent = null, encoding = "utf-8"} = {})
{
    let str;
    str = JSON.stringify(obj, null, indent);
    writeFileContent(filepath, str, {encoding});
};

const convertToUrl = ({protocol, host, port, pathname}) =>
{
    const url = new URL("http://localhost");
    url.protocol = protocol;
    url.host = host;
    url.port = port;
    if (pathname)
    {
        url.pathname = pathname;
    }

    return url.toString();
};

/**
 * Do nothing. Everything you do is to make any linter ignore you.
 * @param args
 */
const doNothing = function (args)
{
    if (!args)
    {
        console.log({lid: 2000, target: "void"}, args);
    }
};

/**
 * If source finishes with a "/", it's a folder,
 * otherwise, it's not.
 * @returns {boolean}
 */
const isConventionalFolder = (source) =>
{
    if (!source)
    {
        return false;
    }
    return source.charAt(source.length - 1) === "/";
};

/**
 * Use conventions (See file top)
 * @todo Change function name to more appropriate name
 * @param source
 * @param requiredPath
 * @returns {string}
 */
const calculateRelativePath = (source, requiredPath) =>
{
    source = normalisePath(source);
    requiredPath = normalisePath(requiredPath);

    if (!isConventionalFolder(source))
    {
        source = path.parse(source).dir + "/";
    }

    const relativePath = path.relative(source, requiredPath);
    return normalisePath(relativePath);
};


const fetchSync = async function (url, isJson = false)
{
    return new Promise(async function (resolve, reject)
    {
        try
        {
            https.get(url, res =>
            {
                let data = "";

                res.on("data", chunk =>
                {
                    data += chunk;
                });

                res.on("end", () =>
                {
                    data = isJson ? JSON.parse(data) : data;
                    resolve(data);
                });

            }).on("error", err =>
            {
                console.log(err.message);
            });
        }
        catch (e)
        {
            reject(e);
        }
    });
};

/**
 *
 * @param number
 * @param type
 */
function addPlural(number, type = "word")
{
    if (type === "verb")
    {
        return number === 1 ? "s" : "";
    }
    else if (type === "word")
    {
        return number === 1 ? "" : "s";
    }
}

/**
 * Parse command line arguments (using minimist) and make their request
 * easier.
 * @example
 * const {filepath} = getGlobalArguments();
 * const {name, surname} = getGlobalArguments();
 * @type {(function(): ({filepath: *, _: []}|null))|*}
 */
const getGlobalArguments = (function ()
{
    let argv = minimist(process.argv.slice(2));
    let filepath;
    let filepaths = [];
    if (argv._.length)
    {
        filepath = argv._[0];
        filepaths = argv._;
    }


    return function ()
    {
        try
        {
            return {filepath, filepaths, _: argv._, args: argv._, ...argv};
        }
        catch (e)
        {
            console.error({lid: 1000}, e.message);
        }

        return null;
    };
}());


// ==================================================================
// CLI Related functions
// ==================================================================
/**
 * Change cli options to lower case
 * @see [to-esm module for a use case]
 * @param rawCliOptions
 * @param strList
 * @param cliOptions
 * @returns {{}}
 */
const importLowerCaseOptions = (rawCliOptions, strList = "", cliOptions = {}) =>
{
    const table = {};
    const list = strList.split(",");
    list.forEach((realKey) =>
    {
        realKey = realKey.trim();
        table[realKey.toLowerCase()] = realKey;
    });

    Object.keys(rawCliOptions).forEach((key) =>
    {
        const lowerCaseKey = key.toLowerCase();

        if (lowerCaseKey === key)
        {
            const realKey = table[lowerCaseKey];
            if (realKey)
            {
                cliOptions[realKey] = rawCliOptions[key];
                return;
            }
        }

        cliOptions[key] = rawCliOptions[key];
    });

    return cliOptions;
};

/**
 * Returns options in lower case format
 * @param rawCliOptions
 * @param cliOptions
 * @returns {{}}
 */
const changeOptionsToLowerCase = (rawCliOptions, cliOptions = {}) =>
{
    Object.keys(rawCliOptions).forEach((key) =>
    {
        cliOptions[key] = rawCliOptions[key];
        cliOptions[key.toLowerCase()] = rawCliOptions[key];
    });

    return cliOptions;
};

// ==================================================================
// Path Related functions
// ==================================================================
//
// ------------------------------------------------------------------
/**
 * Returns OS data dir for the application
 * @returns {string|null}
 */
const getAppDataDir = (appName) =>
{
    try
    {
        const osDataDir = process.env.APPDATA || (process.platform === "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share");
        return joinPath(osDataDir, appName);
    }
    catch (e)
    {

    }
    return null;
};

/**
 *
 * @returns {boolean}
 */
const createAppDataDir = (appName) =>
{
    try
    {
        const appDataDir = getAppDataDir(appName);
        if (!appDataDir)
        {
            console.error(PATH_ERRORS.DATA_DIR_FAILED);
            return false;
        }

        if (!fs.existsSync(appDataDir))
        {
            fs.mkdirSync(appDataDir, {recursive: true});
        }

        return fs.lstatSync(appDataDir).isDirectory();
    }
    catch (e)
    {
        console.error(e.message);
    }

    return false;
};

const getStackLineInfo = function (line)
{
    try
    {
        let funcName, lineNumber, colNumber, source;

        let arr = line.split(":");
        colNumber = parseInt(arr.pop());
        lineNumber = parseInt(arr.pop());

        const newLine = arr.join(":");
        arr = newLine.split(/\s*\(/);

        source = arr.pop();

        const strArr = arr.pop().match(/\bat\s+(\w+)/);
        funcName = (strArr.length === 2) ? strArr[1] : "";

        return {funcName, lineNumber, colNumber, source, filesource: source};
    }
    catch (e)
    {
        console.error({lid: 1000}, e.message);
    }

    return null;
};

/**
 *
 * @param {number} stackStart Where in the stack to investigate
 * @param stackPhrase
 * @returns {*&{lines: string[]}}
 */
const getCallInfo = ({stackStart = 4, stackPhrase = ""} = {}) =>
{
    let lines, info;
    try
    {
        const error = new Error("MyError");
        lines = error.stack.split("\n");

        let regexp;
        if (stackPhrase)
        {
            regexp = new RegExp(stackPhrase, "gm");
            stackStart = 0;
        }

        if (!stackStart)
        {
            for (let i = 0; i < lines.length; ++i)
            {
                if (regexp.test(lines[i]))
                {
                    stackStart = i + 1;
                    break;
                }
            }
        }

        info = getStackLineInfo(lines[stackStart]);
        if (!info)
        {
            return {};
        }
    }
    catch (e)
    {
        console.error({lid: 2239,}, e.message);
    }

    return {lines, ...info, fileSource: info.source};
};

const getStackInfo = () =>
{
    let lines, info;
    let stack = [];
    try
    {
        const error = new Error("MyError");
        lines = error.stack.split("\n");

        let unusedUntil = -1;
        for (let i = 0; i < lines.length; ++i)
        {
            const line = lines[i];
            if (/\btestgen\.cjs\b/.test(line))
            {
                unusedUntil = i;
            }

            info = getStackLineInfo(line);
            if (!info)
            {
                continue;
            }

            stack.push(info);
        }

        if (unusedUntil > -1)
        {
            stack = stack.slice(unusedUntil);
        }

    }
    catch (e)
    {
        console.error({lid: 2239,}, e.message);
    }

    return stack;
};

/**
 * Compare two objects (deep)
 * @note More than 80 implementations suggested, but this one would be the way I would go for.
 * More importantly, it's the way I thought of implementing before checking for an eventual
 * existing one.
 * @see https://stackoverflow.com/questions/201183/how-to-determine-equality-for-two-javascript-objects
 * @param object1
 * @param object2
 * @returns {boolean}
 */
const areEquals = (object1, object2) => {
    let s = (o) => Object.entries(o).sort().map(i => {
        if(i[1] instanceof Object) i[1] = s(i[1]);
        return i;
    });
    return JSON.stringify(s(object1)) === JSON.stringify(s(object2));
};

// Generic functions
module.exports.normalisePath = normalisePath;
module.exports.normaliseDirPath = normaliseDirPath;
module.exports.convertArrayToObject = convertArrayToObject;

module.exports.joinPath = joinPath;
module.exports.mergeDeep = mergeDeep;
module.exports.sleep = sleep;
module.exports.generateTempName = generateTempName;
module.exports.convertSessionKeyNameToArg = convertSessionKeyNameToArg;
module.exports.convertSessionToArg = convertSessionToArg;
module.exports.resolvePath = resolvePath;
module.exports.isItemInList = isItemInList;
module.exports.convertToUrl = convertToUrl;
module.exports.doNothing = doNothing;
module.exports.fetchSync = fetchSync;
module.exports.calculateRelativePath = calculateRelativePath;
module.exports.normaliseFileName = normaliseFileName;
module.exports.isObject = isObject;
module.exports.addPlural = addPlural;
module.exports.areEquals = areEquals;

// File related function
module.exports.getFilesizeInBytes = getFilesizeInBytes;
module.exports.getFileContent = getFileContent;
module.exports.writeFileContent = writeFileContent;
module.exports.loadJsonFile = loadJsonFile;
module.exports.saveJsonFile = saveJsonFile;

// Profiling Related functions
module.exports.getCallInfo = getCallInfo;
module.exports.getStackInfo = getStackInfo;

// CLI Related functions
module.exports.getGlobalArguments = getGlobalArguments;
module.exports.importLowerCaseOptions = importLowerCaseOptions;
module.exports.changeOptionsToLowerCase = changeOptionsToLowerCase;

// Path Related functions
module.exports.isArgsDir = isArgsDir;
module.exports.getAppDataDir = getAppDataDir;
module.exports.createAppDataDir = createAppDataDir;
