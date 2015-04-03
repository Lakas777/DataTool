var React = require("react");

var VisualizationGenerator = React.createClass({
  render: function() {
    return React.DOM.div(
      { className: "visualization-generator" },
      "VIZ"
    );
  }
});

module.exports = VisualizationGenerator;
