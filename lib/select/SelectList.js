/**
 * @jsx React.DOM
 */

var React = require('react')
  , _  = require('lodash')
  , cx = require('../util/cx')
  , $  =  require('../util/dom')
  , scrollTo = require('../util/scroll')
  , splat = require('../util/splat')
  , controlledInput  = require('../util/controlledInput')
  , mergeIntoProps = require('../util/transferProps').mergeIntoProps;

var propTypes = {
    data:          React.PropTypes.array,
    value:         React.PropTypes.oneOfType([
                    React.PropTypes.any,
                    React.PropTypes.array
                   ]),
    onChange:      React.PropTypes.func,

    multiple:      React.PropTypes.bool,
    itemComponent: React.PropTypes.component,
    
    valueField:    React.PropTypes.string,
    textField:     React.PropTypes.string,

    busy:           React.PropTypes.bool,

    delay:          React.PropTypes.number, 

    disabled:       React.PropTypes.oneOfType([
                        React.PropTypes.array,
                        React.PropTypes.bool,
                        React.PropTypes.oneOf(['disabled'])
                      ]),

    readOnly:       React.PropTypes.oneOfType([
                      React.PropTypes.bool,
                      React.PropTypes.array,
                      React.PropTypes.oneOf(['readonly'])
                    ]),

    messages:      React.PropTypes.shape({
      emptyList:   React.PropTypes.string
    }),
  }


