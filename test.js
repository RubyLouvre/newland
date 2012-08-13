var mongo  = require('mongodb');
var db = new mongo.Db("northwind", new mongo.Server('localhost', 27017, {}), {});
var doc = {
    author: 'joe',
    created : new Date('03/28/2009'),
    title : 'Yet another blog post',
    text : 'Here is the text...',
    tags : [ 'example', 'joe' ],
    comments : [ {
        author: 'jim',
        comment: 'I disagree'
    },
    {
        author: 'blue',
        comment: 'no,year'
    },
    {
        author: 'nancy',
        comment: 'Good post'
    }
    ]
}
db.open(function() {
    db.collection("posts", function(err, posts) {
        posts.insert(doc);
        var cursor = posts.find( {
            "comments.author" : "jim"
        })
        cursor.nextObject(function(){
            console.log(cursor.items)
        })

    });
});
