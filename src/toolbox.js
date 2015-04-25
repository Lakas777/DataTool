var extend                 = require("extend");
var React                  = require("react");
var LinkedStateMixin       = require("react/addons").addons.LinkedStateMixin;
var MD5                    = require("MD5");
var classNames             = require("classnames");

var Config                 = require("./config");
var CreateClass            = require("./addons/create-class");

var Reflux                 = require("reflux");
var DocumentStore          = require("./store").DocumentStore;
var DocumentStoreActions   = require("./store").DocumentStoreActions;

var Tabs                   = React.createFactory(require("./tabs"));
var Selection              = React.createFactory(require("./selection"));

var getIn                  = require("./lib/insides").getIn;
var buildObject            = require("./lib/insides").buildObject;
var objectWithoutEmptyKeys = require("./addons/object-without-empty-keys");

var layerFromId = function(data, layerId) {
  return getIn(data.layers.filter(function(layer) {
    return layer.id === layerId;
  }), 0);
};

var columnsFromFile = function(file) {
  return Object.keys(getIn(file, [ "data", 0 ], {}));
};

var ToolboxNewLayer = CreateClass({
  mixins: [ LinkedStateMixin ],

  getInitialState: function() {
    return { name: "" };
  },

  onClickCancel: function() {
    this.setState(this.getInitialState());
  },

  onClickSave: function() {
    DocumentStoreActions.layerCreate({
      name: this.state.name,
      id:   MD5((new Date()).getTime())
    });
  },

  render: function() {
    return React.DOM.div(
      { className: "toolbox-new-layer" },
      React.DOM.div(
        { className: "form-group" },
        React.DOM.div(
          { className: "form-inline" },
          React.DOM.label({ className: "col-md-2" }, "Nazwa"),
          React.DOM.input({ type: "text", className: "col-md-4 form-control", valueLink: this.linkState("name") }),
          React.DOM.div(
            {
              className: "btn btn-default col-md-2 col-md-offset-1",
              onClick: this.onClickCancel
            },
            "Anuluj"
          ),
          React.DOM.div(
            {
              className: "btn btn-success col-md-2 col-md-offset-1",
              onClick: this.onClickSave
            },
            "Zapisz"
          )
        )
      )
    );
  }
});

var ToolboxVisData = CreateClass({
  mixins: [
    Reflux.connectFilter(DocumentStore, "layer", function(data) {
      return layerFromId(data, this.props.layerId);
    }),

    Reflux.connectFilter(DocumentStore, "columns", function(data) {
      var fileId   = layerFromId(data, this.props.layerId).fileId;
      var filtered = data.files.filter(function(file) { return fileId === file.id; });
      var columns  = columnsFromFile(getIn(filtered, 0));

      return columns;
    })
  ],

  layerUpdate: function(path, value) {
    var updateObject = buildObject([
      [ "id", this.props.layerId ],
      [ [ "vis", path ], value ]
    ]);

    DocumentStoreActions.layerUpdate(updateObject);
  },

  render: function() {
    return React.DOM.div(
      { className: "panel panel-default " },
      React.DOM.div(
        { className: "panel-heading" },
        "Dane Wizualizacji"
      ),
      React.DOM.div(
        { className: "panel-body" },
        Selection({
          name:        "Kolumna",
          className:   "col-sm-6",
          selected:    getIn(this.state, [ "layer", "vis", "column" ]),
          onChange:    this.layerUpdate.bind(null, "column"),
          data:        this.state.columns
        }),
        Selection({
          name:        "Typ",
          className:   "col-sm-6",
          selected:    getIn(this.state, [ "layer", "vis", "mappingType" ]),
          onChange:    this.layerUpdate.bind(null, "mappingType"),
          nameGetter:  function(d) { return d.name; },
          valueGetter: function(d) { return d.key; },
          data:        Config.mappingTypes
        }),
        Selection({
          name:        "Zakres",
          className:   "col-sm-6",
          selected:    getIn(this.state, [ "layer", "vis", "rangeType" ]),
          onChange:    this.layerUpdate.bind(null, "rangeType"),
          nameGetter:  function(d) { return d.name; },
          valueGetter: function(d) { return d.key; },
          data:        Config.rangeTypes
        }),
        Selection({
          name:        "Kolory",
          className:   "col-sm-3",
          selected:    getIn(this.state, [ "layer", "vis", "colorNum" ]),
          onChange:    this.layerUpdate.bind(null, "colorNum"),
          data:        Config.colors.nums
        }),
        Selection({
          name:        "Paleta",
          className:   "col-sm-3",
          selected:    getIn(this.state, [ "layer", "vis", "colorPalette" ]),
          onChange:    this.layerUpdate.bind(null, "colorPalette"),
          data:        Config.colors.palettes
        })
      )
    );
  }
});

