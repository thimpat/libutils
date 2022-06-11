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
        return lastArg.slice(1) === "/";
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

        if (lowerCaseKey !== key)
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


// Generic functions
module.exports.normalisePath = normalisePath;
module.exports.normaliseDirPath = normaliseDirPath;

module.exports.joinPath = joinPath;
module.exports.mergeDeep = mergeDeep;
module.exports.sleep = sleep;
module.exports.generateTempName = generateTempName;
module.exports.convertSessionKeyNameToArg = convertSessionKeyNameToArg;
module.exports.convertSessionToArg = convertSessionToArg;
module.exports.resolvePath = resolvePath;
module.exports.isItemInList = isItemInList;
module.exports.getFilesizeInBytes = getFilesizeInBytes;
module.exports.convertToUrl = convertToUrl;
module.exports.doNothing = doNothing;
module.exports.fetchSync = fetchSync;
module.exports.calculateRelativePath = calculateRelativePath;
module.exports.normaliseFileName = normaliseFileName;
module.exports.isObject = isObject;
module.exports.addPlural = addPlural;

// CLI Related functions
module.exports.importLowerCaseOptions = importLowerCaseOptions;
module.exports.changeOptionsToLowerCase = changeOptionsToLowerCase;

// Path Related functions
module.exports.isArgsDir = isArgsDir;
module.exports.getAppDataDir = getAppDataDir;
module.exports.createAppDataDir = createAppDataDir;
