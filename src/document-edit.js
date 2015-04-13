var extend                 = require("extend");
var React                  = require("react");
var indexOfProp            = require("./addons/index-of-prop");
var CreateClass            = require("./addons/create-class");
var CSSTransitionGroup     = require("./addons/css-transition-group");

var FileNew                = React.createFactory(require("./file-new"));
var FileTable              = React.createFactory(require("./file-table"));
var Modal                  = React.createFactory(require("./modal"));
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
  getInitialState: function() {
    return { modal: null };
  },

  onFileDataUpdate: function(data) {
    this.props.onFileDataUpdate(data);
  },

  onClickRemoveFile: function(fileId) {
    this.props.onFileRemove(fileId);
    this.setState({ modal: null });
  },

  onClickCloseModal: function() {
    this.setState({ modal: null });
  },

  onClickRemoveTab: function(file) {
    var footer = React.DOM.div(
      { className: "col-md-6 col-md-offset-3" },
      React.DOM.div(
        {
          className: "btn btn-default col-md-5",
          onClick:   this.onClickCloseModal
        },
        "Nie"
      ),
      React.DOM.div(
        {
          className: "btn btn-danger col-md-5 col-md-offset-2",
          onClick:   this.onClickRemoveFile.bind(null, file.id)
        },
        "Tak"
      )
    );

    var modal = Modal({
      title:        "Na pewno usunąć arkusz \"" + file.name + "\"?",
      footer:       footer,
      onClickClose: this.onClickCloseModal
    });

    this.setState({ modal: modal });
  },

  render: function() {
    var files = this.props.files || [];

    return React.DOM.div(
      { className: "right" },
      React.DOM.div(
        { className: "content" },
        Tabs(
          {
            titleGetter: function(tab) {
              var closeButton = React.DOM.span(
                {
                  className: "btn btn-xs btn-default remove-tab-button",
                  onClick:   this.onClickRemoveTab.bind(null, tab)
                },
                "✕"
              );

              return React.DOM.div(
                null,
                tab.name,
                (tab.name !== "+") ? closeButton : null
              );
            }.bind(this)
          },
          files
            .map(function(file, index) {
              return FileTable(extend({ key: index }, file));
            })
            .concat([
              FileNew({
                key:              "new-file-tab-button",
                name:             "+",
                className:        "new-file-tab-button",
                onFileDataUpdate: this.onFileDataUpdate
              })
            ])
        )
      ),
      CSSTransitionGroup(
        { transitionName: "fade" },
        this.state.modal ? React.DOM.div({ key: "modal" }, this.state.modal) : null
      )
    );
  }
});

var DocumentEdit = CreateClass({
  onLayerDataUpdate: function(data) {
    this.props.onLayerDataUpdate(data);
  },

  onLayerRemove: function(layerId) {
    this.props.onLayerRemove(layerId);
  },

  onFileDataUpdate: function(data) {
    this.props.onFileDataUpdate(data);
  },

  onFileRemove: function(fileId) {
    this.props.onFileRemove(fileId);
  },

  render: function() {
    var viewData = {
      files:             this.props.data.files,
      layers:            this.props.data.layers,
      onLayerDataUpdate: this.onLayerDataUpdate,
      onLayerRemove:     this.onLayerRemove,
      onFileDataUpdate:  this.onFileDataUpdate,
      onFileRemove:      this.onFileRemove
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

    var emptyDocument = {
      id:       data.id,
      fileId:   null,
      name:     null,
      geo:      {
        column: null,
        type:   null
      },
      vis:      {
        column: null
      }
    };

    // if there's layer with given id - update it
    if (index >= 0) {
      // changing fileId in layer should resets this layer to default values
      if (data.fileId !== undefined) {
        document.layers[index] = extend(true, emptyDocument, {
          fileId: data.fileId,
          name:   document.layers[index].name
        });
      }
      else {
        // otherwise just update the data in layer
        document.layers[index] = extend(true, document.layers[index], data);
      }
    }
    // otherwise add new layer
    else {
      document.layers.push(extend(true, emptyDocument, data));
    }

    console.log("updated layer document", document);

    this.setState({ data: document });
    this.props.api.updateDocument(document);
  },

  onLayerRemove: function(layerId) {
    var document = this.state.data;

    document.layers = document.layers.filter(function(layer) {
      return layer.id !== layerId;
    });

    this.setState({ data: document });
    this.props.api.updateDocument(document);
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

  onFileRemove: function(fileId) {
    var document = this.state.data;

    document.files = document.files.filter(function(file) {
      return file.id !== fileId;
    });

    document.layers = document.layers.filter(function(layer) {
      return layer.fileId !== fileId;
    });

    this.setState({ data: document });
    this.props.api.updateDocument(document);
  },

  render: function() {
    return DocumentEdit({
      data:              this.state.data,
      getData:           this.getData,
      onLayerDataUpdate: this.onLayerDataUpdate,
      onLayerRemove:     this.onLayerRemove,
      onFileDataUpdate:  this.onFileDataUpdate,
      onFileRemove:      this.onFileRemove
    });
  }
});

module.exports = DocumentEditWrapper;
