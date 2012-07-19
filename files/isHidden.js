var File = require ("../build/file-utils").File;

console.log (new File (".foo").isHidden ()); //Prints: true
console.log (new File ("isHidden.js").isHidden ()); //Prints: false