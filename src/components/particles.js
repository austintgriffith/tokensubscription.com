import React, { Component } from 'react';
import { Address, Blockie, Scaler } from "dapparatus"
import { Dropdown } from 'semantic-ui-react'
import Particles from '../particles.png';

class ParticlesRender extends Component {
  render() {

    let left = -700
    let opacity = 0.95
    if(this.props.left) left = this.props.left
    if(this.props.opacity) opacity = this.props.opacity

    return (
      <img style={{zIndex:-1,position:"absolute",left:left,top:200,opacity:opacity}} src={Particles} />
    )
  }
}

export default ParticlesRender;
