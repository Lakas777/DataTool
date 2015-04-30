var extend                = require("extend");
var React                 = require("react");
var LinkedStateMixin      = require("react/addons").addons.LinkedStateMixin;

var CreateClass           = require("./addons/create-class");
var CSSTransitionGroup    = require("./addons/css-transition-group");

var Reflux                = require("reflux");
var DocumentsStoreActions = require("./store").DocumentsStoreActions;
var DocumentsStore        = require("./store").DocumentsStore;

var Link                  = React.createFactory(require("react-router").Link);
var Modal                 = React.createFactory(require("./modal"));

var DocumentNewModal = CreateClass({
  mixins: [ LinkedStateMixin ],

  getInitialState: function() {
    return { name: "" };
  },

  onClickClose: function() {
    this.props.onClickClose();
  },

  onClickAdd: function() {
    var document = { name: this.state.name };

    DocumentsStoreActions.create(document);
    this.props.onClickAdd(document);
  },

  render: function() {
    var body = React.DOM.div(
      { className: "form-inline new-document-form-group" },
      React.DOM.div(
        { className: "form-group col-md-12" },
        React.DOM.label({ className: "col-md-2" }, "Nazwa"),
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

var DocumentRenameModal = CreateClass({
  mixins: [ LinkedStateMixin ],

  getInitialState: function() {
    return { name: this.props.name };
  },

  onClickClose: function() {
    this.props.onClickClose();
  },

  onClickSave: function() {
    DocumentsStoreActions.update({
      id:   this.props.documentId,
      name: this.state.name
    });

    this.props.onClickSave();
  },

  render: function() {
    var body = React.DOM.div(
      { className: "form-inline new-document-form-group" },
      React.DOM.div(
        { className: "form-group col-md-12" },
        React.DOM.label({ className: "col-md-2" }, "Nazwa"),
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
          onClick:   this.onClickSave
        },
        "Zapisz"
      )
    );

    return Modal({
      title:        "Zmień nazwę dokumentu",
      body:         body,
      footer:       footer,
      onClickClose: this.onClickClose
    });
  }
});

var DocumentDeleteModal = CreateClass({
  onClickClose: function() {
    this.props.onClickClose();
  },

  onClickDelete: function() {
    DocumentsStoreActions.remove({
      id: this.props.documentId
    });

    this.props.onClickDelete();
  },

  render: function() {
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
          className: "btn btn-danger col-md-5 col-md-offset-2",
          onClick:   this.onClickDelete
        },
        "Usuń"
      )
    );

    return Modal({
      title:        "Na pewno usunąć dokument \"" + this.props.name + "\"?",
      footer:       footer,
      onClickClose: this.onClickClose
    });
  }
});

var DocumentRow = CreateClass({
  getInitialState: function() {
    return { modal: null };
  },

  onClickCloseModal: function() {
    this.setState({ modal: null });
  },

  onClickRename: function() {
    var modal = DocumentRenameModal({
      documentId:   this.props.document.id,
      name:         this.props.document.name,
      onClickSave:  this.onClickCloseModal,
      onClickClose: this.onClickCloseModal
    });

    this.setState({ modal: modal });
  },

  onClickDelete: function() {
    var modal = DocumentDeleteModal({
      documentId:    this.props.document.id,
      name:          this.props.document.name,
      onClickDelete: this.onClickCloseModal,
      onClickClose:  this.onClickCloseModal
    });

    this.setState({ modal: modal });
  },

  render: function() {
    var document = this.props.document;

    var deleteButton = React.DOM.span({ className: "btn btn-xs btn-default", onClick: this.onClickDelete }, "✕");
    var renameButton = React.DOM.span({ className: "btn btn-xs btn-default", onClick: this.onClickRename }, "✎");

    return React.DOM.div(
      { className: "list-group-item" },
      Link({ to: "document", params: { id: document.id } }, document.name),
      React.DOM.div({ className: "document-edit-buttons btn-group" }, renameButton, deleteButton),
      CSSTransitionGroup(
        { transitionName: "fade" },
        this.state.modal ? React.DOM.div({ key: "modal" }, this.state.modal) : null
      )
    );
  }
});

var DocumentList = React.createClass({
  mixins: [ Reflux.connect(DocumentsStore, "data") ],

  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return { modal: null };
  },

  componentDidMount: function() {
    DocumentsStoreActions.load();
  },

  onClickCloseModal: function() {
    this.setState({ modal: null });
  },

  onClickAddDocument: function() {
    this.setState({ modal: null });
  },

  onClickNew: function() {
    var modal = DocumentNewModal({
      onClickClose: this.onClickCloseModal,
      onClickAdd:   this.onClickAddDocument
    });

    this.setState({ modal: modal });
  },

  render: function() {
    return React.DOM.div(
      { className: "document-list col-md-4 col-md-offset-4" },
      React.DOM.div(
        { className: "list-group" },
        this.state.data.map(function(document, index) {
          return DocumentRow({ key: index, document: document });
        }.bind(this))
      ),
      React.DOM.div(
        { className: "btn btn-primary col-md-12", onClick: this.onClickNew },
        "Nowy dokument"
      ),
      CSSTransitionGroup(
        { transitionName: "fade" },
        this.state.modal ? React.DOM.div({ key: "modal" }, this.state.modal) : null
      )
    );
  }
});

module.exports = DocumentList;