var ToolboxGeoData = CreateClass({
  mixins: [
    Reflux.connectFilter(DocumentStore, "layer", function(data) {
      return layerFromId(data, this.props.layerId);
    }),

    Reflux.connectFilter(DocumentStore, "columns", function(data) {
      var fileId   = layerFromId(data, this.props.layerId).fileId;
      var filtered = data.files.filter(function(file) { return fileId === file.id; });
      var columns  = columnsFromFile(getIn(filtered, 0));

      return columns;
    })
  ],

  layerUpdate: function(path, value) {
    var updateObject = buildObject([
      [ "id", this.props.layerId ],
      [ [ "geo", path ], value ]
    ]);

    DocumentStoreActions.layerUpdate(updateObject);
  },

  render: function() {
    return React.DOM.div(
      { className: "panel panel-default " },
      React.DOM.div(
        { className: "panel-heading" },
        "Dane Geograficzne"
      ),
      React.DOM.div(
        { className: "panel-body" },
        Selection({
          name:        "Kolumna",
          className:   "col-sm-6",
          selected:    getIn(this.state, [ "layer", "geo", "column" ]),
          onChange:    this.layerUpdate.bind(null, "column"),
          data:        this.state.columns
        }),
        Selection({
          name:        "Typ",
          className:   "col-sm-6",
          selected:    getIn(this.state, [ "layer", "geo", "type" ]),
          onChange:    this.layerUpdate.bind(null, "type"),
          nameGetter:  function(d) { return d.name; },
          valueGetter: function(d) { return d.key; },
          data:        Config.dataTypes
        })
      )
    );
  }
});

var ToolboxFileChoose = CreateClass({
  mixins: [
    Reflux.connectFilter(DocumentStore, "files", function(data) {
      return data.files;
    }),

    Reflux.connectFilter(DocumentStore, "fileId", function(data) {
      return layerFromId(data, this.props.layerId).fileId;
    })
  ],

  onChangeFile: function(fileId) {
    DocumentStoreActions.layerUpdate({
      id:     this.props.layerId,
      fileId: fileId
    });
  },

  render: function() {
    return React.DOM.div(
      { className: "panel panel-default toolbox-file-choose" },
      React.DOM.div(
        { className: "panel-body form-inline" },
        Selection({
          name:           "Arkusz",
          className:      "col-sm-9",
          labelClassName: "col-sm-2",
          onChange:       this.onChangeFile,
          data:           this.state.files,
          selected:       this.state.fileId,
          nameGetter:     function(d) { return d.name; },
          valueGetter:    function(d) { return d.id; }
        })
      )
    );
  }
});

var ToolboxTab = CreateClass({
  render: function() {
    return React.DOM.div(
      { className: "toolbox-tab" },
      ToolboxFileChoose({ layerId: this.props.layerId }),
        ToolboxGeoData({ key: "geodata", layerId: this.props.layerId }),
        ToolboxVisData({ key: "visdata", layerId: this.props.layerId })
    );
  }
});

var Toolbox = React.createClass({
  mixins: [
    Reflux.connectFilter(DocumentStore, "layers", function(data) {
      return getIn(data, "layers", []);
    })
  ],

  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  componentDidMount: function() {
    var params = this.context.router.getCurrentParams();
    DocumentStoreActions.load({ id: params.id });
  },

  onClickRemoveLayer: function(layer) {
    DocumentStoreActions.layerRemove({ id: layer.layerId });
  },

  renderTabTitle: function(tab) {
    var closeButton = React.DOM.span(
      {
        className: "btn btn-xs btn-default remove-tab-button",
        onClick:   this.onClickRemoveLayer.bind(null, tab)
      },
      "✕"
    );

    return React.DOM.div(
      null,
      tab.name,
      (tab.name !== "+") ? closeButton : null
    );
  },

  render: function() {
    return React.DOM.div(
      { className: "toolbox" },
      Tabs(
        { titleGetter: this.renderTabTitle },
        this.state.layers
          .map(function(tab, index) {
            return ToolboxTab({
              key:     index,
              name:    tab.name,
              layerId: tab.id
            });
          })
          .concat([
            ToolboxNewLayer({
              key:       "new-layer-tab-button",
              name:      "+",
              className: "new-layer-tab-button"
            })
          ])
      )
    );
  }
});

module.exports = Toolbox;
