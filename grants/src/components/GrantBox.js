import React from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';

const GrantBoxWrap = styled.div`
display: flex;
align-items: center;
border: 1px solid #fff;
padding: 1rem;
margin-bottom: 2rem;
> div {
  margin: 0 10px;
}
@media (min-width: 768px) {

}
`

const GrantBox = (props) => {
  return (
    <GrantBoxWrap>
      <div>
        <h3 className="mb-0">{props.title}</h3>
      </div>
      <div>
        <p className="mb-0">{props.pitch}</p>
      </div>
      <div>
        <Link to={`/view/${props.id}`}>View Grant</Link>
      </div>
    </GrantBoxWrap>
  )
}

export default GrantBox;