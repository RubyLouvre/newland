var File = require ("../build/file-utils").File;

console.log (new File ("../src/file-utils.js").getOriginalPath ()); //Prints: ../src/file-utils.js