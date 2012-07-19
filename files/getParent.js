var File = require ("../build/file-utils").File;

console.log (new File ("a/b/c").getParent ()); //Prints: a/b
console.log (new File ("./a").getParent ()); //Prints: null
console.log (new File ("../a").getParent ()); //Prints: ..