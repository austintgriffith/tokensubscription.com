import React, { Component } from 'react';
import './App.css';
var request = require("request")

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message:"connecting to backend..."
    }
  }
  componentDidMount() {
    var options = { method: 'GET',
      url: 'http://localhost:8000/'
    };
    request(options,(error, response, body) => {
      if (error){
        console.log("Error loading rules:",error)
      } else {
        this.setState({message:body})
      }
    });
  }
  render() {
    return (
      <div>
        <div>
          Grants - Powered by Token Subscriptions
        </div>
        <div>
          {this.state.message}
        </div>
      </div>
    );
  }
}

export default App;
