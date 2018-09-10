import React, { Component } from 'react';
import { Address, Blockie } from "dapparatus"
import axios from 'axios'
import Particles from '../particles.png';
import Loader from "../loader.gif"

let pollInterval
let pollTime = 1777

class SubscriberApprove extends Component {
  constructor(props) {
    super(props);
    this.state = {
      approved:0,
      approve:12,
      loading:false
    };
  }
  componentDidMount(){
    axios.get(this.props.backendUrl+"subscription/"+this.props.subscription, { crossdomain: true })
    .catch((err)=>{
      console.log("Error getting subscription",err)
    })
    .then(async (response)=>{
      console.log("subscription:",response.data)
      //let subscriptionContract = this.props.customContractLoader("Subscription",this.props.contract)
      let tokenContract = this.props.customContractLoader("TokenExampleSubscriptionToken",response.data.parts[2])
      let decimals = await tokenContract.decimals().call()
      let foundToken
      for(let i = 0; i < this.props.coins.length; i++){
        if(tokenContract._address.toLowerCase() == this.props.coins[i].address.toLowerCase()){
          foundToken = this.props.coins[i]
        }
      }
      this.setState({subscription:response.data,token:foundToken,decimals:decimals,/*,subscriptionContract:subscriptionContract*/tokenContract:tokenContract})
    })
    pollInterval = setInterval(this.load.bind(this),pollTime)
    this.load()
  }
  componentWillUnmount(){
    clearInterval(pollInterval)
  }
  async load(){
    if(this.state.tokenContract){
      this.setState({
        balance:await this.state.tokenContract.balanceOf(this.props.account).call(),
        approved:await this.state.tokenContract.allowance(this.state.subscription.parts[0],this.state.subscription.subscriptionContract).call()
      })
    }
  }
  handleInput(e){
    let update = {}
    update[e.target.name] = e.target.value
    this.setState(update)
  }
  render() {
    let {web3,tx} = this.props
    if(!this.state.subscription){
      return (
        <img src={Loader} style={{maxWidth:30}} />
      )
    }
    console.log(this.state.subscription)

    let contract = this.state.subscription.subscriptionContract
    let from = this.state.subscription.parts[0]
    let to = this.state.subscription.parts[1]
    let token = this.state.subscription.parts[2]
    let tokenAmount = parseInt(web3.utils.toBN(this.state.subscription.parts[3]).toString())/(10**this.state.decimals)
    let periodSeconds = web3.utils.toBN(this.state.subscription.parts[4]).toString()
    let gasPrice = web3.utils.toBN(this.state.subscription.parts[5]).toString()

    //let from = this.state.subscription.parts[0]

    console.log("TOKEN",this.state.token)

    let loading = ""
    if(this.state.loading){
      loading = (
        <img src={Loader} style={{maxWidth:30}} />
      )
    }

    let approvedColor = "#fd9653"
    if(this.state.approved>0){
      approvedColor = "#5396fd"
    }

    let particleRender = (
      <img style={{zIndex:-1,position:"absolute",left:-2500,top:400,opacity:0.4}} src={Particles} />
    )

    return (
      <div style={{paddingLeft:40,marginTop:100}}>
        {particleRender}
        <h1>Approve Max Subscription Limit:</h1>
        <div>Subscription: {this.state.subscription.subscriptionHash}</div>
        <div>
          {tokenAmount} <img style={{maxHeight:25}} src={this.state.token.imageUrl}/>{this.state.token.name}
        </div>
        <div>
          From <Address
            {...this.props}
            address={from.toLowerCase()}
          /> to <Address
            {...this.props}
            address={to.toLowerCase()}
          />
        </div>
        <div>
          Recurring every {periodSeconds}s
        </div>
        <div style={{marginTop:20}}>
          Token Balance: <span>{this.state.balance/(10**this.state.decimals)}</span>
        </div>
        <div style={{marginTop:20,fontSize:28}}>
          Approved Tokens: <span style={{color:approvedColor}}>{this.state.approved/(10**this.state.decimals)}</span>
        </div>
        <div style={{marginTop:40}} className="form-field">
        {loading}<input
          type="text" name="approve" value={this.state.approve} onChange={this.handleInput.bind(this)}
        />
          <button size="2" onClick={async ()=>{
              console.log("TEST")
              let amount = ""+(this.state.approve*(10**(this.state.decimals)))
              let address = ""+(this.state.subscription.subscriptionContract)
              console.log("APPROVE",address,amount)
              console.log("======================================================")
              this.setState({loading:true})
              tx(
                this.state.tokenContract.approve(address,amount),250000,
                ()=>{
                  this.setState({loading:false})
                }
              )
            }}>
            Approve Tokens
          </button>
        </div>
      </div>
    );
  }
}

export default SubscriberApprove;
