/**
 * @jsx React.DOM
 */

var React = require('react')
  , Button = require('react-bootstrap/Button')
  , buttonGroup = require('react-bootstrap/ButtonGroup')
  , RW = require('../../../index')
  , SelectList = RW.SelectList
  , NumberPicker = RW.NumberPicker;

var valueComp = React.createClass({
  render: function() {
    return (<span><i className='fa fa-comment'></i>{ '  ' + this.props.item.label }</span>)
  }
});

var itemComp = React.createClass({
  render: function() {
    var icons =  ['bicycle', 'area-chart', 'anchor']

    this._icon || (this._icon = icons[_.random(0, 2)])
    return (
      <div>
        <i className={'fa fa-' + this._icon}></i>
        { '  ' + this.props.item.label}
      </div>
    );
  }
});


var DropdownApi = React.createClass({

  getInitialState: function(){

    return {
      duration: 250,
    }
  },

  render: function() {
    var disabled = this.state.disabled === true || _.isArray(this.state.disabled);
    var list = [
        { label: 'orange', id: 1 },
        { label: 'blue', id: 2 },
        { label: 'red', id: 3 },
        { label: 'maroon', id: 4 },
        { label: 'purple', id: 5 },
        { label: 'mauve', id: 6 },
      ];

    return (
      <div className='example'>
        <div className='row'>
          <div className='col-sm-8 demo'>
            <div className='form-group'>
              <SelectList 
                disabled={disabled ? this.state.disabled : false}
                readOnly={this.state.disabled === 'readonly'}
                value={this.state.value || 1}
                data={list}
                busy={this.state.multiple}
                busy={this.state.busy}
                onChange={this._change}
                isRtl={this.state.isRtl}
                valueField='id'
                textField='label'
                />
            </div>
          </div>
          <div className='col-sm-4 api-panel'>
            <div className='form-group'>
              <label className='checkbox-inline'>
                <input type='checkbox'
                  checked={this.state.isRtl}
                  onChange={_.partial(this._set, 'isRtl', !this.state.isRtl)}/>
                  Right to Left
              </label>
            </div>
            <div className='form-group'>
              <label className='checkbox-inline'>
                <input type='checkbox'
                  checked={this.state.multiple}
                  onChange={_.partial(this._set, 'multiple', !this.state.multiple)}/>
                  Is Multiple
              </label>
            </div>
            <div className='form-group'>
              <buttonGroup>
                <Button
                  active={this.state.disabled === 'disabled'}
                  onClick={this.disabled}>
                  Disable
                </Button>
                <Button
                  active={this.state.disabled === 'readonly'}
                  onClick={this.readOnly}>
                  Readonly
                </Button>
              </buttonGroup>
              <Button style={{ marginLeft: 10 }}
                active={this.state.busy}
                onClick={_.partial(this._set, 'busy', !this.state.busy)}>
                Busy
              </Button>
            </div>
            <div className='form-group'>
              <label className='form-label'>Disable Values</label>
              <RW.Select 
                  value={ _.isArray(this.state.disabled) ? this.state.disabled : [] } 
                  data={allVals}
                  textField='label'
                  valueField='id'
                  disabled={this.state.disabled === true}
                  messages={{ emptyList: "no values selected to the right"}}
                  onChange={_.partial(this._set, 'disabled')}/>
            </div>
          </div>
        </div>
      </div>
    );
  },

  _change: function(val){
    this.setState({ value: val })
  },

  _set: function(field, value){
    var obj = {}
    obj[field] = value
    this.setState(obj)
  },

  readOnly: function(){
    var val = this.state.disabled === 'readonly' ? false : 'readonly'
    this.setState({ disabled: val })
  },

  disabled: function(){
    var val = this.state.disabled === true ? false : true
    this.setState({ disabled: val })
  }
});

module.exports = DropdownApi;

