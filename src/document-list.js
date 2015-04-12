var React              = require("react");
var LinkedStateMixin   = require("react/addons").addons.LinkedStateMixin;

var CreateClass        = require("./addons/create-class");
var CSSTransitionGroup = require("./addons/css-transition-group");

var Modal              = React.createFactory(require("./modal"));

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

var DocumentNewModal = CreateClass({
  mixins: [ LinkedStateMixin ],

  getInitialState: function() {
    return { name: "" };
  },

  onClickClose: function() {
    this.props.onClickClose();
  },

  onClickAdd: function() {
    this.props.onClickAdd({ name: this.state.name });
  },

  render: function() {
    var body = React.DOM.div(
      { className: "form-inline new-document-form-group" },
      React.DOM.div(
        { className: "form-group col-md-12" },
        React.DOM.label({ className: "col-md-2" }, "Nazwa:"),
        React.DOM.input({ type: "text", className: "col-md-4 form-control", valueLink: this.linkState("name") })
      )
    );

    var footer = React.DOM.div(
      { className: "col-md-6 col-md-offset-3" },
      React.DOM.div(
        {
          className: "btn btn-default col-md-5",
          onClick:   this.onClickClose
        },
        "Anuluj"
      ),
      React.DOM.div(
        {
          className: "btn btn-success col-md-5 col-md-offset-2",
          onClick:   this.onClickAdd
        },
        "Dodaj"
      )
    );

    return Modal({
      title:        "Nowy dokument",
      body:         body,
      footer:       footer,
      onClickClose: this.onClickClose
    });
  }
});

var DocumentList = CreateClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return { modal: null };
  },

  onClickRow: function(document) {
   this.context.router.transitionTo("document", { id: document.id });
  },

  onClickCloseModal: function() {
    this.setState({ modal: null });
  },

  onClickAddDocument: function(document) {
    this.props.createDocument(document, function(document) {
      this.context.router.transitionTo("document", { id: document.id });
    }.bind(this));
  },

  onClickNew: function() {
    var modal = DocumentNewModal({
      onClickClose: this.onClickCloseModal,
      onClickAdd:   this.onClickAddDocument
    });

    this.setState({ modal: modal });
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
            [ "Dokument", "" ].map(function(text, index) {
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
      ),
      React.DOM.div(
        { className: "btn btn-primary col-md-2 col-md-offset-5", onClick: this.onClickNew },
        "Nowy dokument"
      ),
      CSSTransitionGroup(
        { transitionName: "fade" },
        this.state.modal ? React.DOM.div({ key: "modal" }, this.state.modal) : null
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

  createDocument: function(document, callback) {
    this.props.api.createDocument(document, callback);
  },

  render: function() {
    return DocumentList({
      data:           this.state.data,
      getData:        this.getData,
      createDocument: this.createDocument
    });
  }
});

module.exports = DocumentListWrapper;
