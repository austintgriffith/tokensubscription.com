import React from 'react';
import styled from 'styled-components';

const ProgressBarDiv = styled.div`
display: -ms-flexbox;
display: flex;
height: 1.4rem;
overflow: hidden;
font-size: .75rem;
background-color: #333;
border-radius: .25rem;
.progress-bar {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-direction: column;
    flex-direction: column;
    -ms-flex-pack: center;
    justify-content: center;
    color: #fff;
    text-align: center;
    white-space: nowrap;
    background-color: #7973b3;
    transition: width .6s ease;
}
`

const ProgressBar = (props) => (
    <ProgressBarDiv>
        <div className="progress-bar" role="progressbar" style={{ width: `${props.percentage}%` }}>
            {props.percentage}% Funded
        </div>
    </ProgressBarDiv>
)

export default ProgressBar;