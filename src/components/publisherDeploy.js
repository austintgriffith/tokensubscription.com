import React, { Component } from 'react';
import Loader from '../loader.gif';
import Particles from '../particles.png';
var QRCode = require('qrcode.react');

class PublisherDeploy extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {

    let particleRender = (
      <img style={{zIndex:-1,position:"absolute",left:-1500,top:400,opacity:0.4}} src={Particles} />
    )


    let {deployingAddress,deployedAddress} = this.props

    let contractAddress = deployingAddress


    let url = window.location.origin+"/"+contractAddress


    let deployed = ""
    if(deployedAddress){
      contractAddress=deployedAddress
      url = window.location.origin+"/"+contractAddress
      return (
        <div>
          {particleRender}
          <h1 style={{marginTop: '100px'}}>Congratulations, your contract is ready.</h1>
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
          {particleRender}
          <h1 style={{marginTop: '100px'}}>Your contract is being deployed</h1>
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
        </div>
      );
    }
  }
}

export default PublisherDeploy;
