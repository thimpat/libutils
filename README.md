
## Description

A library containing utility functions working in both ESM and CJS (+ some in the browser when compatible):

---

### normalisePath

* Convert paths by replacing backward slashes "\" with forward slashes "/"
* Always keeps the last "/" for directories

```javascript
normalisePath("C:\\some\\where\\here")      // C:/some/where/here
```

---

### joinPath

* Join paths following the conventions above (normalisePath)

```javascript
joinPath("aaa", "vvv")                      // ./aaa/vvv
joinPath("aaa", "vvv/")                     // ./aaa/vvv/
```

---

### isConventionalFolder

###### If source finishes with a "/", it's a folder, otherwise, it's not.

```javascript
isConventionalFolder("C:\\some\\where\\here\\")      // true
```
---

### resolvePath

###### Resolve path

```javascript
isConventionalFolder("\\where\\here\\")      // /home/user/some/where/here/
```

---

### getAppDataDir

###### Returns OS data dir for the application

---

### sleep

###### Delay code execution for a number of milliseconds

---

### convertToUrl

```javascript
convertToUrl({protocol, host, port, pathname})

convertToUrl({host: "localhost", port: 8877})                           // http://localhost:8877/
convertToUrl({protocol: "https", host: "localhost", port: 8877})        // https://localhost:8877/
convertToUrl({protocol: "https", host: "somewhere"})                    // https://somewhere/
convertToUrl({protocol: "https", host: "somewhere", pathname: "here"})  // https://somewhere/here
```

---

### areEquals

###### Compare two inputs (Objects, Arrays, etc.)

```javascript

areEquals(15, "d");                                              // false

areEquals([1, 2, 3],[1, 2, 3]);                                  // true
areEquals([1, 2, 3],[1, 3, 2]);                                  // false

areEquals({aa: 1, bb: 2, cc: 3}, {aa: 1, bb: 2, cc: 3});         // true
areEquals({aa: 1, bb: 2, cc: 3}, {cc: 3, bb: 2, aa: 1});         // true
areEquals({aa: 1, bb: 2, cc: 3}, {aa: 0, bb: 2, cc: 3});         // false

// true
areEquals(
    [{ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}, {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}],
    [{ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}, {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}],
)

// true
areEquals(
    {ff: 6, ee: [1, 2, 3, "ewe",
                 [{ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}, {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"],
                     dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}]], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1},
    {ff: 6, ee: [1, 2, 3, "ewe",
                 [{ff: 6, ee: [1, 2, 3, "ewe", "dfdf"], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}, {ff: 6, ee: [1, 2, 3, "ewe", "dfdf"],
                     dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1}]], dd: 4, cc: [1, 2, 3, "ewe", "dfdf"], bb: 2, aa: 1},
);
```


---

### calculateRelativePath

###### Calculate path to another path from a source



---

### calculateCommon

###### Returns the longest common directory amongst a list of files and folders

---

### getPackageJson

Returns package.json content

```javascript
// CJS and ESM
const packageJson = getPackageJson()                  
```

```javascript
// Take project name into account
const packageJson = getPackageJson({projectname: "myproject"})                  
```

```javascript
// Find project root even if the current working directory is within a module
// if  pwd === /home/user/projs/project1/node_modules/some_modules/

const packageJson = getPackageJson({root: true})            // Content of /home/user/projs/project1/package.json      
const packageJson = getPackageJson({root: false})           // Content of /home/user/projs/project1/node_modules/some_modules/package.json      

```

> ###### _* Default value for "root" is false_

---

### getLocalIp

###### Try to best guess the machine local IP

```javascript
getLocalIp()      // 192.168.1.4
```




...

### Changelog

##### current:
*  Make the function isItemInList() obsolete
   (The function was meant to be more expressive, but libutils is becoming more generic)
   - Use JavaScript built in [].includes() instead

##### 1.10.0:
*  areEquals() to compare two variables (Objects, Arrays, etc.)


##### 1.9.4:
*  Make non-generic function getGlobalArguments obsolete


##### 1.9.3:
*  Review some minor output for the commonDir function


##### 1.9.2:
*  Fix calculateCommon function

---
