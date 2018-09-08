import React, { Component } from 'react';
import { Address, Button, Blockie } from "dapparatus"
import axios from 'axios'



class Publisher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toAddress: "",
      tokenAmount: 1,
      timeAmount: 1,
      timeType:"months",
      tokenName:"TokenExampleSubscriptionToken",
      gasPrice:0.01,
      prefilledParams:false,

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
  async sendSubscription(){
    let {backendUrl,web3,account,contract} = this.props
    let {toAddress,timeType,tokenAmount,tokenAddress,gasPrice} = this.state

    let subscriptionContract = this.props.customContractLoader("Subscription",this.props.contract)

    let value = 0
    let txData = "0x02" //something like this to say, hardcoded VERSION 2, we're sending approved tokens
    let gasLimit = 120000

    let periodSeconds = this.state.timeAmount;
    if(timeType=="minutes"){
      periodSeconds*=60
    }else if(timeType=="hours"){
      periodSeconds*=3600
    }else if(timeType=="days"){
      periodSeconds*=86400
    }else if(timeType=="months"){
      periodSeconds*=2592000
    }

    if(!gasPrice) gasPrice = 0


    //TODO know decimals and convert here
    let realTokenAmount = tokenAmount*10**18
    let realGasPrice = gasPrice*10**18
    /*
    address from, //the subscriber
    address to, //the publisher
    address tokenAddress, //the token address paid to the publisher
    uint256 tokenAmount, //the token amount paid to the publisher
    uint256 periodSeconds, //the period in seconds between payments
    uint256 gasPrice, //the amount of tokens or eth to pay relayer (0 for free)
     */

    const parts = [
      account,
      toAddress,
      tokenAddress,
      web3.utils.toTwosComplement(realTokenAmount),
      web3.utils.toTwosComplement(periodSeconds),
      web3.utils.toTwosComplement(realGasPrice),
    ]
    /*web3.utils.padLeft("0x"+nonce,64),*/
    console.log("PARTS",parts)

    const subscriptionHash = await subscriptionContract.getSubscriptionHash(...parts).call()
    console.log("subscriptionHash",subscriptionHash)

    let signature = await web3.eth.personal.sign(""+subscriptionHash,account)
    console.log("signature",signature)
    let postData = {
      subscriptionContract:subscriptionContract._address,
      parts:parts,
      subscriptionHash: subscriptionHash,
      signature:signature,
    }

    console.log("postData",postData)
    /*axios.post(backendUrl+'saveSubscription', postData, {
      headers: {
          'Content-Type': 'application/json',
      }
    }).then((response)=>{
      console.log("TX RESULT",response)
    })
    .catch((error)=>{
      console.log(error);
    });*/
  }

  async componentDidMount() {
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
    if(this.props.contract){
      console.log("poll contract for values...")
      let subscriptionsContract = this.props.customContractLoader("Subscription",this.props.contract)
      console.log("subscriptionsContract",subscriptionsContract)
      let requiredToAddress = await subscriptionsContract.requiredToAddress().call()
      let requiredTokenAddress = await subscriptionsContract.requiredTokenAddress().call()

      //TODO: translate requiredTokenAddress to a requiredTokenName

      let requiredTokenAmount = await subscriptionsContract.requiredTokenAmount().call()
      let requiredPeriodSeconds = await subscriptionsContract.requiredPeriodSeconds().call()

      //TODO: translate requiredPeriodSeconds to a requiredTimeAmount and requiredTimeType
      let requiredTimeAmount = 1
      let requiredTimeType = "months"

      let requiredGasPrice = await subscriptionsContract.requiredGasPrice().call()

      this.setState({
        prefilledParams:true,
        toAddress:requiredToAddress,
        tokenAddress:requiredTokenAddress,
        tokenAmount:requiredTokenAmount,
        timeAmount:requiredTimeAmount,
        timeType:requiredTimeType
      })
    }
  }
  render() {
    let {contract} = this.props
    let {items,toAddress,tokenName,tokenAmount,timeType,timeAmount,gasPrice,prefilledParams} = this.state
    let coinOptions = []
    for(let i in items){
      console.log(items[i].name)
      coinOptions.push(
          <option key={items[i].name} value={items[i].name}>{items[i].name}</option>
      )
    }
    if(contract){
      if(!prefilledParams){
        return (
          <div style={{paddingLeft:40}}>
            loading...
          </div>
        );
      }else{
        return (
          <div style={{paddingLeft:40}}>
            <div>
              To Address:<Blockie
                address={toAddress.toLowerCase()}
                config={{size:3}}
              /> {toAddress.toLowerCase()}
            </div>
            <div>
              Token: {tokenName}

               -   Amount: {parseFloat(tokenAmount) + parseFloat(gasPrice)}

            </div>
            <div>
              Recurring Every: {timeAmount} {timeType}
            </div>

            <Button size="2" onClick={()=>{
                this.sendSubscription()
              }}>
              Sign
            </Button>
          </div>
        );
      }
    }else{
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
               type="text" name="tokenAmount" value={tokenAmount} onChange={this.handleInput.bind(this)}
             />
          </div>
          <div>
            Recurring Every:   <input
              style={{verticalAlign:"middle",width:400,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
              type="text" name="timeAmount" value={timeAmount} onChange={this.handleInput.bind(this)}
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
              type="text" name="gasPrice" value={gasPrice} onChange={this.handleInput.bind(this)}
            /> {tokenName}
          </div>
          <Button size="2" onClick={()=>{
              this.props.deploySubscription(toAddress,tokenName,tokenAmount,timeType,timeAmount,gasPrice)
            }}>
            Deploy Contract
          </Button>
        </div>
      );
    }

  }
}

export default Publisher;
