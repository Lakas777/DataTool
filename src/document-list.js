var React       = require("react");
var Navigation  = require("react-router").Navigation;
var CreateClass = require("./addons/create-class");

var DocumentRow = CreateClass({
  onClickRow: function() {
    if (this.props.onClickRow) { this.props.onClickRow(this.props.document); }
  },

  render: function() {
    var document = this.props.document;

    var row = [
      document.name
    ].map(function(child, index) {
      return React.DOM.td({ onClick: this.onClickRow, key: index }, child);
    }.bind(this));

    return React.DOM.tr({ className: "document-row" }, row);
  }
});

var DocumentList = CreateClass({
  mixins: [ Navigation ],

  onClickRow: function(document) {
    this.transitionTo("document", { id: document.id });
  },

  render: function() {
    var data = this.props.data;

    return React.DOM.div(
      { className: "document-list" },
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
          data.map(function(document, index) {
            return DocumentRow({ key: index, document: document, onClickRow: this.onClickRow });
          }.bind(this))
        )
      )
    );
  }
});

var DocumentListWrapper = React.createClass({
  getInitialState: function() {
    return { data: [] };
  },

  componentDidMount: function() {
    this.getData();
  },

  getData: function() {
    this.props.api.getDocuments(function(data) {
      this.setState({ data: data });
    }.bind(this));
  },

  render: function() {
    return DocumentList({ data: this.state.data, getData: this.getData });
  }
});

module.exports = DocumentListWrapper;
