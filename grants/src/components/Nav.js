import React from 'react';
import { Link } from "react-router-dom";

const Nav = () => (
  <ul className="nav">
    <li><Link to="/">Home</Link></li>
    <li><Link to="/list">Fund A Grant</Link></li>
    <li><Link to="/create">Create A Grant</Link></li>
  </ul>
)

export default Nav;