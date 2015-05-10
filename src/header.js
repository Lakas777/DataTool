var React              = require("react");
var LinkedStateMixin   = require("react/addons").addons.LinkedStateMixin;
var Link               = React.createFactory(require("react-router").Link);

var CreateClass        = require("./addons/create-class");
var CSSTransitionGroup = require("./addons/css-transition-group");
var Modal              = React.createFactory(require("./modal"));

var Config             = require("./config");

var GenerateIframeModal = CreateClass({
  mixins: [ LinkedStateMixin ],

  getInitialState: function() {
    return {
      iframeWidth:  640,
      iframeHeight: 480,
      documentId:   this.props.documentId
    };
  },

  onClickClose: function() {
    this.props.onClickClose();
  },

  generateIframeString: function() {
    var iframeHtml = "";

    iframeHtml += "<iframe src=\"";
    iframeHtml += Config.domainURL;
    iframeHtml += "/front_app/iframe?id=";
    iframeHtml += this.state.documentId;
    iframeHtml += "\"";
    iframeHtml += " width=\"" + this.state.iframeWidth + "\"";
    iframeHtml += " height=\"" + this.state.iframeHeight + "\"";
    iframeHtml += " frameBorder=\"0\"";
    iframeHtml += "></iframe>";

    return iframeHtml;
  },

  renderBody: function() {
    return React.DOM.div(
      { className: "iframe-generate-modal-body form-inline" },
      React.DOM.div(
        { className: "form-group col-md-6" },
        React.DOM.label(null, "Szerokość" ),
        React.DOM.input({ type: "text", className: "form-control", valueLink: this.linkState("iframeWidth") })
      ),
      React.DOM.div(
        { className: "form-group col-md-6" },
        React.DOM.label(null, "Wysokość" ),
        React.DOM.input({ type: "text", className: "form-control", valueLink: this.linkState("iframeHeight") })
      )
    );
  },

  render: function() {
    return Modal({
      title:        "Generowanie iframe",
      body:         this.renderBody(),
      footer:       React.DOM.code({ className: "col-md-8 col-md-offset-2" }, this.generateIframeString()),
      onClickClose: this.onClickClose
    });
  }
});

var Header = React.createClass({
  getInitialState: function() {
    return { modal: null };
  },

  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  onClickCloseModal: function() {
    this.setState({ modal: null });
  },

  onClickGenerateIframe: function() {
    var params = this.context.router.getCurrentParams();

    var modal = GenerateIframeModal({
      documentId:   params.id,
      onClickClose: this.onClickCloseModal
    });

    this.setState({ modal: modal });
  },

  render: function() {
    var route            = this.context.router.getCurrentPath();
    var isInsideDocument = route.match(/\/document\//);
    var menu;

    if (isInsideDocument) {
      menu = React.DOM.li(null, React.DOM.a({ className: "link", onClick: this.onClickGenerateIframe }, "Wygeneruj iframe"));
    }

    return React.DOM.div(
      { className: "header navbar navbar-inverse navbar-fixed-top" },
      React.DOM.div(
        { className: "container" },
        Link({ to: "app", className: "navbar-brand" }, "DataBlog Tool"),
        React.DOM.ul(
          { className: "nav navbar-nav" },
          menu
        )
      ),
      CSSTransitionGroup(
        { transitionName: "fade" },
        this.state.modal ? React.DOM.div({ key: "modal" }, this.state.modal) : null
      )
    );
  }
});

module.exports = Header;
