var React           = require("react");
var PureRenderMixin = require("react/addons").PureRenderMixin;
var classNames      = require("classnames");

var Selection = React.createClass({
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
      var value = this.props.valueGetter(this.props.data[0]);
      this.onChange({ target: { value: value } });
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

module.exports = Selection;
