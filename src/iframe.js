/*global window, document */

var React       = require("react");
var OnResize    = require("react-window-mixins").OnResize;
var querystring = require("querystring");
var getIn       = require("insides").getIn;

var Visualization = React.createFactory(require("./visualization"));

var VisualizationWrapper = React.createClass({
  mixins: [ OnResize ],

  getInitialState: function() {
    return { documentId: null };
  },

  componentDidMount: function() {
    var hash   = document.location.search.replace("?", "");
    var parsed = querystring.parse(hash);

    this.setState({ documentId: parsed.id });
  },

  onResize: function() {
    this.setState({
      width:  window.innerWidth,
      height: window.innerHeight
    });
  },

  render: function() {
    var canRenderVisualization = [
      this.state.documentId !== null,
      this.state.width  > 0,
      this.state.height > 0
    ].every(function(value) { return value; });

    return React.DOM.div(
      null,
      canRenderVisualization ? Visualization({
        documentId: this.state.documentId,
        width:      this.state.width,
        height:     this.state.height
      }) : null
    );
  }
});

React.render(React.createElement(VisualizationWrapper), document.body);
