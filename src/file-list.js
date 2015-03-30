var React       = require("react");
var Navigation  = require("react-router").Navigation;
var CreateClass = require("./addons/react").CreateClass;

var FileRow = CreateClass({
  onClickRow: function() {
    if (this.props.onClickRow) { this.props.onClickRow(this.props.file); }
  },

  render: function() {
    var file = this.props.file;

    var row = [
      file.name
    ].map(function(child, index) {
      return React.DOM.td({ onClick: this.onClickRow, key: index }, child);
    }.bind(this));

    return React.DOM.tr({ className: "file-row" }, row);
  }
});

var FileList = CreateClass({
  mixins: [ Navigation ],

  onClickRow: function(file) {
    this.transitionTo("file", { id: file.id });
  },

  render: function() {
    var data = this.props.data;

    return React.DOM.div(
      { className: "file-list" },
      React.DOM.table(
        { className: "table table-bordered table-hover" },
        React.DOM.thead(
          null,
          React.DOM.tr(
            null,
            [ "Plik" ].map(function(text, index) {
              return React.DOM.th({ key: index }, text);
            })
          )
        ),
        React.DOM.tbody(
          null,
          data.map(function(file, index) {
            return FileRow({ key: index, file: file, onClickRow: this.onClickRow });
          }.bind(this))
        )
      )
    );
  }
});

var FileListWrapper = React.createClass({
  getInitialState: function() {
    return { data: [] };
  },

  componentDidMount: function() {
    this.getData();
  },

  getData: function() {
    this.props.api.getFiles(function(data) {
      this.setState({ data: data });
    }.bind(this));
  },

  render: function() {
    return FileList({ data: this.state.data, getData: this.getData });
  }
});

module.exports = FileListWrapper;
