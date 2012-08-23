
// A Hash is an interable object
var Hash = function(){}
Hash.prototpe = {
    constructor: Hash,
    forEach: function(callback, thisObject) {
        var keys = Object.keys(this),
        length = keys.length;
        for (var i = 0; i < length; i++) {
            var key = keys[i];
            callback.call(thisObject, this[key], key, this);
        }
    },
    map:  function (callback, thisObject) {
        var keys = Object.keys(this),
        length = keys.length,
        accum = new Array(length);
        for (var i = 0; i < length; i++) {
            var key = keys[i];
            accum[i] = callback.call(thisObject, this[key], key, this);
        }
        return accum;
    },
    get length(){
        return Object.keys(this).length;
    }
}
// Hook into commonJS module systems
if (typeof module !== 'undefined' && "exports" in module) {
  module.exports = Hash;
}
