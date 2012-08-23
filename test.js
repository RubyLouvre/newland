var nStore = require("./system/store/nStore").nStore;


new nStore('./system/store/data/users.db', function (err, users) {
    // It's loaded now
    // Insert a new document with key "creationix"
    users.save("creationix", {
        name:"xxxx"
    }, function (err) {
        if (err) {
            throw err;
        }
    // The save is finished and written to disk safely
    });

});


