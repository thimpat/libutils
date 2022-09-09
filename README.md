
## Description

A library that contains utility functions:

### joinPath

```javascript
joinPath("aaa", "vvv")                      // ./aaa/vvv
joinPath("aaa", "vvv/")                     // ./aaa/vvv/
```
---

### normalisePath

```javascript
normalisePath("C:\\some\\where\\here")      // C:/some/where/here
```

---

### getAppDataDir

###### Returns OS data dir for the application

---

### sleep

###### Delay code execution for a number of milliseconds

---

### resolvePath

###### Resolve and optimise path (replace backslashes with forward slashes)

---

### convertToUrl

```javascript
convertToUrl({protocol, host, port, pathname})
```

---

### isConventionalFolder

###### If source finishes with a "/", it's a folder, otherwise, it's not.



---

### calculateRelativePath

###### Calculate path to another path from a source



---

### calculateCommon

###### Returns the longest common directory amongst a list of files and folders

---

...