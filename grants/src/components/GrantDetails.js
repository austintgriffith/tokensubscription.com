import React, { Component } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Address, Blockie, Scaler } from "dapparatus";
import { Dropdown } from 'semantic-ui-react'
import styled from 'styled-components';
import Loader from '../loader.gif';

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

let pollInterval
let pollIntervalTime = 3333

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
    console.log("MOUNT!!!!")
    this.props.save({tokenContract:false,subscriptions:false,deployedAddress:""},()=>{
      this.getDetails();
      setTimeout(this.poll.bind(this),333)
      setTimeout(this.poll.bind(this),999)
      pollInterval = setInterval(this.poll.bind(this),pollIntervalTime)
    })
  }

  componentWillUnmount() {
    console.log("UNMOUNT")
    clearInterval(pollInterval)
  }

  async poll(){
    console.log("polling for subscriptions on "+this.props.deployedAddress+"...")
    if(this.props.deployedAddress){
      const response = await axios.get(this.props.backendUrl+`subscriptionsByContract/`+this.props.deployedAddress);
      let subscriptions = response.data
      this.props.save({subscriptions:subscriptions})

      for(let s in subscriptions){

        if(subscriptions[s].parts&&subscriptions[s].parts[0].toLowerCase()==this.props.account.toLowerCase()){
          //console.log("sub "+s+" )))))))))))",subscriptions[s])
          let thisTokenContract
          let thisTokenAddress = subscriptions[s].parts[2]
          let thisTokenDecimals = 18
          if(this.props.tokenContracts && this.props.tokenContracts[thisTokenAddress] && this.props.tokenDecimals[thisTokenAddress]){
            //console.log("CACHED")
            thisTokenContract = this.props.tokenContracts[thisTokenAddress]
            thisTokenDecimals = this.props.tokenDecimals[thisTokenAddress]
          }else{
            thisTokenContract = this.props.customContractLoader("WasteCoin",subscriptions[s].parts[2])
            thisTokenDecimals = await thisTokenContract.decimals().call()
            let tokenContracts = this.props.tokenContracts
            let tokenDecimals = this.props.tokenDecimals
            if(!tokenContracts) tokenContracts={}
            if(!tokenDecimals) tokenDecimals={}
            tokenContracts[thisTokenAddress] = thisTokenContract
            tokenDecimals[thisTokenAddress] = thisTokenDecimals
            this.props.save({tokenContracts,tokenDecimals})
          }

          let tokenBalances = this.props.tokenBalances
          let tokenAllowances = this.props.tokenAllowances

          if(!tokenBalances) tokenBalances={}
          if(!tokenAllowances) tokenAllowances={}
          //console.log("getting token balance ",thisTokenContract)
          let balance = (await thisTokenContract.balanceOf(this.props.account).call()) / 10**thisTokenDecimals
          //console.log(balance)
          let allowance = (await thisTokenContract.allowance(this.props.account,this.props.deployedAddress).call()) / 10**thisTokenDecimals
          //console.log(allowance)
          tokenBalances[thisTokenAddress] = balance
          tokenAllowances[thisTokenAddress] = allowance
          this.props.save({tokenBalances,tokenAllowances})

        }


      }
    }

  }

  getDetails = async () => {
    try {
      let id = this.props.match.params.id
      if(id){
        const response = await axios.get(this.props.backendUrl+`grants/`+id);
        console.log("RESPONSE DATA:",response.data)
        if(response.data&&response.data[0]){

          console.log("SAVING DATA FOR id",id,response.data[0])
          this.props.save(response.data[0])

          if(this.props.web3){
            let subscriptionContract = this.props.customContractLoader("Subscription",response.data[0].deployedAddress)
            this.props.save({author:await subscriptionContract.author().call(),subscriptionContract:subscriptionContract,toAddress:await subscriptionContract.requiredToAddress().call()})
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
        editButton = <button style={{marginLeft:50}} className="btn btn-outline-primary" onClick={()=>{
          window.location = "/create/"+this.props.match.params.id
        }}>
          Edit Grant
        </button>
      }

      let funding = ""
      if(this.props.web3&&this.props.author&&this.props.deployedAddress){
        let {handleInput,coins,contract,items,tokenName,tokenAmount,tokenAddress,timeType,timeAmount,gasPrice,prefilledParams,email,requiredTokenAddress} = this.props
        //console.log("timeType:",timeType)

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

        let allSubscriptions = ""

        let mySubscription = ""

        if(this.props.subscriptions&&this.props.subscriptions.length>0&&this.props.tokenBalances&&this.props.tokenContracts){
          console.log("this.props.subscriptions",this.props.subscriptions)
          allSubscriptions = this.props.subscriptions.map((sub)=>{
            let from = sub.parts[0]
            let to = sub.parts[1]
            let token = sub.parts[2]
            let tokenAmount = parseInt(this.props.web3.utils.toBN(sub.parts[3]).toString())/(10**18)
            let periodSeconds = this.props.web3.utils.toBN(sub.parts[4]).toString()
            let gasPrice = parseInt(this.props.web3.utils.toBN(sub.parts[5]).toString())/(10**18)

            let tokenSymbol = "Tokens"
            for(let i = 0; i < this.props.coins.length; i++){
              if(this.props.coins[i].address==token){
                tokenSymbol = this.props.coins[i].symbol
              }
            }

            let thisSub = (
              <div key={"sub"+sub.subscriptionHash} style={{marginTop:10,borderTop:"1px solid #444444",paddingTop:20}}>
                <Blockie
                  address={from.toLowerCase()}
                  config={{size:3}}
                 /> => <Blockie
                  address={to.toLowerCase()}
                  config={{size:3}}
                 /> {tokenAmount} {tokenSymbol}
              </div>
            )

            if(from.toLowerCase()==this.props.account.toLowerCase()){

              let approvedColor = "#fd9653"
              if(this.props.tokenAllowances[token]>0){
                approvedColor = "#5396fd"
              }
              let loader = ""
              if(this.props.approving){
               loader = (
                 <img src={Loader} style={{width: '30px', height: '30px', verticalAlign: 'middle', margin:'12px 0 0 10px'}}/>
               )
              }

              mySubscription= (
                <div>
                  {thisSub}
                  <div style={{marginTop:20}}>
                    Your Balance: <span>{this.props.tokenBalances[token]}</span>
                    <div style={{fontSize:12}}>
                      (Amount of {tokenSymbol} you hodl)
                    </div>
                  </div>
                  <div style={{marginTop:20,fontSize:28}}>
                    Approved Tokens: <span style={{color:approvedColor}}>{this.props.tokenAllowances[token]}</span>
                    <div style={{fontSize:12}}>
                      (Max limit of {tokenSymbol} approved to send throughout the lifetime of funding)
                    </div>
                  </div>
                  <div style={{marginTop:40}} className="form-field">
                  Approve: <input
                    type="text" name="approve" style={{width:100}} value={this.props.approve} onChange={this.props.handleInput}
                  />
                  <div style={{fontSize:12}}>
                    (Use this to start, stop, and pause your funding.)
                  </div>
                    <button size="2" style={{marginTop:10}} onClick={async  ()=>{
                        let amount = ""+(this.props.approve*(10**(this.props.tokenDecimals[token])))
                        let address = ""+(this.props.deployedAddress)
                        this.props.save({approving:true})
                        this.props.tx(
                          this.props.tokenContracts[token].approve(address,amount),
                          75000,
                          ()=>{
                            this.props.save({approving:false,approve:""})
                          }
                        )
                      }}>
                      Approve Tokens
                    </button> {loader}
                  </div>
                </div>
              )
            }else{
                return thisSub
            }

          })
        }

        let fundBox = ""
        if(mySubscription){
          fundBox = mySubscription
        }else{
          fundBox = (
            <div style={{zIndex:99,padding:20,background:"rgba(0,0,0,0.6)"}}>
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

              <div className="field is-horizontal mb-4">
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

              <div className="field is-horizontal mb-3">
                <div className="field-label">
                </div>
                <div className="field-body">
                  <div>
                    <button onClick={()=>{
                        this.props.sendSubscription()
                      }}>
                      Sign
                    </button>
                  </div>
                </div>
              </div>


            </div>
          )
        }

        funding = (
          <div style={{padding:20,background:"rgba(0,0,0,0.6)"}}>
              {fundBox}
              {allSubscriptions}
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
