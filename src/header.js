var React = require("react");
var Link  = React.createFactory(require("react-router").Link);

var Header = React.createClass({
  render: function() {
    return React.DOM.div(
      { className: "header navbar navbar-inverse navbar-fixed-top" },
      React.DOM.div(
        { className: "container" },
        Link({ to: "app", className: "navbar-brand" }, "DataBlog Tool")
      )
    );
  }
});

module.exports = Header;
