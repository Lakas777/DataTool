var React       = require("react");
var CreateClass = require("./addons/react").CreateClass;

var FileEdit = CreateClass({
  render: function() {
    return React.DOM.div(
      { className: "file-edit" },
      [
        "name " + this.props.data.name,
        "url " + this.props.data.url,
        "delimiter " + this.props.data.delimiter
      ].map(function(text, i) {
        return React.DOM.div({ key: i }, text);
      })
    );
  }
});

var FileEditWrapper = React.createClass({
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

    this.props.api.getFile(params.id, function(data) {
      this.setState({ data: data });
    }.bind(this));
  },

  render: function() {
    return FileEdit({ data: this.state.data, getData: this.getData });
  }
});

module.exports = FileEditWrapper;
