var React         = require("react");

var Config        = require("./config");
var CreateClass   = require("./addons/create-class");

var Visualization = React.createFactory(require("./visualization"));

var VisualizationWrapper = CreateClass({
  render: function() {
    return React.DOM.div(
      { className: "visualization-wrapper" },
      Visualization()
    );
  }
});

var VisualizationGenerator = React.createClass({
  getInitialState: function() {
    return {
      selectedFileIndex:      null,
      selectedGeoColumnIndex: null,
      selectedGeoTypeIndex:   null,
      selectedVisColumnIndex: null
    };
  },

  render: function() {
    console.log("vis props", this.props);

    return React.DOM.div(
      { className: "visualization-generator" },
      "VIZ"
    );
  }
});

module.exports = VisualizationGenerator;
