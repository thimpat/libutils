// ==================================================================
// Built-ins
// ==================================================================
/** to-esm-browser: remove **/
const os = require("os");
const path = require("path");
const fs = require("fs");
const https = require("https");
const crypto = require("crypto");
const {execSync} = require("child_process");
/** to-esm-browser: end-remove **/

// ==================================================================
// Obsolete
// ==================================================================
/**
 * @obsolete
 */
const getGlobalArguments = (function ()
{
    throw new Error(`Obsolete function: Available in version 1.9.3`);
});

/**
 * @obsolete Use built-in includes
 * @returns {boolean}
 */
const isItemInList = () =>
{
    throw new Error(`Obsolete function: Available in version 1.10.3`);
};

// ==================================================================
// Browser incompatibles units
// ==================================================================
/** to-esm-browser: remove **/
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

        somePath = somePath.trim();
        if (!somePath || somePath === ".")
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

const getRelativePath = (path1, path2) =>
{
    const relativePath = path.relative(path1, path2);
    return normalisePath(relativePath);
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

    return getRelativePath(source, requiredPath);
};

const getFilepathCopyName = (filepath, {extension = "bak"} = {}) =>
{
    const parsed = path.parse(filepath);
    const dir = parsed.dir;
    let filename = parsed.name;
    const filepathBak = path.join(dir, filename + `.${extension}`);
    if (!fs.existsSync(filepathBak))
    {
        return filepathBak;
    }

    for (let i = 0; ; ++i)
    {
        const filepathBak = path.join(dir, filename + `.${extension}.${i}`);
        if (!fs.existsSync(filepathBak))
        {
            return filepathBak;
        }
    }

    throw Error(`Could not determine file temp name`);
};
/** to-esm-browser: end-remove **/

// ==================================================================
// Constants
// ==================================================================
const PATH_ERRORS = {
    DATA_DIR_FAILED: "Failed to access application data directory"
};

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
 * Sanitize a string before pushing it to an array
 * @param args
 * @param str
 */
function pushArg(args, str)
{
    str = str.trim();
    if (!str)
    {
        return;
    }

    args.push(str);
}

/**
 *
 * @example
 * 📋 ◀ convertStringArgumentToArray("c1,c2,c3")
 * 💻 ▶ ["c1", "c2", "c3"]
 * @param arr
 * @returns {*|boolean}
 */
const convertSingleCommandLineArgumentToArray = function (arr)
{
    try
    {
        if (Array.isArray(arr))
        {
            return arr;
        }

        arr = arr.trim();
        if (arr.startsWith("[") && arr.endsWith("]"))
        {
            arr = arr.substring(1, arr.length - 1);
            arr = arr.trim();
        }

        arr = arr.split(",");

        return arr;
    }
    catch (e)
    {
        console.error({lid: 3215}, e.message);
    }

    return [];
};

/**
 * Convert a string into an argument list
 * @example
 * 📋 ◀ convertStringArgumentToArray("'/Users/me/Chrome SxS/Application/chrome.exe' --my-errors --aa=true");
 * ---
 * 💻 ▶ ["/Users/me/Chrome SxS/Application/chrome.exe", "--my-errors", "--aa=true"]
 * @param str
 * @returns {*[]}
 */
function convertCommandLineToArray(str)
{
    const symbols = [`"`, "'", "`"];
    const separators = [" "];

    let focusedChar = "";
    const args = [];
    let indexStart = 0;
    let i;
    for (i = 0; i < str.length; ++i)
    {
        const char = str[i];

        if (focusedChar)
        {
            if (char !== focusedChar)
            {
                continue;
            }

            focusedChar = "";
            pushArg(args, str.substring(indexStart + 1, i));
            indexStart = i + 1;
            continue;
        }

        if (separators.includes(char))
        {
            pushArg(args, str.substring(indexStart, i));
            indexStart = i + 1;
            continue;
        }

        if (symbols.includes(char))
        {
            pushArg(args, str.substring(indexStart, i));
            indexStart = i;
            focusedChar = char;
        }

    }

    pushArg(args, str.substring(indexStart));

    return args;
}

