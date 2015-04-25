var extend               = require("extend");
var React                = require("react");
var CreateClass          = require("./addons/create-class");
var CSSTransitionGroup   = require("./addons/css-transition-group");

var getIn                = require("./lib/insides").getIn;
var indexOfProp          = require("./addons/index-of-prop");

var Reflux               = require("reflux");
var DocumentStoreActions = require("./store").DocumentStoreActions;
var DocumentStore        = require("./store").DocumentStore;

var FileNew              = React.createFactory(require("./file-new"));
var FileTable            = React.createFactory(require("./file-table"));
var Modal                = React.createFactory(require("./modal"));
var Tabs                 = React.createFactory(require("./tabs"));
var Toolbox              = React.createFactory(require("./toolbox"));
var Visualization        = React.createFactory(require("./visualization"));

var LeftView = CreateClass({
  render: function() {
    return React.DOM.div(
      { className: "left" },
      Visualization(),
      Toolbox()
    );
  }
});

var RightView = CreateClass({
  mixins: [ Reflux.connect(DocumentStore, "data") ],

  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return { modal: null };
  },

  componentDidMount: function() {
    var params = this.context.router.getCurrentParams();
    DocumentStoreActions.load({ id: params.id });
  },

  onClickRemoveFile: function(fileId) {
    this.setState({ modal: null });
    DocumentStoreActions.fileRemove({ id: fileId });
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
    var files = getIn(this.state, [ "data", "files" ], []);

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
                key:       "new-file-tab-button",
                name:      "+",
                className: "new-file-tab-button"
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

var DocumentEdit = React.createClass({
  render: function() {
    return React.DOM.div(
      { className: "document-edit" },
      LeftView(),
      RightView()
    );
  }
});

module.exports = DocumentEdit;
