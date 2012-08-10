$.define("session","../session", function(sessions ){
    return function(flow){
        var sessionsConfig = $.configs.sessions;
        if (sessionsConfig) {
            sessions.createStore(sessionsConfig.store);
        }
    }
})