function convertStringArgumentToArray(...arg)
{
    return convertCommandLineToArray(...arg);
}

/**
 * Simple object check
 * @param {*} item
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

const normaliseFileName = (filename) =>
{
    try
    {
        if (!filename)
        {
            return "";
        }

        filename = filename.trim().toLowerCase();
        return filename;
    }
    catch (e)
    {
        console.error(e);
    }
};

/** to-esm-browser: remove **/
/**
 * Normalise existing filepath
 * @param filepath
 * @param ignoreSymLink
 * @returns {{[filepath]: string, success: boolean, error: Error}}
 */
const normaliseRealPath = (filepath, {ignoreSymLink = true} = {}) =>
{
    try
    {
        if (!fs.existsSync(filepath))
        {
            return {
                success: false,
                error  : new Error(`The source file "${filepath}" does not exist`)
            };
        }

        let lstats = fs.lstatSync(filepath);

        if (lstats.isSymbolicLink())
        {
            if (ignoreSymLink )
            {
                return {
                    success: false,
                    error  : new Error(`The source file "${filepath}" is a symbolic link. Use normaliseRealPathV2 to take them into account`)
                };
            }
            else
            {
                filepath = fs.realpathSync(filepath);
                lstats = fs.lstatSync(filepath);
            }
        }

        if (lstats.isFile())
        {
            return {
                error: null,
                success : true,
                filepath: normalisePath(filepath, {isFolder: false})
            };
        }
        else if (lstats.isDirectory())
        {
            return {
                error: null,
                success : true,
                filepath: normalisePath(filepath, {isFolder: true})
            };
        }

        return {
            success: false,
            error  : new Error(`This method only handles files, folders and symlinks [${filepath}]`)
        };
    }
    catch (e)
    {
        return {
            success: false,
            error  : e
        };
    }
};

/**
 * Normalise existing filepath with symlinks included
 * @param filepath
 * @returns {{[filepath]: string, success: boolean, error: Error}}
 */
const normaliseRealPathV2 = (filepath) =>
{
    return normaliseRealPath(filepath, {ignoreSymLink: false});
};
/** to-esm-browser: end-remove **/

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

/** to-esm-browser: remove **/
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
/** to-esm-browser: end-remove **/

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

const getHashFromText = (text) =>
{
    try
    {
        const hash = crypto.createHash("sha1");
        hash.setEncoding("hex");
        hash.write(text);
        hash.end();
        return hash.read();
    }
    catch (e)
    {
        console.error({lid: 1000}, e.message);
    }

    return null;
};


/**
 * Return hash of a file
 * @see https://stackoverflow.com/questions/18658612/obtaining-the-hash-of-a-file-using-the-stream-capabilities-of-crypto-module-ie
 * @param filepath
 * @returns {Promise<unknown>}
 */
const getHashFromFile  = (filepath) =>
{
    return new Promise((resolve, reject) =>
    {
        try
        {
            const fd = fs.createReadStream(filepath);
            const hash = crypto.createHash("sha1");
            hash.setEncoding("hex");

            hash.on("finish", function ()
            {
                hash.end();
                const uid = hash.read();
                resolve(uid);
            });

            fd.pipe(hash);
        }
        catch (e)
        {
            console.error({lid: 1000}, e.message);
            reject(e);
        }
    });

};

