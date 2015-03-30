/*global document */

var React  = require("react");
var Router = require("react-router");
var api    = require("./api");

var Route        = React.createFactory(Router.Route);
var DefaultRoute = React.createFactory(Router.DefaultRoute);
var RouteHandler = React.createFactory(Router.RouteHandler);

var Header   = React.createFactory(require("./header"));
var FileList = require("./file-list");
var FileEdit = require("./file-edit");

var Main = React.createClass({
  render: function() {
    return React.DOM.div(
      { className: "container main" },
      Header(),
      RouteHandler(this.props)
    );
  }
});

var Routes = Route(
  { path: "/", name: "app", handler: Main },
  DefaultRoute({ handler: FileList }),
  Route({ path: "/file/?:id", name: "file",  handler: FileEdit })
);

Router.run(Routes, Router.HashLocation, function(Handler, state) {
  var params = { api: api, params: state.params, query: state.query };
  React.render(React.createElement(Handler, params), document.body);
});

