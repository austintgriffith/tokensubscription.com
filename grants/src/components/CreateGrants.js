import React, { Component } from 'react';
import { Address, Blockie, Scaler } from "dapparatus";
import ReactMarkdown from 'react-markdown';

class CreateGrants extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      pitch: '',
      desc: '# This is a preview'
    };
    this.handleInput = this.handleInput.bind(this);
  }
  handleInput(e){
    let update = {}
    let value = e.target.value
    if(e.target.name=="title") value = value.substring(0,82) //limit title characters
    if(e.target.name=="pitch") value = value.substring(0,230) //limit pitch characters
    update[e.target.name] = value
    this.setState(update)
  }
  componentDidMount() {

  }
  render() {

    const input = '# This is a header\n\nAnd this is a paragraph'

    return (
      <div className="container">
        <h1 className="mb-5 text-center">Create A Grant</h1>

        <div>
          <div class="field is-horizontal">
            <div class="field-label">
              <label class="label">Title:</label>
            </div>
            <div class="field-body">
              <input className="form-control" type="text" name="title" value={this.state.title} onChange={this.handleInput} />
            </div>
          </div>

          <div class="field is-horizontal">
            <div class="field-label">
              <label class="label">Pitch:</label>
            </div>
            <div class="field-body">
              <textarea className="form-control" rows="3" name="pitch" value={this.state.pitch} onChange={this.handleInput}></textarea>
            </div>
          </div>

          <div class="field is-horizontal">
            <div class="field-label">
              <label class="label">Contract:</label>
            </div>
            <div class="field-body">
              <button className="btn btn-outline-primary" onClick={()=>{
                  //this.props.deployGrant(toAddress,tokenAddress,tokenAmount,timeType,timeAmount,gasPrice,email)
              }}>
                Deploy Grant Contract
              </button>
            </div>
          </div>


          <div class="field is-horizontal">
            <div class="field-label">
              <label class="label">Description:</label>
              <p><small>(Markdown)</small></p>
            </div>
            <div class="field-body">
              <textarea className="form-control" rows="20" name="desc" value={this.state.desc} onChange={this.handleInput}></textarea>
            </div>
          </div>

          <div class="field is-horizontal">
            <div class="field-label">
              <label class="label">Preview:</label>
            </div>
            <div class="field-body">
              <ReactMarkdown source={this.state.desc} />
            </div>
          </div>


          <div class="field is-horizontal">
            <div class="field-label">
            </div>
            <div class="field-body">
              <button className="btn btn-outline-primary" onClick={()=>{
                //this.props.deployGrant(toAddress,tokenAddress,tokenAmount,timeType,timeAmount,gasPrice,email)
              }}>
                Save
              </button>
            </div>
          </div>

          <button className="btn btn-outline-primary" onClick={()=>{
          //  let hash = soliditySha3
          //  let signature = await web3.eth.personal.sign(""+subscriptionHash,account)
          }}>
            Some Action
          </button>
        </div>

      </div>
    );
  }
}

export default CreateGrants;
