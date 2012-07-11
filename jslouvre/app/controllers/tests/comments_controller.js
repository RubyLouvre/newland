mass.define("comments_controller", function() {
    return {
        "index": function(req, res) {
            res.render("tmpl", {})
        },
        "create": function(req, res) { /* POST */
        },
        "new": function(req, res) {
            res.render("tmpl", {})
        },
        "edit": function(req, res) {
            res.render("tmpl", {})
        },
        "destroy": function(req, res) { /* DELETE */
        },
        "update": function(req, res) { /* PUT */
        },
        "show": function(req, res) {
            res.render("tmpl", {})
        }
    }
});