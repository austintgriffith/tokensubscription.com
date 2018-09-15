import React, { Component } from 'react';
import GrantBox from './GrantBox';

const request = require("request");

export default class GrantsList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      message:"connecting to backend..."
    }
  }

  componentDidMount() {
    const options = { method: 'GET',
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
      <div className="container">
        <GrantBox />
        <div className="text-center">
          {this.state.message}
        </div>
      </div>
    )
  }
}