var nStore = require("./system/store/nStore").nStore;

// Create a store
var users = nStore('./system/store/data/users.db');

// Insert a new document with key "creationix"
users.save("creationix", {name:"xxxx"}, function (err) {
    if (err) { throw err; }
    // The save is finished and written to disk safely
});

