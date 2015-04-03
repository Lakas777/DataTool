var React = require("react/addons");

module.exports = function(spec) {
  return React.createFactory(React.createClass(spec));
};
