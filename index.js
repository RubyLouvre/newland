var server = require("./server");
require("./hot_deployer");

global.app = {
    controllers : {}
};
server.start();

