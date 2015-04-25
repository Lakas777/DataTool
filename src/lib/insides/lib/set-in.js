var setOrUpdateIn = require("./set-or-update-in");

module.exports = function(object, key, value) {
  setOrUpdateIn(object, key, value, { extend: false });
};
