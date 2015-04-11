var extend                 = require("extend");
var React                  = require("react");
var PureRenderMixin        = require("react/addons").PureRenderMixin;
var CreateClass            = require("./addons/create-class");
var indexOfProp            = require("./addons/index-of-prop");

var FileTable              = React.createFactory(require("./file-table"));
var FileNew                = React.createFactory(require("./file-new"));
var Tabs                   = React.createFactory(require("./tabs"));
var Toolbox                = React.createFactory(require("./toolbox"));
var VisualizationGenerator = React.createFactory(require("./visualization-generator"));

var LeftView = CreateClass({
  render: function() {
    return React.DOM.div(
      { className: "left" },
      VisualizationGenerator(this.props),
      Toolbox(this.props)
    );
  }
});

var RightView = CreateClass({
  mixins: [ PureRenderMixin ],

  onFileDataUpdate: function(data) {
    this.props.onFileDataUpdate(data);
  },

  render: function() {
    var files = this.props.files || [];

    return React.DOM.div(
      { className: "right" },
      React.DOM.div(
        { className: "content" },
        Tabs(
          null,
          files
            .map(function(file, index) {
              return FileTable(extend({ key: index }, file));
            })
            .concat([
              FileNew({
                name:             "+",
                className:        "new-file-tab-button",
                onFileDataUpdate: this.onFileDataUpdate
              })
            ])
            .reverse() // TODO: remove this, only for tests!
        )
      )
    );
  }
});

var DocumentEdit = CreateClass({
  onLayerDataUpdate: function(data) {
    this.props.onLayerDataUpdate(data);
  },

  onFileDataUpdate: function(data) {
    this.props.onFileDataUpdate(data);
  },

  render: function() {
    var viewData = {
      files:             this.props.data.files,
      layers:            this.props.data.layers,
      onLayerDataUpdate: this.onLayerDataUpdate,
      onFileDataUpdate:  this.onFileDataUpdate
    };

    return React.DOM.div(
      { className: "document-edit" },
      LeftView(viewData),
      RightView(viewData)
    );
  }
});

var DocumentEditWrapper = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return { data: [] };
  },

  componentDidMount: function() {
    this.getData();
  },

  getData: function() {
    var params = this.context.router.getCurrentParams();

    this.props.api.getDocument(params.id, function(data) {
      this.setState({ data: data });
    }.bind(this));
  },

  onLayerDataUpdate: function(data) {
    var document = this.state.data;
    var index    = indexOfProp(document.layers, "id", data.id);

    if (index >= 0) {
      document.layers[index] = extend(document.layers[index], data);

      this.setState({ data: document });
      this.props.api.updateDocument(document);
    }
  },

  onFileDataUpdate: function(data) {
    var document = this.state.data;

    if (document.files instanceof Array) {
      document.files.push(data);
    }
    else {
      document.files = [ data ];
    }

    this.setState({ data: document });
    this.props.api.updateDocument(document);
  },

  render: function() {
    return DocumentEdit({
      data:              this.state.data,
      getData:           this.getData,
      onFileDataUpdate:  this.onFileDataUpdate,
      onLayerDataUpdate: this.onLayerDataUpdate
    });
  }
});

module.exports = DocumentEditWrapper;
