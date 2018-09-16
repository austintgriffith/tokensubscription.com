import React, { Component } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Address, Blockie, Scaler } from "dapparatus";
import { Dropdown } from 'semantic-ui-react'

let pollInterval
let pollIntervalTime = 1333

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
    this.poll()
    pollInterval = setInterval(this.poll.bind(this),pollIntervalTime)
  }

  compontentWillUnmount() {
    clearInterval(pollInterval)
  }

  async poll(){
    console.log("polling for subscriptions on "+this.props.deployedAddress+"...")
    if(this.props.deployedAddress){
      const response = await axios.get(this.props.backendUrl+`subscriptionsByContract/`+this.props.deployedAddress);
      this.props.save({subscriptions:response.data})
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
        editButton = <button className="btn btn-outline-primary" style={{marginBottom:50}} onClick={()=>{
          window.location = "/create/"+this.props.match.params.id
        }}>
          Edit Grant
        </button>
      }

      let funding = ""
      if(this.props.web3&&this.props.author){
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

        if(this.props.subscriptions){
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
              <div style={{margin:5,border:"1px solid #555555",padding:5}}>
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
              mySubscription= (
                <div>
                  {thisSub}
                  (approve)
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
            <div>
              <h2>Fund Grant:</h2>
              <div className="form-field">
                <label>Token:</label>
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
              <div className="form-field">
                <label>Amount:</label>
                <input type="text" name="tokenAmount" value={tokenAmount} onChange={handleInput} />
              </div>
              <div className="form-field">
                <label>Gas Price:</label>
                <input
                  type="text" name="gasPrice" value={gasPrice} onChange={handleInput}
                />({currentTokenName})
              </div>
              <div className="form-field">
                <label>Email (optional):</label>
                <input
                  type="text" name="email" style={{width:240}} value={email} onChange={handleInput}
                />
              </div>
              <button size="2" style={{marginTop:50}} onClick={()=>{
                  this.props.sendSubscription()
                }}>
                Sign
              </button>
            </div>
          )
        }

        funding = (
          <div style={{position:"fixed",right:-2,top:100,width:450,padding:20,border:"1px solid #666666",backgroundColor:"#222222"}}>
            {fundBox}
            {allSubscriptions}
          </div>
        )
      }

      return (
        <div className="container" style={{padding:20}}>
          {funding}
          {editButton}
          <h1 className="mb-4">{this.props.title}</h1>
          <h3 className="mb-4">{this.props.pitch}</h3>

          <div style={{padding:10}}>
            <Address
              {...this.props}
              address={this.props.toAddress.toLowerCase()}
            />
          </div>

          <div style={{padding:10}}>
            <Address
              {...this.props}
              address={this.props.deployedAddress.toLowerCase()}
            />
          </div>

          <ReactMarkdown source={this.props.desc} />

          <div style={{padding:10}}>
            <Address
              {...this.props}
              address={this.props.author.toLowerCase()}
            />
          </div>



        </div>
      )
    }
  }
}
