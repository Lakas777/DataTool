var React = require("react");

module.exports = function(options) {
  var args = Array.prototype.slice.call(arguments);
  args.shift();

  return React.createElement(React.addons.CSSTransitionGroup, options, args);
};