var CheckboxList = React.createClass({displayName: 'CheckboxList',

  propTypes: propTypes,

  mixins: [
    require('../mixins/WidgetMixin'),
    require('../mixins/TextSearchMixin'),
    require('../mixins/DataHelpersMixin'),
    require('../mixins/RtlParentContextMixin'),
    require('../mixins/DataIndexStateMixin')('focusedIndex', 'isDisabledItem')
  ],

  getDefaultProps: function(){
    return {
      delay: 250,
      value: [],
      data:  [],
      messages: {
        emptyList: 'There are no items in this list'
      }
    }
  },

  getDefaultState: function(props){
    var isRadio = !props.multiple
      , values  = splat(props.value)
      , idx     = isRadio && this._dataIndexOf(props.data, values[0]) 

    idx = isRadio && idx !== -1 
      ? this.nextFocusedIndex(idx - 1) 
      : ((this.state || {}).focusedIndex || -1)

    return {
      focusedIndex: idx,
      dataItems:    !isRadio && _.map(values,  function(item)  {return this._dataItem(props.data, item);}.bind(this))
    }
  },

  getInitialState: function(){
    return this.getDefaultState(this.props)
  },

  componentWillReceiveProps: function(nextProps) {
    return this.setState(this.getDefaultState(nextProps))
  },

  componentDidUpdate: function(prevProps, prevState){
    if ( prevState.focusedIndex !== this.state.focusedIndex)
      this._setScrollPosition()
  },

  render: function() {
    var focus = this._maybeHandle(_.partial(this._focus, true), true)
      , optID = this._id('_selected_option')
      , blur  = _.partial(this._focus, false);

    return mergeIntoProps(
      _.omit(this.props, _.keys(propTypes)),
      React.DOM.div({
        onKeyDown: this._maybeHandle(this._keyDown), 
        onFocus: focus, 
        onBlur: blur, 
        tabIndex: "0", 
        role: "listbox", 
        'aria-busy': !!this.props.busy, 
        'aria-activedescendent':  this.state.focused ? optID : undefined, 
        'aria-disabled':  this.isDisabled(), 
        'aria-readonly':  this.isReadOnly(), 
        className: cx({ 
          'rw-widget':         true,
          'rw-checkboxlist':   true,
          'rw-state-focus':    this.state.focused,
          'rw-state-disabled': this.isDisabled(),
          'rw-state-readonly': this.isReadOnly(),
          'rw-rtl':            this.isRtl(),
          'rw-loading-mask':   this.props.busy
        })}, 

        React.DOM.ul({className: "rw-list", ref: "list"},  this._rows(optID))
      ) 
    );
  },

  _rows: function(optID){
    var component = this.props.itemComponent
      , name = this._id('_name')
      , type = this.props.multiple ? 'checkbox' : 'radio';

    return _.map(this._data(), function(item, idx){
      var focused  = this.state.focused && this.state.focusedIndex === idx
        , text     = this._dataText(item)
        , checked  = this._contains(item, this._values())
        , change   = _.partial(this._change, item)
        , disabled = this.isDisabledItem(item)
        , readonly = this.isReadOnlyItem(item);

      return (React.DOM.li({
        key: 'item_' + idx, 
        role: "option", 
        id:  focused ? optID : undefined, 
        className: cx({ 'rw-state-focus': focused, 'rw-selectlist-item': true })}, 
        SelectListItem({type: type, name: name, onChange: change, 
          checked: checked, 
          readOnly: readonly, 
          disabled: disabled || readonly}, 
           component && component({ item: item }) || text
        )
      ))
    }, this)
  },

  _keyDown: function(e){
    var self = this
      , key = e.key
      , data = this._data()
      , multiple = !!this.props.multiple
      , last = data.length;

    if ( key === 'End' ) {
      e.preventDefault()

      if ( multiple ) this.setFocusedIndex(this.prevFocusedIndex(last))
      else            change(this.prevFocusedIndex(last)) 
    }
    else if ( key === 'Home' ) {
      e.preventDefault()

      if ( multiple ) this.setFocusedIndex(this.nextFocusedIndex(-1))
      else            change(this.nextFocusedIndex(-1)) 
    }
    else if ( key === 'Enter' || key === ' ' ) {
      e.preventDefault()
      change(data[this.state.focusedIndex])
    }
    else if ( key === 'ArrowDown' || key === 'ArrowRight' ) {
      e.preventDefault()

      if ( multiple ) this.setFocusedIndex(this.nextFocusedIndex())
      else            change(this.nextFocusedIndex())
    }
    else if ( key === 'ArrowUp' || key === 'A rrowLeft'  ) {
      e.preventDefault()

      if ( multiple ) this.setFocusedIndex(this.prevFocusedIndex())
      else            change(this.prevFocusedIndex())
    }
    else if (this.props.multiple && e.keyCode === 65 && e.ctrlKey ) {
      e.preventDefault()
      this._selectAll() 
    }
    else
      this.search(
          String.fromCharCode(e.keyCode)
        , this._locate)

    function change(idx, cked){
      var item = data[idx];
      
      if( idx > -1 && idx < last){
        self._change(item, cked !== undefined 
          ? chked
          : multiple 
            ? !self._contains(item, self._values()) // toggle value
            : true)
      }
        
    }
  },

  _selectAll: function(){
    var values = this.state.dataItems
      , disabled = this.props.disabled || this.props.readOnly
      , data = this._data()
      , blacklist;

    disabled = _.isArray(disabled) ? disabled : [];
    //disabled values that are not selected
    blacklist = _.reject(disabled, function(v)  {return this._contains(v, values);}.bind(this))
    data      = _.reject(data,     function(v)  {return this._contains(v, blacklist);}.bind(this))

    if ( data.length === values.length) {
      data = _.filter(disabled,    function(v)  {return this._contains(v, values);}.bind(this))
      data = _.map(data,           function(v)  {return this._dataItem(this._data(), v);}.bind(this))
    }

    this.notify('onChange', [data])
  },

  _change: function(item, checked){
    var multiple  = !!this.props.multiple
      , blacklist = this.props.disabled || this.props.readOnly 
      , values    = this.state.dataItems;

    blacklist = _.isArray(blacklist) ? blacklist : [];

    if(this._contains(item, blacklist)) return 

    if ( !multiple )
      return this.notify('onChange', checked ? item : null)

    values = checked 
      ? values.concat(item)
      : _.without(values, item)

    this._allSelected = false
    this.notify('onChange', [values || []])
  },

  _focus: function(focused, e){
    var self = this;

    clearTimeout(self.timer)

    self.timer = setTimeout(function(){
      if( focused) self.getDOMNode().focus()
      if( focused !== self.state.focused){
        self.setState({ focused: focused })
        //!focused && self.next(0)
      }
    }, 0)
  },

  isDisabledItem: function(item) {
    return this.isDisabled() || this._contains(item, this.props.disabled)
  },

  isReadOnlyItem: function(item) {
    return this.isReadOnly() || this._contains(item, this.props.readOnly)
  },

  _locate: function(word){
    var idx = this.findNextWordIndex(word, this.state.focusedIndex);

    if ( idx !== -1) 
      this.setFocusedIndex(idx)
  },

  _data:function(){
    return this.props.data
  },

  _contains: function(item, values){
    return _.isArray(values) 
      ? _.any(values, _.partial(this._valueMatcher, item))
      : this._valueMatcher(item, values)
  },

  _values: function(){
    return !!this.props.multiple 
      ? this.state.dataItems
      : this.props.value
  },

  _setScrollPosition: function(){
    var list = this.refs.list.getDOMNode()
      , selected = list.children[this.state.focusedIndex]
      , handler  = this.props.onMove || scrollTo;

    handler(selected)
  }

});

var SelectListItem = React.createClass({displayName: 'SelectListItem',

  render: function() {
    var props = this.props;

    return (
      React.DOM.label({className: cx({ 
          'rw-state-disabled': props.disabled,
          'rw-state-readonly': props.readOnly
        })}, 
         mergeIntoProps(props, 
          React.DOM.input({tabIndex: "-1", onChange: change, 
            disabled: props.disabled ||props.readOnly, 
            'aria-disabled':  props.disabled ||props.readOnly})), 
        
         this.props.children
      )
    );

    function change(e){
      if( !props.disabled && !props.readOnly)
        props.onChange(e.target.checked)
    }
  },

})

module.exports = CheckboxList;