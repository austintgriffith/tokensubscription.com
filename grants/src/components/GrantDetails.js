import React, { Component } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Address, Blockie, Scaler } from "dapparatus";
import { Dropdown } from 'semantic-ui-react'


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
      isLoaded: false,
      grantData: [],
      author: ""
    }
  }

  componentDidMount() {
    this.getDetails();
  }

  getDetails = async () => {
    try {
      const response = await axios.get(this.props.backendUrl+`grants/${this.props.match.params.id}`);
      this.setState(() => ({
        isLoaded: true,
        grantData: response.data
      }),async ()=>{
        console.log("At this point we have the grant contract address... dynamically load it...")
        if(this.props.web3){
          let tokenContract = this.props.customContractLoader("Subscription",this.state.grantData[0].deployedAddress)
          this.setState({author:await tokenContract.author().call(),contract:tokenContract})
        }
      });
    } catch (error) {
      this.setState(() => ({ error }))
    }
  }

  render() {
    const { error, isLoaded, grantData } = this.state;
    const grant = grantData[0];



    if (error) {
      return <div className="container">{error.message}</div>;
    } else if (!isLoaded) {
      return <div className="container">Loading Grants...</div>;
    } else {

      let editButton  =  ""
      if(this.props.account && this.state.author && this.state.author.toLowerCase()==this.props.account.toLowerCase()){
        editButton = <button className="btn btn-outline-primary" style={{marginBottom:50}} onClick={()=>{
          window.location = "/create/"+grant.id
        }}>
          Edit Grant
        </button>
      }

      let funding = ""
      if(this.props.web3&&this.state.author){
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
          <div style={{position:"fixed",right:-2,top:100,width:450,padding:20,border:"1px solid #666666",backgroundColor:"#222222"}}>
            <h2>Fund Grant:</h2>

            <div className="form-field">
              <label>Recipeint:</label>
              <Address
                {...this.props}
                address={toAddress}
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
                  onChange={handleInput}
                />

               <label>Amount:</label>
               <input type="text" name="tokenAmount" value={tokenAmount} onChange={handleInput} />
            </div>
            <div className="form-field">
              <label>Recurring Every:</label>
              <input type="text" name="timeAmount" value={timeAmount} onChange={handleInput} />
              <Dropdown
                selectOnNavigation={false}
                selection
                value={timeType}
                name="timeType"
                onChange={handleInput}
                options={monthOptions}
                placeholder='Choose Term'
              />
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

      return (
        <div className="container" style={{padding:20}}>
          {funding}
          {editButton}
          <h1 className="mb-4">{grant.title}</h1>
          <h3 className="mb-4">{grant.pitch}</h3>
          <p className="mb-4">{grant.description}</p>
          <div style={{padding:10}}>
            <Address
              {...this.props}
              address={grant.deployedAddress.toLowerCase()}
            />
          </div>

            <ReactMarkdown source={grant.desc} />

        </div>
      )
    }
  }
}
