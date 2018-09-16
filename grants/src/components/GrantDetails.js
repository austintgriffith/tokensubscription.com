import React, { Component } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Address, Blockie, Scaler } from "dapparatus";

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
          this.setState({author:await tokenContract.author().call()})
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

      return (
        <div className="container" style={{padding:20}}>
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
