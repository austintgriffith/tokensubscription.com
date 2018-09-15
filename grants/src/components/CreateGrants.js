import React, { Component } from 'react';
import { Address, Blockie, Scaler } from "dapparatus";
import ReactMarkdown from 'react-markdown';
import Loader from '../loader.gif';

class CreateGrants extends Component {
  constructor(props) {
    super(props);
    this.changeInput = this.changeInput.bind(this);
  }

  changeInput(e) {
    this.props.handleInput(e);
  }

  render() {

    console.log(this.props)

    const input = '# This is a header\n\nAnd this is a paragraph'

    let deployedContract
    if(this.props.deployedAddress){
      deployedContract = (
        <Address
          {...this.props}
          address={this.props.deployedAddress.toLowerCase()}
        />
      )
    }else{

      let loader = ""
      //if(this.state.deployingGrantContract){
      //  loader = (
      //    <img src={Loader} style={{width: '50px', height: '50px', verticalAlign: 'middle', margin:'0 0 0 10px'}}/>
      //  )
      //}

      deployedContract = (
        <div>
          <button className="btn btn-outline-primary" onClick={()=>{
              this.props.deploySubscription()
          }}>
            Deploy Grant Contract
          </button> {loader}
        </div>
      )
    }

    return (
      <div className="container">
        <h1 className="mb-5 text-center">Create A Grant</h1>

        <div>
          <div className="field is-horizontal">
            <div className="field-label">
              <label className="label">Title:</label>
            </div>
            <div className="field-body">
              <input className="form-control" type="text" name="title" value={this.props.title} onChange={this.changeInput} />
            </div>
          </div>

          <div className="field is-horizontal">
            <div className="field-label">
              <label className="label">Pitch:</label>
            </div>
            <div className="field-body">
              <textarea className="form-control" rows="3" name="pitch" value={this.props.pitch} onChange={this.changeInput}></textarea>
            </div>
          </div>

          <div className="field is-horizontal">
            <div className="field-label">
              <label className="label">Contract:</label>
            </div>
            <div className="field-body">
              <button className="btn btn-outline-primary" onClick={()=>{
                  this.props.deploySubscription()
              }}>
                Deploy Grant Contract
              </button>
            </div>
          </div>


          <div className="field is-horizontal">
            <div className="field-label">
              <label className="label">Description:</label>
              <p><small>(Markdown)</small></p>
            </div>
            <div className="field-body">
              <textarea className="form-control" rows="20" name="desc" value={this.props.desc} onChange={this.changeInput}></textarea>
            </div>
          </div>

          <div className="field is-horizontal">
            <div className="field-label">
              <label className="label">Preview:</label>
            </div>
            <div className="field-body">
              <ReactMarkdown source={this.props.desc} />
            </div>
          </div>


          <div className="field is-horizontal">
            <div className="field-label">
            </div>
            <div className="field-body">
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
