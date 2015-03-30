var React = require("react/addons");

var CreateClass = function(spec) {
  return React.createFactory(React.createClass(spec));
};

var CSSTransitionGroup = function(options) {
  var args = Array.prototype.slice.call(arguments);
  args.shift();

  return React.createElement(React.addons.CSSTransitionGroup, options, args);
};

module.exports = {
  CreateClass: CreateClass,
  CSSTransitionGroup: CSSTransitionGroup
};