/**
 * @alias fs.writeFileSync
 * @param filepath
 * @param str
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
 * Not tested
 * @param url
 * @param isJson
 * @returns {Promise<unknown>}
 */
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
 * Whether to add an "s" to a word or verbs
 * @example
 * console.log(`2 thing${addPlural(2)}`     // 2 things
 * console.log(`1 desk${addPlural(2)}`      // 1 desk
 * @FIXME: Remove the verb category
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
 * @param rawObject
 * @param unchangedList
 * @param replaceDash
 * @param uselowercase
 * @returns {{}}
 */
const importLowerCaseOptions = (rawObject, unchangedList = "", {replaceDash = false, uselowercase = true} = {}) =>
{
    const newObject = {};
    const keepUnchanged = {};
    const list = Array.isArray(unchangedList) ? unchangedList : unchangedList.split(",");

    // Keys to keep unchanged
    list.forEach((realKey) =>
    {
        realKey = realKey.trim();
        keepUnchanged[realKey.toLowerCase()] = realKey;
    });

    // Go over each key
    Object.keys(rawObject).forEach((key) =>
    {
        let lowerCaseKey = key.toLowerCase();
        if (replaceDash)
        {
            const validReplacement = lowerCaseKey.replaceAll("-", "");
            if (validReplacement)
            {
                lowerCaseKey = validReplacement;
            }
        }

        // If the key is one to keep unchanged, we do the transformation
        if (keepUnchanged.hasOwnProperty(lowerCaseKey))
        {
            const wantedKey = keepUnchanged[lowerCaseKey];
            newObject[wantedKey] = rawObject[key];
            return;
        }

        // If the user enable this option, we force all keys to lower case
        if (uselowercase)
        {
            newObject[lowerCaseKey] = rawObject[key];
            return;
        }

        newObject[key] = rawObject[key];
    });

    return newObject;
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
/**
 * Returns common parts of strings,
 * @param str1
 * @param str2
 * @returns {string|*}
 */
const getCommon = function (str1, str2)
{
    const max = Math.min(str1.length, str2.length);
    for (let i = 0; i < max; ++i)
    {
        const char1 = str1[i];
        const char2 = str2[i];

        if (char1 !== char2)
        {
            return str1.substring(i);
        }
    }

    return str1;
};

/**
 * Returns common part of directories
 * @param dir1
 * @param dir2
 * @returns {string|*}
 */
const getCommonDir = function (dir1, dir2)
{
    const parts1 = dir1.split("/");
    const parts2 = dir2.split("/");

    if (!dir1.endsWith("/"))
    {
        parts1.pop();
    }

    if (!dir2.endsWith("/"))
    {
        parts2.pop();
    }

    if (!parts1.length || !parts2.length)
    {
        return "./";
    }

    const max = Math.min(parts1.length, parts2.length);

    for (let i = 0; i < max; ++i)
    {
        const word1 = parts1[i];
        const word2 = parts2[i];

        if (word1 !== word2)
        {
            return parts1.slice(0, i).join("/") + "/";
        }
    }

    return dir1;
};

/**
 * Returns the longest common directory amongst a list of files and folders
 * @note Folders must end with a forward slash /
 * @param files
 * @returns {string|*}
 */
const calculateCommon = (files) =>
{
    const n = files.length;
    let longestCommon = normalisePath(files[0]);
    for (let i = 0; i < n; ++i)
    {
        const filepath = normalisePath(files[i]);
        if (n <= 1)
        {
            break;
        }
        longestCommon = getCommonDir(longestCommon, filepath);
    }

    longestCommon = normalisePath(longestCommon);

    // It's a directory
    if (isConventionalFolder(longestCommon))
    {
        return longestCommon;
    }

    // It's a file
    const index = longestCommon.lastIndexOf("/");
    if (index < 0)
    {
        return "/";
    }

    return longestCommon.substring(0, index + 1);
};

// ==================================================================
// User Related functions
// ==================================================================
const getDataDir = () =>
{
    try
    {
        const osDataDir = process.env.APPDATA || (process.platform === "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share");
        return resolvePath(osDataDir);
    }
    catch (e)
    {

    }
    return null;
};

/**
 * Returns OS data dir for the application
 * @returns {string|null}
 */
const getAppDataDir = (appName) =>
{
    try
    {
        const osDataDir = getDataDir();
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
 * Given any input, if it's an object or an array, sort all nested objects by key,
 * otherwise returns the best way for comparing the object.
 * @todo Replace Pure loop with standard loop to make things faster
 * @param currentEntity
 * @returns {*}
 */
let sortEntryByKey = (currentEntity) =>
{
    if (Array.isArray(currentEntity))
    {
        for (let i = 0; i < currentEntity.length; ++i)
        {
            const currentArrayEntry = currentEntity[i];
            if (Array.isArray(currentArrayEntry))
            {
                currentEntity[i] = sortEntryByKey(currentArrayEntry);
            }
            else if (currentArrayEntry instanceof Object)
            {
                currentEntity[i] = sortEntryByKey(currentArrayEntry);
            }
        }

        return currentEntity;
    }
    /**
     * According to:
     * @see https://stackoverflow.com/questions/643782/how-to-check-whether-an-object-is-a-date
     * instance Date is not enough
     */
    else if (Object.prototype.toString.call(currentEntity) === "[object Date]")
    {
        return currentEntity;
    }
    if (typeof currentEntity === "function")
    {
        return currentEntity.toString();
    }
    else if (currentEntity instanceof Object)
    {
        currentEntity = Object.keys({...currentEntity}).sort().reduce(
            (obj, key) => {
                obj[key] = currentEntity[key];
                return obj;
            },
            {}
        );

        return currentEntity;
    }

    return currentEntity;
};


/**
 * Compare two objects (deep)
 * @note More than 80 implementations suggested, but this one would be the way I would go for.
 * More importantly, it's the way I thought of implementing before checking for an eventual
 * existing one.
 *
 * @note I have extended this function to deal with all sort of entries
 *
 * @see https://stackoverflow.com/questions/201183/how-to-determine-equality-for-two-javascript-objects
 * @param {Object} object1
 * @param {Object} object2
 * @returns {boolean}
 */
const areObjectsEquals = (object1, object2) =>
{
    let s = (o) => Object.entries(o).sort().map(i =>
    {
        if (i[1] instanceof Object)
        {
            i[1] = s(i[1]);
        }
        return i;
    });
    return JSON.stringify(s(object1)) === JSON.stringify(s(object2));
};

/**
 * Compare two variables of any types
 *
 * @param {*} entity1
 * @param {*} entity2
 * @returns {boolean}
 * @author Patrice Thimothee
 */
const areEquals = (entity1, entity2) =>
{
    if (typeof entity1 !== typeof entity2)
    {
        return false;
    }

    if (Object.prototype.toString.call(entity1) === "[object Symbol]"
        || Object.prototype.toString.call(entity2) === "[object Symbol]")
    {
        return false;
    }

    const sorted1 = sortEntryByKey(entity1);
    const sorted2 = sortEntryByKey(entity2);
    const str1 = JSON.stringify(sorted1);
    const str2 = JSON.stringify(sortEntryByKey(sorted2));
    return str1 === str2;
};

/**
 * Replace a file if and only if they are different and a temporary security copy can be made
 * @param json
 * @param targetPath
 * @returns {boolean}
 */
const replaceJsonContent = (json, targetPath) =>
{
    try
    {
        if (!json)
        {
            return false;
        }

        // Check target file exists
        if (fs.existsSync(targetPath))
        {
            // Read its content
            const previous = fs.readFileSync(targetPath, {encoding: "utf-8"});
            const json = JSON.parse(previous);

            // Compare with the given value
            if (areEquals(json, previous))
            {
                return true;
            }
        }

        const str = JSON.stringify(json, null, 4);

        // Create a security copy
        const copyFilepath = getFilepathCopyName(targetPath);
        fs.copyFileSync(targetPath, copyFilepath);

        // If it fails we still have a copy
        // NOTE: Need to check use cases
        fs.writeFileSync(targetPath, str, "utf-8");

        // Delete security copy
        fs.unlinkSync(copyFilepath);
        return true;
    }
    catch (e)
    {
        console.error(e.message);
    }

    return false;

};

/**
 * Check if a package is installed globally or locally
 * @example
 * // Check if installed
 * isPackageInstalled("remote-logging")
 *
 * // Check if installed globally
 * isPackageInstalled("remote-logging", {global: true})
 *
 * // Check if a version installed
 * isPackageInstalled("remote-logging", {version: "1.0.0", global: false})
 *
 * @param packageName
 * @param version
 * @param global
 * @param depth
 * @returns {boolean}
 */
const isPackageInstalled = (packageName, {version = null, global = false, depth = 0}) =>
{
    try
    {
        if (version)
        {
            packageName += "@" + version;
        }

        let cli = `npm list ${packageName} --depth ${depth}`;
        if (global)
        {
            cli += " -g";
        }

        const output = execSync(cli);
        const str = output.toString();
        const reg = new RegExp("\\bremote-logging\\b", "g");

        return reg.test(str);
    }
    catch (e)
    {
    }

    return false;
};

/**
 * Tells whether we're in cjs at runtime
 * @returns {boolean}
 */
const isCjs = () =>
{
    try
    {
        if (typeof require === "function")
        {
            if (require.resolve && require.main && require.main.filename)
            {
                return true;
            }
        }
    }
    catch (e)
    {
        console.error({lid: 4321}, e.message);
    }

    return false;
};

/**
 * Find project root directory
 * @returns {string|boolean}
 */
const findProjectDir = ({projectName = "", root = false, startDir = undefined} = {}) =>
{
    try
    {
        projectName = ("" + projectName).trim();
        startDir = startDir || process.cwd();
        startDir = resolvePath(startDir);
        if (root)
        {
            startDir = startDir.split("node_modules")[0];
        }

        while (true)
        {
            const packageJsonPath = joinPath(startDir, "./package.json");
            if (fs.existsSync(packageJsonPath))
            {
                if (projectName)
                {
                    try
                    {
                        const content = fs.readFileSync(packageJsonPath, {encoding: "utf-8"});
                        const json = JSON.parse(content);
                        if (projectName === json.name)
                        {
                            return startDir;
                        }
                    }
                    catch (e)
                    {
                        console.error({lid: 4321}, e.message);
                    }
                }
                else
                {
                    return startDir;
                }
            }

            const parentDir = joinPath(startDir, "..");
            if (startDir === parentDir)
            {
                return "";
            }

            startDir = parentDir;
        }

    }
    catch (e)
    {
        console.error({lid: 4321}, e.message);
    }

    return false;
};

/**
 * Returns package.json content
 * @returns {null|any}
 */
const getPackageJson = ({projectName = "", root = false, startDir = undefined} = {}) =>
{
    try
    {
        const projectRootDir = findProjectDir({projectName, root, startDir});
        if (!projectRootDir)
        {
            return;
        }

        const packageJson = joinPath(projectRootDir, "./package.json");

        const data = fs.readFileSync(packageJson, {encoding: "utf-8"});
        return JSON.parse(data);
    }
    catch (e)
    {
        console.error({lid: 4321}, e.message);
    }

    return null;
};

/** to-esm-browser: remove **/
/**
 * @link https://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
 * @returns {{}|[]|null}
 */
const getIps = ({allInfo = false} = {}) =>
{
    try
    {
        const {networkInterfaces} = os;
        const nets = networkInterfaces();
        const results = {};
        const arr = [];

        for (const name of Object.keys(nets))
        {
            for (const net of nets[name])
            {
                const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
                if (net.family === familyV4Value && !net.internal)
                {
                    results[name] = results[name] || [];

                    if (allInfo)
                    {
                        arr.push(Object.assign({name}, net));
                    }
                    else
                    {
                        results[name].push(net.address);
                    }
                }
            }
        }

        if (allInfo)
        {
            return arr;
        }

        return results;
    }
    catch (e)
    {
        console.error({lid: 4321}, e.message);
    }

    return null;
};

/**
 * Return ips only
 */
const getIpList = () =>
{
    let ipList = [];
    const detectedIps = getIps();
    const list = Object.values(detectedIps);
    for (let i = 0; i < list.length; ++i)
    {
        const ips = list[i] || [];
        ipList.push(...ips);
    }

    ipList = [...new Set(ipList)];
    return ipList;
};

const getIpInfoList = () =>
{
    try
    {
        const list = getIps({allInfo: true});

        for (let i = 0; i < list.length; ++i)
        {
            let priorities = 0;

            const info = list[i];
            const networkName = info.name.toLowerCase();
            const address = info.address;
            const netmask = info.netmask;
            let cidr;
            cidr = info.cidr.split("/");
            cidr[1] = parseInt(cidr[1]);

            if (networkName.includes("vmware") || networkName.includes("vmnet") || networkName.includes("vEthernet") ||
                networkName.includes("(WSL)") || networkName.includes("virtual") || networkName.includes("vbox"))
            {
                priorities += 1;
            }
            else if (networkName.includes("wifi") || networkName.includes("wi-fi") || networkName.includes("wireless"))
            {
                priorities += 3;
            }
            else if (/\bppp/.test(networkName))
            {
                priorities += 2;
            }
            else if (/\bwlan/.test(networkName))
            {
                priorities += 3;
            }
            else if (/\bethernet/.test(networkName) || /\beth/.test(networkName))
            {
                priorities += 5;
            }

            if (address.startsWith("172."))
            {
                priorities += 1;
            }
            else if (address.startsWith("192.168."))
            {
                priorities += 3;
            }

            if (netmask.includes("255.255.255."))
            {
                priorities += 3;
            }
            else if (netmask.includes("255.255."))
            {
                priorities += 1;
            }

            if (cidr[0].startsWith("172."))
            {
                priorities += 1;
            }
            else if (cidr[0].startsWith("192.168."))
            {
                priorities += 4;
            }
            else if (cidr[0].startsWith("192.168.1."))
            {
                priorities += 5;
            }

            // TODO: Add does not end with a .1 => priority +1

            if (cidr[1] >= 24)
            {
                priorities += 2;
            }
            else if (cidr[1] >= 16)
            {
                priorities += 1;
            }

            info.priority = priorities;
        }

        return list.sort((info1, info2) => info1.priority > info2.priority ? -1 : 1);
    }
    catch (e)
    {
        console.error({lid: 4321}, e.message);
    }

    return [];
};

/**
 * Try to best guess local ip
 * @returns {string|(() => AddressInfo)|(() => (AddressInfo | {}))|(() => (AddressInfo | string | null))|boolean}
 */
const getLocalIp = () =>
{
    const list = getIpInfoList();
    return list[0].address;
};
/** to-esm-browser: end-remove **/

const isCircular = (obj) =>
{
    try
    {
        JSON.stringify(obj);
        return false;
    }
    catch (e)
    {
    }

    return true;
};

/**
 * Remove circular references from an object
 * @param obj
 * @param copy
 * @param mark
 * @param circularList
 * @returns {*}
 */
const _simplifyObject = (obj, {
    copy = {},
    mark = `[circular reference]`,
    circularList = []
} = {}) =>
{
    try
    {
        if (!isCircular(obj))
        {
            return obj;
        }
        circularList.push(obj);

        for (let prop in obj)
        {
            let val;
            try
            {
                val = obj[prop];

                if (!isCircular(val))
                {
                    copy[prop] = val;
                    continue;
                }

                if (circularList.includes(val))
                {
                    copy[prop] = mark;
                    continue;
                }

                copy[prop] = _simplifyObject(val, {
                    copy        : {},
                    circularList: circularList
                });

            }
            catch (e)
            {
            }
        }

    }
    catch (e)
    {
        console.error({lid: 6141}, e.message);
    }

    return copy;
};

/**
 * Stringify complex objects and inhibit circular references
 * @param obj
 * @param circular
 * @param mark
 * @returns {string}
 */
const stringifyObject = (obj, {circular = {}, mark = "[circular reference]"} = {}) =>
{
    const simplifiedObject = _simplifyObject(obj, {mark, circular});
    return JSON.stringify(simplifiedObject);
};

const simplifyObject = (obj, {circular = {}, mark = "[circular reference]"} = {}) =>
{
    const newObj = _simplifyObject(obj, {circular, mark});
    const str = JSON.stringify(newObj);
    return JSON.parse(str);
};

/**
 * Whether a string has a json structure
 * @todo NEED BENCHMARK
 * @param str
 * @returns {boolean}
 */
const isJson = (str) =>
{
    try
    {
        return !!JSON.parse(str);
    }
    catch (e)
    {

    }
    return false;
};

const clone = function (source)
{
    return JSON.parse(JSON.stringify(source));
};

module.exports.clone = clone;


// Generic functions
exports.convertArrayToObject = convertArrayToObject;
exports.convertCommandLineToArray = convertCommandLineToArray;
exports.convertStringArgumentToArray = convertStringArgumentToArray;
exports.convertSingleCommandLineArgumentToArray = convertSingleCommandLineArgumentToArray;

exports.mergeDeep = mergeDeep;
exports.sleep = sleep;
exports.convertSessionKeyNameToArg = convertSessionKeyNameToArg;
exports.convertSessionToArg = convertSessionToArg;
exports.isItemInList = isItemInList;
exports.doNothing = doNothing;
exports.isObject = isObject;

exports.areObjectsEquals = areObjectsEquals;
exports.areEquals = areEquals;

exports.replaceJsonContent = replaceJsonContent;
exports._simplifyObject = _simplifyObject;
exports.simplifyObject = simplifyObject;
exports.stringifyObject = stringifyObject;

// String related functions
exports.generateTempName = generateTempName;
exports.getCommon = getCommon;
exports.getCommonDir = getCommonDir;
exports.addPlural = addPlural;
exports.isJson = isJson;

// URL related functions
exports.convertToUrl = convertToUrl;
exports.fetchSync = fetchSync;

// File related functions
/** to-esm-browser: remove **/
exports.getFilesizeInBytes = getFilesizeInBytes;
exports.getFileContent = getFileContent;
exports.writeFileContent = writeFileContent;
exports.getFilepathCopyName = getFilepathCopyName;
exports.getHashFromFile = getHashFromFile;
exports.getHashFromText = getHashFromText;
/** to-esm-browser: end-remove **/

exports.loadJsonFile = loadJsonFile;
exports.saveJsonFile = saveJsonFile;
exports.normaliseFileName = normaliseFileName;

// Profiling Related functions
exports.getCallInfo = getCallInfo;
exports.getStackInfo = getStackInfo;

// CLI Related functions
exports.importLowerCaseOptions = importLowerCaseOptions;
exports.changeOptionsToLowerCase = changeOptionsToLowerCase;

// Path Related functions
exports.isArgsDir = isArgsDir;
exports.getDataDir = getDataDir;
exports.getAppDataDir = getAppDataDir;
exports.createAppDataDir = createAppDataDir;
exports.isConventionalFolder = isConventionalFolder;

/** to-esm-browser: remove **/
exports.resolvePath = resolvePath;
exports.joinPath = joinPath;
exports.normalisePath = normalisePath;
exports.normaliseDirPath = normaliseDirPath;
exports.calculateRelativePath = calculateRelativePath;
exports.normaliseRealPath = normaliseRealPath;
exports.normaliseRealPathV2 = normaliseRealPathV2;
exports.getRelativePath = getRelativePath;
/** to-esm-browser: end-remove **/
exports.calculateCommon = calculateCommon;

// Package related functions
exports.isPackageInstalled = isPackageInstalled;
exports.isCjs = isCjs;
exports.findProjectDir = findProjectDir;
exports.getPackageJson = getPackageJson;

// Network related functions
/** to-esm-browser: remove **/
exports.getIps = getIps;
exports.getIpList = getIpList;
exports.getIpInfoList = getIpInfoList;
exports.getLocalIp = getLocalIp;
/** to-esm-browser: end-remove **/

// Obsolete
exports.getGlobalArguments = getGlobalArguments;


