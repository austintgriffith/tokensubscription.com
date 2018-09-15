import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import './App.css';

import Home from './components/Home';
import GrantsList from './components/GrantsList';
import CreateGrants from './components/CreateGrants';
import GrantDetails from './components/GrantDetails';

const App = () => (
  <Router>
    <div className="wrapper">

      <ul className="nav">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/list">Fund A Grant</Link></li>
        <li><Link to="/create">Create A Grant</Link></li>
        <li><Link to="/view/1">Grant Details</Link></li>
      </ul>

      <Route exact path="/" component={Home} />
      <Route path="/list" component={GrantsList} />
      <Route path="/create" component={CreateGrants} />
      <Route path="/view/:id" component={GrantDetails} />
    </div>
  </Router>
)

export default App;
