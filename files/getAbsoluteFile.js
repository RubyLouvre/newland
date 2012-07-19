var File = require ("../build/file-utils").File;

console.log (new File ("getAbsoluteFile.js").getAbsoluteFile ().toString ());
//Prints: <absolute path>/Node FileUtils/examples/getAbsoluteFile.js