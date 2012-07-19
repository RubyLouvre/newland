var File = require ("../build/file-utils").File;

console.log (new File ("a/b/c").getName ()); //Prints: c
console.log (new File ("c").getName ()); //Prints: c