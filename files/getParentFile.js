var File = require ("../build/file-utils").File;

console.log (new File ("a/b/c").getParentFile ().toString ()); //Prints: a/b
console.log (new File ("./a").getParentFile ()); //Prints: null
console.log (new File ("../a").getParentFile ().toString ()); //Prints: ..