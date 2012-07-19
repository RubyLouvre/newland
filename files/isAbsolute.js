var File = require ("../build/file-utils").File;

console.log (new File ("isAbsolute").isAbsolute ()); //Prints: false
console.log (new File ("/foo").isAbsolute ()); //Prints: true