import React, { Component } from 'react';
import axios from 'axios';
import { Address, Blockie, Scaler } from "dapparatus";
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components'
import Loader from '../loader.gif';

const Tab = styled.button`
border-radius: 6px;
padding: 5px 12px;
margin-right: 10px;
&.is-active {
  color: #fff;
  background-color: #5396fd;
  border-color: #5396fd;
}
`
const PreviewBox = styled.div`
padding: 10px 20px;
min-height: 550px;
background: rgba(0,0,0,0.2);
`

class CreateGrants extends Component {
  constructor(props) {
    super(props);
    this.state = {
      descriptionPreview: false
    }
  }
  componentDidMount() {
    this.getDetails();
  }
  getDetails = async () => {
    try {
      let id = this.props.match.params.id
      if(id){
        const response = await axios.get(this.props.backendUrl+`grants/`+id);
        console.log("RESPONSE DATA:",response.data)
        if(response.data&&response.data[0]){
          this.props.save(response.data[0])
          if(this.props.web3){
            let tokenContract = this.props.customContractLoader("Subscription",response.data[0].deployedAddress)
            this.props.save({author:await tokenContract.author().call(),contract:tokenContract,toAddress:await tokenContract.requiredToAddress().call()})
          }
        }
      }else{
        console.log("THIS IS A FRESH CREATE, CLEAR THE DATA")
        this.props.save({
          title: "",
          pitch: "",
          toAddress: this.props.account,
          deployedAddress: "",
          desc: "",
          monthlyGoal: "",
          grantDuration: "",
          contactName: "",
          contactEmail: ""
        })
      }
    } catch (error) {
      this.setState(() => ({ error }))
    }
  }

  togglePreview = (mode) => {
    if (mode && mode === 'preview') {
      this.setState(() => ({ descriptionPreview: true }));
    } else {
      this.setState(() => ({ descriptionPreview: false }));
    }
  }

