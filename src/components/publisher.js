import React, { Component } from 'react';
import { Address, Button, Blockie } from "dapparatus"


class Publisher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toAddress: props.account,
      tokenAmount: 1,
      timeAmount: 1,
      timeType:"months",
      tokenName:"TokenExampleSubscriptionToken",
      gasPrice:0.01
    };
  }
  handleInput(e){
    let update = {}
    update[e.target.name] = e.target.value
    this.setState(update,()=>{
      this.updateUrl()
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
    /*fetch('https://api.0xtracker.com/tokens')
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            items: result
          })
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )*/
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
    let {items,toAddress,timeType,timeAmount,tokenName} = this.state
    let coinOptions = []
    for(let i in items){
      console.log(items[i].name)
      coinOptions.push(
          <option key={items[i].name} value={items[i].name}>{items[i].name}</option>
      )
    }
    return (
      <div style={{paddingLeft:40}}>
        <div>
          To Address:<Blockie
            address={toAddress.toLowerCase()}
            config={{size:3}}
          /> <input
            style={{verticalAlign:"middle",width:400,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
            type="text" name="toAddress" value={toAddress} onChange={this.handleInput.bind(this)}
          />
        </div>
        <div>
          Token: <select value={tokenName} name="tokenName" onChange={this.handleInput}>
            {coinOptions}
          </select>

           Amount: <input
             style={{verticalAlign:"middle",width:400,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
             type="text" name="tokenAmount" value={this.state.tokenAmount} onChange={this.handleInput.bind(this)}
           />
        </div>
        <div>
          Recurring Every:   <input
            style={{verticalAlign:"middle",width:400,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
            type="text" name="timeAmount" value={this.state.timeAmount} onChange={this.handleInput.bind(this)}
          /><select value={timeType} name="timeType" onChange={this.handleInput}>
            <option value="months">Month(s)</option>
            <option value="days">Day(s)</option>
            <option value="hours">Hour(s)</option>
            <option value="minutes">Minute(s)</option>
          </select>
        </div>
        <div>
          Gas Price:   <input
            style={{verticalAlign:"middle",width:400,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
            type="text" name="gasPrice" value={this.state.gasPrice} onChange={this.handleInput.bind(this)}
          /> {tokenName}
        </div>
      </div>
    );
  }
}

export default Publisher;
