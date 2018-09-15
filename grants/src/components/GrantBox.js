import React from 'react';
import styled from 'styled-components';

const GrantBoxWrap = styled.div`
display: block;
border: 1px solid #fff;
padding: 1rem;
margin-bottom: 2rem;
`

const GrantBox = (props) => {
  console.log(props)
  return (
    <GrantBoxWrap>
      <h2>{props.title}</h2>
    </GrantBoxWrap>
  )
}

export default GrantBox;