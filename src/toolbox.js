var extend                 = require("extend");
var React                  = require("react");
var LinkedStateMixin       = require("react/addons").addons.LinkedStateMixin;
var MD5                    = require("MD5");
var classNames             = require("classnames");

var Config                 = require("./config");

var Tabs                   = React.createFactory(require("./tabs"));
var Selection              = React.createFactory(require("./selection"));

var getIn                 = require("./addons/get-in");
var CreateClass            = require("./addons/create-class");
var objectWithoutEmptyKeys = require("./addons/object-without-empty-keys");

var ToolboxNewLayer = CreateClass({
  mixins: [ LinkedStateMixin ],

  getInitialState: function() {
    return { name: "" };
  },

  onClickCancel: function() {
    this.setState(this.getInitialState());
  },

  onClickSave: function() {
    this.props.onLayerDataUpdate({
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
          React.DOM.label({ className: "col-md-2" }, "Nazwa:"),
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
  onChangeColumn: function(columnName) {
    this.props.onSelectionChange({ selectedColumnName: columnName });
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
          name:          "Kolumna:",
          className:     "col-sm-6",
          selected:      this.props.selected,
          onChange:      this.onChangeColumn,
          data:          this.props.columns
        })
      )
    );
  }
});

var ToolboxGeoData = CreateClass({
  onChangeColumn: function(columnName) {
    this.props.onSelectionChange({ selectedColumnName: columnName });
  },

  onChangeType: function(typeKey) {
    this.props.onSelectionChange({ selectedTypeKey: typeKey });
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
          name:          "Kolumna:",
          className:     "col-sm-6",
          selected:      this.props.selectedColumn,
          onChange:      this.onChangeColumn,
          data:          this.props.columns
        }),
        Selection({
          name:          "Typ:",
          className:     "col-sm-6",
          selected:      this.props.selectedType,
          onChange:      this.onChangeType,
          nameGetter:    function(d) { return d.name; },
          valueGetter:   function(d) { return d.key; },
          data:          Config.dataTypes
        })
      )
    );
  }
});

var ToolboxFileChoose = CreateClass({
  onChangeFile: function(fileId) {
    this.props.onSelectionChange({ selectedFileId: fileId });
  },

  render: function() {
    return React.DOM.div(
      { className: "panel panel-default toolbox-file-choose" },
      React.DOM.div(
        { className: "panel-body form-inline" },
        Selection({
          name:           "Arkusz:",
          className:      "col-sm-9",
          labelClassName: "col-sm-2",
          onChange:       this.onChangeFile,
          data:           this.props.files,
          selected:       this.props.selected,
          nameGetter:     function(d) { return d.file.name; },
          valueGetter:    function(d) { return d.file.id; }
        })
      )
    );
  }
});

var ToolboxTab = CreateClass({
  onSelectionChangeFile: function(event) {
    this.props.onSelectionFile({
      id:     this.props.layerId,
      fileId: event.selectedFileId
    });
  },

  onSelectionChangeGeoData: function(event) {
    this.props.onSelectionGeoData({
      id:  this.props.layerId,
      geo: objectWithoutEmptyKeys({
        column: event.selectedColumnName,
        type:   event.selectedTypeKey
      })
    });
  },

  onSelectionChangeVisData: function(event) {
    this.props.onSelectionVisData({
      id:  this.props.layerId,
      vis: objectWithoutEmptyKeys({
        column: event.selectedColumnName
      })
    });
  },

  render: function() {
    var showNode = function(condition, node) {
      return condition ? node : null;
    };

    var fileForId = function(fileId) {
      return this.props.columns.reduce(function(memo, file) {
        return file.file.id === fileId ? file : memo;
      }, undefined);
    }.bind(this);

    var files            = this.props.columns;
    var dataPanelColumns = getIn(fileForId(this.props.fileId), "columns");

    var showFilePanel  = files.length > 0;
    var showDataPanels = [
      this.props.fileId,
      this.props.columns.length > 0
    ].reduce(function(memo, test) { return memo && test; }, true);

    return React.DOM.div(
      { className: "toolbox-tab" },
      showNode(showFilePanel, ToolboxFileChoose({
        files:             files,
        selected:          this.props.fileId,
        onSelectionChange: this.onSelectionChangeFile
      })),
      showNode(showDataPanels, [
        ToolboxGeoData({
          key:               "geodata",
          columns:           dataPanelColumns,
          selectedColumn:    this.props.geo.column,
          selectedType:      this.props.geo.type,
          onSelectionChange: this.onSelectionChangeGeoData
        }),
        ToolboxVisData({
          key:               "visdata",
          columns:           dataPanelColumns,
          selected:          this.props.vis.column,
          onSelectionChange: this.onSelectionChangeVisData
        })
      ])
    );
  }
});

var ToolboxWrapper = React.createClass({
  columnData: function(files) {
    return files.reduce(function(memo, file) {
      return memo.concat([{
        file:    {
          name:  file.name,
          id:    file.id
        },
        columns: Object.keys(file.data[0])
      }]);
    }, []);
  },

  onSelectionFile: function(data) {
    this.props.onLayerDataUpdate(data);
  },

  onSelectionGeoData: function(data) {
    this.props.onLayerDataUpdate(data);
  },

  onSelectionVisData: function(data) {
    this.props.onLayerDataUpdate(data);
  },

  onLayerDataUpdate: function(data) {
    this.props.onLayerDataUpdate(data);
  },

  onClickRemoveLayer: function(layer) {
    this.props.onLayerRemove(layer.layerId);
  },

  render: function() {
    var columns = this.columnData(this.props.files || []);
    var layers  = this.props.layers || [];

    return React.DOM.div(
      { className: "toolbox" },
      Tabs(
        {
          titleGetter: function(tab) {
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
          }.bind(this)
        },
        layers
          .map(function(tab, index) {
            return ToolboxTab({
              key:                index,
              name:               tab.name,
              layerId:            tab.id,
              fileId:             tab.fileId,
              geo:                tab.geo,
              vis:                tab.vis,
              columns:            columns,
              onSelectionFile:    this.onSelectionFile,
              onSelectionGeoData: this.onSelectionGeoData,
              onSelectionVisData: this.onSelectionVisData
            });
          }.bind(this))
          .concat([
            ToolboxNewLayer({
              key:               "new-layer-tab-button",
              name:              "+",
              className:         "new-layer-tab-button",
              onLayerDataUpdate: this.onLayerDataUpdate
            })
          ])
      )
    );
  }
});

module.exports = ToolboxWrapper;
