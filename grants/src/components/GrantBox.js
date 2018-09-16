import React from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';

const GrantBoxWrap = styled(Link)`
display: block;
padding: 1rem;
margin-bottom: 2rem;
background: rgba(0,0,0,0.5);
color: #fff;
text-align: center;
&:hover {
  background: rgba(83, 150, 253,0.3);
  color: #fff;
}
@media (min-width: 768px) {
  display: flex;
  align-items: center;
  padding: 1.2rem 1.5rem;
  text-align: left;
}
`
/*
<a className="btn btn-outline-secondary" target="blank" href={`https://etherscan.io/address/${props.deployedAddress}`}>
  View Contract
</a>
<Link className="btn btn-outline-primary ml-3" to={`/view/${props.id}`}>View Grant</Link>
 */

const GrantBox = (props) => {
  return (
    <GrantBoxWrap to={`/view/${props.id}`}>
      <div className="mb-3 mb-md-0">
        <h3>{props.title}</h3>
        <p className="lead mb-0">{props.pitch}</p>
      </div>
      <div className="ml-auto">
        <p className="mb-0">
          <button>View Grant</button>
        </p>
      </div>
    </GrantBoxWrap>
  )
}

export default GrantBox;
