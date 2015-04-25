var keysFromArg = require("./keys-from-arg");
var setIn       = require("./set-in");

module.exports = function(mappings) {
  var object = {};

  mappings.forEach(function(mapping) {
    var keys  = keysFromArg(mapping[0]);
    var value = mapping[1];

    setIn(object, keys, value);
  });

  return object;
};
