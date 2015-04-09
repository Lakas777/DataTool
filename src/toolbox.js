var React       = require("react");
var classNames  = require("classnames");
var getKey      = require("./addons/get-key");
var CreateClass = require("./addons/create-class");
var Config      = require("./config");

var Tabs        = React.createFactory(require("./tabs"));

var SelectionView = CreateClass({
  getDefaultProps: function() {
    return {
      nameGetter:  function(d) { return d; },
      valueGetter: function(data, i) { return data[i]; }
    };
  },

  componentDidMount: function() {
    this.onChange({ target: { value: 0 } });
  },

  onChange: function(event) {
    var value = event.target.value;
    value = value !== null && value !== undefined ? +event.target.value : undefined;

    if (value !== undefined) {
      var onChangeData = this.props.valueGetter(this.props.data, value);
      this.props.onChange(onChangeData);
    }
  },

  render: function() {
    return React.DOM.div(
      { className: classNames("form-group", this.props.className) },
      React.DOM.label({ className: this.props.labelClassName }, this.props.name),
      React.DOM.select(
        {
          className: "form-control",
          onChange:  this.onChange
        },
        this.props.data.map(function(d, index) {
          return React.DOM.option({ key: index, value: index }, this.props.nameGetter(d));
        }.bind(this))
      )
    );
  }
});

var ToolboxVisData = CreateClass({
  getInitialState: function() {
    return { selectedColumnName: null };
  },

  parentOnSelectionChange: function() {
    this.props.onSelectionChange({ selectedColumnName: this.state.selectedColumnName });
  },

  onChangeColumn: function(columnName) {
    this.setState({ selectedColumnName: columnName }, this.parentOnSelectionChange);
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
          onChange:      this.onChangeColumn,
          data:          this.props.columns
        })
      )
    );
  }
});

var ToolboxGeoData = CreateClass({
  getInitialState: function() {
    return {
      selectedColumnName: null,
      selectedTypeKey:    null
    };
  },

  parentOnSelectionChange: function() {
    var state = this.state;

    var hasAllKeys = Object.keys(state).reduce(function(memo, key) {
      return memo && state[key];
    }, true);

    if (hasAllKeys) { this.props.onSelectionChange(state); }
  },

  onChangeColumn: function(columnName) {
    this.setState({ selectedColumnName: columnName }, this.parentOnSelectionChange);
  },

  onChangeType: function(typeKey) {
    this.setState({ selectedTypeKey: typeKey }, this.parentOnSelectionChange);
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
          onChange:      this.onChangeColumn,
          data:          this.props.columns
        }),
        SelectionView({
          name:          "Typ:",
          className:     "col-sm-6",
          onChange:      this.onChangeType,
          nameGetter:    function(d) { return d.name; },
          valueGetter:   function(data, i) { return data[i].key; },
          data:          Config.dataTypes
        })
      )
    );
  }
});

var ToolboxFileChoose = CreateClass({
  getInitialState: function() {
    return { selectedFileId: null };
  },

  parentOnFileChoose: function() {
    this.props.onFileChoose({ id: this.state.selectedFileId });
  },

  onChangeFile: function(fileId) {
    this.setState({ selectedFileId: fileId }, this.parentOnFileChoose);
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
          nameGetter:     function(d) { return d.file.name; },
          valueGetter:    function(data, i) { return getKey(data, [ i, "file", "id" ]); }
        })
      )
    );
  }
});

var ToolboxTab = CreateClass({
  getInitialState: function() {
    return { fileId: null };
  },

  onFileChoose: function(event) {
    this.setState({ fileId: event.id }, this.updateVisualization);
  },

  onSelectionChangeGeoData: function(event) {
    this.setState({
      geo: {
        column: event.selectedColumnName,
        type:   event.selectedTypeKey
      }
    }, this.updateVisualization);
  },

  onSelectionChangeVisData: function(event) {
    this.setState({
      vis: {
        column: event.selectedColumnName
      }
    }, this.updateVisualization);
  },

  updateVisualization: function() {
    console.log("TODO: updateVisualization", this.state, this.props);
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
    var dataPanelColumns = getKey(fileForId(this.state.fileId), "columns");

    var showFilePanel  = files.length > 0;
    var showDataPanels = [
      this.state.fileId,
      this.props.columns.length > 0
    ].reduce(function(memo, test) { return memo && test; }, true);

    return React.DOM.div(
      { className: "toolbox-tab" },
      showNode(showFilePanel, ToolboxFileChoose({
        files:        files,
        onFileChoose: this.onFileChoose
      })),
      showNode(showDataPanels, [
        ToolboxGeoData({ key: "geodata", columns: dataPanelColumns, onSelectionChange: this.onSelectionChangeGeoData }),
        ToolboxVisData({ key: "visdata", columns: dataPanelColumns, onSelectionChange: this.onSelectionChangeVisData })
      ])
    );
  }
});

var Toolbox = React.createClass({
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

  render: function() {
    var emitter = this.props.emitter;
    var columns = this.columnData(this.props.files || []);

    return React.DOM.div(
      { className: "toolbox" },
      Tabs({
        tabs:        this.props.layers || [],
        titleGetter: function(tab) { return tab.name; },
        handler:     function(tab) {
          return ToolboxTab({
            layer:   tab,
            columns: columns,
            emitter: emitter
          });
        }
      })
    );
  }
});

module.exports = Toolbox;
