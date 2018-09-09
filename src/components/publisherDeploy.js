import React, { Component } from 'react';
import Loader from '../loader.gif';
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
            <pre>{"<script type='text/javascript' src='https://tokensubscription.com/coinsubscription.js' id='coinsubscription'></script>\n<script type='text/javascript'>COINSUBSCRIPTION.init(['"+contractAddress+"']);</script>"}</pre>
          </div>
        </div>
      );
    }else{
      return (
        <div>
          <h1 style={{marginTop: '100px'}}>Your contract is being deployed</h1>
          <h3>Once your contract deploys you can start accepting subscriptions</h3>
          <p style={{textAlign: 'center'}}>{contractAddress} <img src={Loader} style={{width: '30px', height: '30px', verticalAlign: 'middle', margin:'0 0 0 10px'}}/></p>
          <p>Follow the instructions below to share your subscription</p>
          <div>
          <p>Add a link to your website:</p>
            <pre>{"<a href='"+url+"' target='_blank'>Subscribe Now</a>"}</pre>
            <p>Share Url:</p>
            <pre>{url}</pre>
            <p>QR Code:</p>
            <QRCode value={url} />
            <p>Embed a script on your website:</p>
            <pre>{"<script type='text/javascript' src='https://tokensubscription.com/coinsubscription.js' id='coinsubscription'></script>\n<script type='text/javascript'>COINSUBSCRIPTION.init(['"+contractAddress+"']);</script>"}</pre>
          </div>
        </div>
      );
    }
  }
}

export default PublisherDeploy;
