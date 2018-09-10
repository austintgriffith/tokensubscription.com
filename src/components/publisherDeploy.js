import React, { Component } from 'react';
import Loader from '../loader.gif';
import Particles from './particles.js';
import Backarrow from '../back-arrow.png'
var QRCode = require('qrcode.react');


class PublisherDeploy extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {




    let {deployingAddress,deployedAddress} = this.props

    let contractAddress = deployingAddress


    let url = window.location.origin+"/"+contractAddress


    let deployed = ""
    if(deployedAddress){
      contractAddress=deployedAddress
      url = window.location.origin+"/"+contractAddress
      return (
        <div>
          <Particles left={-1800} opacity={0.45} />
          <h1 style={{marginTop: '30px'}}>Congratulations, your contract is ready.</h1>
          <h3>You can now accept subscriptions!</h3>
          <p style={{textAlign: 'center'}}>{contractAddress} {deployed}</p>
          <p>Follow the instructions below to share your subscription</p>
          <div>
            <p>Add a link to your website:</p>
            <pre>{"<a href='"+url+"' target='_blank'>Subscribe Now</a>"}</pre>
            <p>Share Url:</p>
            <pre>{url}</pre>
            <p>QR Code:</p>
            <QRCode value={url} />
            <p>Embed a script on your website:</p>
            <pre>{"<script type='text/javascript' src='https://tokensubscription.com/coinsubscription.js?contract="+contractAddress+"' id='coinsubscription'></script>"}</pre>
          </div>
        </div>
      );
    }else{
      return (
        <div>
          <Particles left={-1800} opacity={0.45} />
          <h1 style={{marginTop: '30px'}}>Your contract is being deployed</h1>
          <h3>(Make sure you <b>confirm</b> the metamask dialog to deploy your contract!)</h3>
          <p style={{textAlign: 'center'}}>  <img src={Loader} style={{width: '50px', height: '50px', verticalAlign: 'middle', margin:'0 0 0 10px'}}/> {contractAddress}</p>
          <p>Follow the instructions below to share your subscription</p>
          <div>
          <p>Add a link to your website:</p>
            <pre>{"<a href='"+url+"' target='_blank'>Subscribe Now</a>"}</pre>
            <p>Share Url:</p>
            <pre>{url}</pre>
            <p>QR Code:</p>
            <QRCode value={url} />
            <p>Embed a script on your website:</p>
            <pre>{"<script type='text/javascript' src='https://tokensubscription.com/coinsubscription.js?contract="+contractAddress+"' id='coinsubscription'></script>\n"}</pre>
          </div>
          <div style={{marginTop:90,cursor:"pointer"}} onClick={()=>{this.props.setMode("")}}>
            <img style={{verticalAlign:'middle'}} src={Backarrow}/> <span style={{fontSize:14}}>Previous</span>
          </div>
        </div>
      );
    }
  }
}

export default PublisherDeploy;
