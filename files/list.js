var File = require ("../build/file-utils").File;

var create = function (cb){
	var finish = function (){
		i++;
		if (i === 6) cb ();
	};
	var i = 0;
	new File ("a/b/c").createDirectory (function (){
		new File ("a/b/c/c1.txt").createNewFile (finish);
		new File ("a/b/b1.txt").createNewFile (finish);
		new File ("a/b/b2.txt").createNewFile (finish);
		new File ("a/a1.txt").createNewFile (finish);
		new File ("a/a2.txt").createNewFile (finish);
		new File ("a/d").createDirectory (finish);
	});
};

create (function (){
	var f = new File ("a");
	f.list (function (error, files){
		console.log (files);
		//Prints:
		/*
		{
			"b": {
				"b1.txt": "a/b/b1.txt",
				"b2.txt": "a/b/b2.txt",
				c: {
					"c1.txt": "a/b/c/c1.txt"
				}
			},
			d: {},
			"a2.txt": "a/a2.txt",
			"a1.txt": "a/a1.txt"
		}
		*/
	});
	
	var names = [];
	f.list (function (name, path){
		names.push (name);
		return true;
	}, function (error, files){
		console.log (names); //Prints: ["a1.txt", "a2.txt", "b", "d", "b1.txt", "b2.txt", "c", "c1.txt"]
		f.remove ();
	});
});