  render() {
    const input = '# This is a header\n\nAnd this is a paragraph'
    let recipient
    let deployedContract
    if(this.props.deployedAddress){
      deployedContract = (
        <div style={{padding:10}}>
          <Address
            {...this.props}
            address={this.props.deployedAddress.toLowerCase()}
          />
        </div>
      )
      recipient = (
        <div style={{padding:10}}>
          <Address
            {...this.props}
            address={this.props.toAddress.toLowerCase()}
          />
        </div>
      )
    }else{
      let loader = ""
      if(this.props.deployingGrantContract){
       loader = (
         <img src={Loader} style={{width: '50px', height: '50px', verticalAlign: 'middle', margin:'0 0 0 10px'}}/>
       )
      }
      deployedContract = (
        <div>
          <button className="btn btn-outline-primary" onClick={()=>{
              this.props.deployGrantContract(this.props.toAddress)
          }}>
            Deploy Grant Contract
          </button> {loader}
        </div>
      )
      recipient = (
        <div className="field-body flex-row">
          <Blockie
            address={this.props.toAddress.toLowerCase()}
            config={{size:3}}
          />
          <div className="ml-md-3 w-100">
            <input type="text" name="toAddress" value={this.props.toAddress} onChange={this.props.handleInput} />
            <p className="help">The address that will receive the funding tokens.</p>
          </div>
        </div>
      )
    }

    let descriptionContent;

    if (this.state.descriptionPreview === true) {
      descriptionContent = <PreviewBox><ReactMarkdown source={this.props.desc} /></PreviewBox>
    } else {
      descriptionContent = <div><textarea className="form-control" rows="20" name="desc" value={this.props.desc} onChange={this.props.handleInput}></textarea></div>
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
              <input className="form-control" type="text" name="title" value={this.props.title} onChange={this.props.handleInput} />
            </div>
          </div>

          <div className="field is-horizontal">
            <div className="field-label">
              <label className="label">Pitch:</label>
            </div>
            <div className="field-body">
              <textarea className="form-control" rows="3" name="pitch" value={this.props.pitch} onChange={this.props.handleInput}></textarea>
              <p className="help">Your short elevator pitch.</p>
            </div>
          </div>

          <div className="field is-horizontal">
            <div className="field-label">
              <label className="label">Recipient:</label>
            </div>
            <div className="field-body">
              {recipient}
            </div>
          </div>

          <div className="field is-horizontal">
            <div className="field-label">
              <label className="label">Contract:</label>
            </div>
            <div className="field-body">
              <div className="mb-2">
                {deployedContract}
              </div>
              <p className="help">Deploy the grant contract.</p>
            </div>
          </div>

          <div className="field is-horizontal">
            <div className="field-label">
              <label className="label">Description:</label>
              <p><small>(Markdown)</small></p>
            </div>
            <div className="field-body">
              <div className="mb-3">
                <Tab
                  className={`btn btn-sm btn-outline-primary ${this.state.descriptionPreview ? '' : 'is-active'}`}
                  onClick={this.togglePreview}>
                  Edit Mode
                </Tab>
                <Tab
                  className={`btn btn-sm btn-outline-primary ${this.state.descriptionPreview ? 'is-active' : ''}`}
                  onClick={() => {this.togglePreview('preview')}}>
                  Preview Mode
                </Tab>
              </div>

              {descriptionContent}

              <p className="help">A longer, more detailed description can be written in Markdown.</p>
            </div>
          </div>

          <div className="field is-horizontal">
            <div className="field-label">
              <label className="label">Monthly Goal:</label>
            </div>
            <div className="field-body">
              <input className="form-control" style={{width:400}} type="text" name="monthlyGoal" value={this.props.monthlyGoal} onChange={this.props.handleInput} />
              <p className="help">Amount in (USD) you would like to receive each month.</p>
            </div>
          </div>

          <div className="field is-horizontal">
            <div className="field-label">
              <label className="label">Grant Duration:</label>
            </div>
            <div className="field-body">
              <input className="form-control" style={{width:400}} type="text" name="grantDuration" value={this.props.grantDuration} onChange={this.props.handleInput} />
              <p className="help">Expected duration you would like to receive funding.</p>
            </div>
          </div>

          <div className="field is-horizontal">
            <div className="field-label">
              <label className="label">Contact Name:</label>
            </div>
            <div className="field-body">
              <input className="form-control" type="text" style={{width:400}} name="contactName" value={this.props.contactName} onChange={this.props.handleInput} />
              <p className="help">Your full name.</p>
            </div>
          </div>

          <div className="field is-horizontal">
            <div className="field-label">
              <label className="label">Contact Email:</label>
            </div>
            <div className="field-body">
              <input className="form-control" type="text" style={{width:400}} name="contactEmail" value={this.props.contactEmail} onChange={this.props.handleInput} />
              <p className="help">A valid email address.</p>
            </div>
          </div>

          <div className="field is-horizontal">
            <div className="field-label">
              <label className="label">Save Grant:</label>
            </div>
            <div className="field-body" style={{paddingBottom:150}}>
              <div className="mb-2">
                <button className="btn btn-lg btn-outline-primary" onClick={async ()=>{
                  if(!this.props.title){
                    alert("Please provide a title for your grant.")
                    return;
                  }
                  if(!this.props.pitch){
                    alert("Please provide a pitch for your grant.")
                    return;
                  }
                  if(!this.props.deployedAddress){
                    alert("Please deploy a contract for your grant.")
                    return;
                  }
                  if(!this.props.desc){
                    alert("Please provide a description for your grant.")
                    return;
                  }

                  let hash = this.props.web3.utils.soliditySha3(
                    this.props.title,
                    this.props.pitch,
                    this.props.deployedAddress,
                    this.props.desc,
                    this.props.monthlyGoal,
                    this.props.grantDuration,
                    this.props.contactName,
                    this.props.contactEmail,
                  )
                  console.log("Hash:",hash)
                  let sig = await this.props.web3.eth.personal.sign(""+hash,this.props.account)
                  console.log("Sig:",sig)
                  this.props.submitGrant(hash,sig)

                }}>
                  Save Grant
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    );
  }
}

export default CreateGrants;
