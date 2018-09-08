import React, { Component } from 'react';
import { Address, Button, Blockie } from "dapparatus"
import axios from 'axios'

class Subscriber extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toAddress: "",
      tokenAmount: "",
      timeAmount: "",
      timeType:"",
      tokenName:"",
      gasPrice:"",
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
    axios.post(backendUrl+'saveSubscription', postData, {
      headers: {
          'Content-Type': 'application/json',
      }
    }).then((response)=>{
      console.log("TX RESULT",response)
    })
    .catch((error)=>{
      console.log(error);
    });
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
      let requiredTokenName
      //TODO: translate requiredTokenAddress to a requiredTokenName

      let tokenDecimals = 0

      if(requiredTokenAddress){
        console.log("using",requiredTokenAddress,"search through",this.props.coins)
        for(let c in this.props.coins){
          console.log("CHECKING",this.props.coins[c])
          if(this.props.coins[c] && this.props.coins[c].address && this.props.coins[c].address.toLowerCase()==requiredTokenAddress.toLowerCase()){

            console.log("FOUND!!!!!!!!")
            requiredTokenName = this.props.coins[c].name
            tokenDecimals = this.props.coins[c].decimals
          }
        }
      }

      let requiredTokenAmount = await subscriptionsContract.requiredTokenAmount().call()
      console.log("requiredTokenAmount",requiredTokenAmount)
      let requiredPeriodSeconds = await subscriptionsContract.requiredPeriodSeconds().call()
      let requiredTimeAmount = 0
      let requiredTimeType = ""
      if(requiredPeriodSeconds){
        if(requiredPeriodSeconds>=2592000){
          requiredTimeAmount = requiredPeriodSeconds/2592000
          requiredTimeType = "months"
        }else if(requiredPeriodSeconds>=86400){
          requiredTimeAmount = requiredPeriodSeconds/86400
          requiredTimeType = "days"
        }else if(requiredPeriodSeconds>=3600){
          requiredTimeAmount = requiredPeriodSeconds/3600
          requiredTimeType = "hours"
        }else{
          requiredTimeAmount = requiredPeriodSeconds/60
          requiredTimeType = "minutes"
        }
      }

      let requiredGasPrice = await subscriptionsContract.requiredGasPrice().call()

      if(tokenDecimals){
        requiredGasPrice=requiredGasPrice/(10**tokenDecimals)
        requiredTokenAmount=requiredTokenAmount/(10**tokenDecimals)
      }
      console.log("requiredTokenAmount",requiredTokenAmount)
      console.log(requiredGasPrice);
      this.setState({
        prefilledParams:true,
        toAddress:requiredToAddress,
        tokenAddress:requiredTokenAddress,
        tokenAmount:requiredTokenAmount,
        tokenName:requiredTokenName,
        timeAmount:requiredTimeAmount,
        timeType:requiredTimeType,
        gasPrice:requiredGasPrice,
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
              Amount: {parseFloat(tokenAmount) + parseFloat(gasPrice)}
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
          TODO
        </div>
      );
    }

  }
}

export default Subscriber;
