import React, { Component } from 'react';
import { Address, Button, Blockie } from "dapparatus"
import { Dropdown } from 'semantic-ui-react'

class Publisher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toAddress: props.account,
      tokenAmount: 1,
      timeAmount: 1,
      timeType:"months",
      tokenAddress:"0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
      gasPrice:0.25
    };
  }
  handleInput(e,data){
    console.log("INPUT",e,data)
    let update = {}
    if(data){
      update[data.name] = data.value
      if(data.name=="tokenAddress"&&data.value=="0x0000000000000000000000000000000000000000"){
        update.tokenAmount=""
        update.gasPrice=""
        update.timeAmount=""
      }else{
        if(this.state.tokenAmount==""){
          update.tokenAmount=1
        }
        if(this.state.gasPrice==""){
          update.gasPrice=0.25
        }
        if(this.state.timeAmount==""){
          update.timeAmount=1
        }
      }
    }else{
      update[e.target.name] = e.target.value
    }
    this.setState(update,()=>{
    //  this.updateUrl()
    })
  }
  updateUrl(){
    let url = window.location.origin+window.location.pathname+
      "?timeAmount="+this.state.timeAmount+
      "&timeType="+this.state.timeType
      if(this.state.toAddress) url+="&toAddress="+this.state.toAddress
      if(this.state.tokenAddress) url+="&tokenAddress="+this.state.tokenAddress
      if(this.state.tokenAmount) url+="&tokenAmount="+this.state.tokenAmount
      if(this.state.gasPrice) url+="&gasPrice="+this.state.gasPrice

    this.setState({url:url})
  }
  componentDidMount() {
    let {contracts} = this.props
    console.log("contracts",contracts)
    this.setState({
      isLoaded: true,
      items: [ {
        address: this.props.contracts.TokenExampleSubscriptionToken._address,
        decimals: 18,
        name: "TokenExampleSubscriptionToken",
        symbol: "TEST"
      } ]
    })
  }

  render() {
    let {contracts,coins} = this.props
    let {items,toAddress,tokenAddress,tokenAmount,timeType,timeAmount,gasPrice} = this.state

    let coinOptions = []

    for(let i = 0; i < coins.length; i++){
      coinOptions.push({
         key: coins[i].address,
         value: coins[i].address,
         image:{
           avatar : true,
           src    : coins[i].imageUrl,
         },
         text: coins[i].name + ' (' + coins[i].symbol + ')'
       })
    }

    return (
      <div className="container">
        <div className="form-field">
          <label>To Address:</label>
          <Blockie
            address={toAddress.toLowerCase()}
            config={{size:3}}
          /> <input
            type="text" style={{width: '415px'}} name="toAddress" value={toAddress} onChange={this.handleInput.bind(this)}
          />
        </div>
        <div className="form-field">
          <label>Token:</label>
            <Dropdown
              selectOnNavigation={false}
              selection
              value={tokenAddress}
              name='tokenAddress'
              options={coinOptions}
              placeholder='Choose Token'
              onChange={this.handleInput.bind(this)}
            />

           <label>Amount:</label>
           <input
             type="text" name="tokenAmount" value={tokenAmount} onChange={this.handleInput.bind(this)}
           />
        </div>
        <div className="form-field">
          <label>Recurring Every:</label>
          <input
            type="text" name="timeAmount" value={timeAmount} onChange={this.handleInput.bind(this)}
          /><select value={timeType} name="timeType" onChange={this.handleInput.bind(this)} style={{width: '80px'}}>
            <option value="months">Month(s)</option>
            <option value="days">Day(s)</option>
            <option value="hours">Hour(s)</option>
            <option value="minutes">Minute(s)</option>
          </select>
        </div>
        <div className="form-field">
          <label>Gas Price:</label>
          <input
            type="text" name="gasPrice" value={gasPrice} onChange={this.handleInput.bind(this)}
          />
        </div>
        <Button size="2" onClick={()=>{
            this.props.deploySubscription(toAddress,tokenAddress,tokenAmount,timeType,timeAmount,gasPrice)
          }}>
          Deploy Contract
        </Button>
      </div>
    );
  }
}

export default Publisher;
