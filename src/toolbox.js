var extend                 = require("extend");
var React                  = require("react");
var PureRenderMixin        = require("react/addons").PureRenderMixin;
var classNames             = require("classnames");

var Config                 = require("./config");

var Tabs                   = React.createFactory(require("./tabs"));

var getKey                 = require("./addons/get-key");
var CreateClass            = require("./addons/create-class");
var objectWithoutEmptyKeys = require("./addons/object-without-empty-keys");

var SelectionView = CreateClass({
  mixins: [ PureRenderMixin ],

  getInitialState: function() {
    return {
      selected: this.props.selected
    };
  },

  getDefaultProps: function() {
    return {
      selected:    undefined,
      nameGetter:  function(d) { return d; },
      valueGetter: function(d) { return d; }
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.selected !== this.state.selected) {
      this.setState({ selected: nextProps.selected });
    }
  },

  componentDidMount: function() {
    if (this.props.selected === undefined) {
      this.onChange({ target: { value: 0 } });
    }
  },

  onChange: function(event) {
    var value = event.target.value;

    if (value !== undefined && value !== null) {
      this.setState({ selected: value }, function() {
        this.props.onChange(value);
      }.bind(this));
    }
  },

  render: function() {
    var data = this.props.data || [];

    return React.DOM.div(
      { className: classNames("form-group", this.props.className) },
      React.DOM.label({ className: this.props.labelClassName }, this.props.name),
      React.DOM.select(
        {
          className: "form-control",
          value:     this.state.selected,
          onChange:  this.onChange
        },
        data.map(function(d, index) {
          return React.DOM.option(
            {
              key:   index,
              value: this.props.valueGetter(d)
            },
            this.props.nameGetter(d)
          );
        }.bind(this))
      )
    );
  }
});

var ToolboxVisData = CreateClass({
  mixins: [ PureRenderMixin ],

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
        SelectionView({
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
  mixins: [ PureRenderMixin ],

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
        SelectionView({
          name:          "Kolumna:",
          className:     "col-sm-6",
          selected:      this.props.selectedColumn,
          onChange:      this.onChangeColumn,
          data:          this.props.columns
        }),
        SelectionView({
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
  mixins: [ PureRenderMixin ],

  onChangeFile: function(fileId) {
    this.props.onSelectionChange({ selectedFileId: fileId });
  },

  render: function() {
    return React.DOM.div(
      { className: "panel panel-default toolbox-file-choose" },
      React.DOM.div(
        { className: "panel-body form-inline" },
        SelectionView({
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
    var dataPanelColumns = getKey(fileForId(this.props.fileId), "columns");

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

  render: function() {
    var columns = this.columnData(this.props.files || []);

    return React.DOM.div(
      { className: "toolbox" },
      Tabs({
        tabs:        this.props.layers || [],
        titleGetter: function(tab) { return tab.name; },
        handler:     function(tab) {
          return tab ? ToolboxTab({
            layerId:            tab.id,
            fileId:             tab.fileId,
            geo:                tab.geo,
            vis:                tab.vis,
            columns:            columns,
            onSelectionFile:    this.onSelectionFile,
            onSelectionGeoData: this.onSelectionGeoData,
            onSelectionVisData: this.onSelectionVisData
          }) : null;
        }.bind(this)
      })
    );
  }
});

module.exports = ToolboxWrapper;
