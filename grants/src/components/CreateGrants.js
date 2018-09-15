import React, { Component } from 'react';
import { Address, Blockie, Scaler } from "dapparatus"

class CreateGrants extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  handleInput(e,data){
    console.log("INPUT",e,data)
    let update = {}
    update[e.target.name] = e.target.value
    this.setState(update)
  }
  componentDidMount() {

  }
  render() {
    return (
      <div className="container">
        <h1>Create Grant</h1>

        <div className="form-field">
          Title:
          <input type="text" style={{width:650,fontWeight:'bold'}} name="title" value={this.state.title} onChange={this.handleInput.bind(this)} />
        </div>

        <div className="form-field">
        Pitch:
        <textarea style={{width:650,height:180}}  name="pitch" value={this.state.pitch} onChange={this.handleInput.bind(this)}></textarea>
        </div>

        <div className="form-field">
        Contract:
        <button size="2" style={{marginTop:50}} onClick={()=>{
            //this.props.deployGrant(toAddress,tokenAddress,tokenAmount,timeType,timeAmount,gasPrice,email)
          }}>
          Deploy Grant Contract
        </button>
        </div>

        <div className="form-field">
        Description:
        <textarea style={{width:650,height:580}}  name="desc" value={this.state.desc} onChange={this.handleInput.bind(this)}></textarea>
        </div>

        <button size="2" style={{marginTop:50}} onClick={()=>{
            //this.props.deployGrant(toAddress,tokenAddress,tokenAmount,timeType,timeAmount,gasPrice,email)
          }}>
          Save
        </button>


        <div style={{marginTop:90,cursor:"pointer"}} onClick={()=>{
        //  let hash = soliditySha3
        //  let signature = await web3.eth.personal.sign(""+subscriptionHash,account)
        }}>
        </div>
      </div>
    );
  }
}

export default CreateGrants;