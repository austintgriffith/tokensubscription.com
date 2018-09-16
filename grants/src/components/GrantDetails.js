import React, { Component } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Address, Blockie, Scaler } from "dapparatus";
import { Dropdown } from 'semantic-ui-react'
import styled from 'styled-components';

const AddressBox = styled.div`
display: block;
padding: 1rem;
margin-bottom: 1rem;
background: rgba(0,0,0,0.6);
font-size: 14px;
> p {
  margin-bottom: 5px;
}
`

let monthOptions = [
    {key: 'ongoing', value: 'ongoing', text: 'Ongoing'},
    {key: 'months', value: 'months', text: 'Month(s)'},
    {key: 'weeks', value: 'weeks', text: 'Weeks(s)'},
]


export default class GrantDetails extends Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
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
      }
    } catch (error) {
      this.setState(() => ({ error }))
    }
  }

  render() {
    const { error } = this.state;

    if (error) {
      return <div className="container">{error.message}</div>;
    } else if (!this.props.author || !this.props.deployedAddress) {
      return <div className="container">Loading...</div>;
    } else {

      let editButton  =  ""
      if(this.props.account && this.props.author && this.props.author.toLowerCase()==this.props.account.toLowerCase()){
        editButton = <button className="btn btn-outline-primary" onClick={()=>{
          window.location = "/create/"+this.props.match.params.id
        }}>
          Edit Grant
        </button>
      }

      let funding = ""
      if(this.props.web3&&this.props.author){
        let {handleInput,coins,contract,items,tokenName,tokenAmount,tokenAddress,timeType,timeAmount,gasPrice,prefilledParams,email,requiredTokenAddress} = this.props
        console.log("timeType:",timeType)

        //hardcode toaddress to this.state.author for now but you need to add recipeint
        let toAddress = this.state.author

        let coinOptions = []
        let currentTokenName = "Tokens"
        for(let i = 0; i < this.props.coins.length; i++){
          if(this.props.coins[i].address==tokenAddress)
          {
            currentTokenName=this.props.coins[i].name
          }
          coinOptions.push({
             key: this.props.coins[i].address,
             value: this.props.coins[i].address,
             image:{
               avatar : true,
               src    : this.props.coins[i].imageUrl,
             },
             text: this.props.coins[i].symbol
           })
        }



        funding = (
          <div style={{padding:20,background:"rgba(0,0,0,0.6)"}}>
            <h3 className="mb-4 text-center">Fund This Grant:</h3>

            <div className="field is-horizontal">
              <div className="field-label">
                <label className="label">Token:</label>
              </div>
              <div className="field-body">
                <Dropdown
                  selectOnNavigation={false}
                  selection
                  value={tokenAddress}
                  name='tokenAddress'
                  options={coinOptions}
                  placeholder='Choose Token'
                  onChange={handleInput}
                />
              </div>
            </div>

            <div className="field is-horizontal">
              <div className="field-label">
                <label className="label">Amount:</label>
              </div>
              <div className="field-body">
                <input type="text" className="form-control"  name="tokenAmount" value={tokenAmount} onChange={handleInput} />
              </div>
            </div>

            <div className="field is-horizontal">
              <div className="field-label">
                <label className="label">Gas Price:</label>
              </div>
              <div className="field-body">
                <input
                  type="text" className="form-control"  name="gasPrice" value={gasPrice} onChange={handleInput}
                />
                <p className="help">({currentTokenName})</p>
              </div>
            </div>

            <div className="field is-horizontal mb-3">
              <div className="field-label">
                <label className="label">Email:</label>
              </div>
              <div className="field-body">
                <input
                  type="text" className="form-control"  name="email" value={email} onChange={handleInput}
                />
                <p className="help">(optional)</p>
              </div>
            </div>
            <div className="text-right">
              <button onClick={()=>{
                  this.props.sendSubscription()
                }}>
                Sign
              </button>
            </div>
          </div>
        )
      }

      return (
        <div className="container-fluid">

          <div className="mb-4">
            {editButton}
          </div>

          <div className="row">
            <div className="col-md-7">

              <div style={{padding: 20}}>

                <h1 className="mb-4">{this.props.title}</h1>
                <h3 className="mb-4">{this.props.pitch}</h3>

                <hr />

                <div>
                  <ReactMarkdown source={this.props.desc} />
                </div>

                <hr />

                <AddressBox>
                  <p>Grant Recipeint Address:</p>
                  <Address
                    {...this.props}
                    address={this.props.toAddress.toLowerCase()}
                  />
                </AddressBox>

                <AddressBox>
                  <p>Grant Contract Address:</p>
                  <Address
                    {...this.props}
                    address={this.props.deployedAddress.toLowerCase()}
                  />
                </AddressBox>

                <AddressBox>
                  <p>Grant Author Address:</p>
                  <Address
                    {...this.props}
                    address={this.props.author.toLowerCase()}
                  />
                </AddressBox>

              </div>

            </div>
            <div className="col-md-5">
              {funding}
            </div>
          </div>

        </div>
      )
    }
  }
}
