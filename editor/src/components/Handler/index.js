import React from 'react';
import Anchor from '../Anchor';

const Handler = ({ x1, y1, x2, y2, onChange }) => {
  const onStartChange = (position) => {
    onChange({
      x1: position.x1,
      y1: position.y1,
    });
  }
  
  const onEndChange = (position) => {
    onChange({
      x2: position.x1,
      y2: position.y1,
    });
  }
  
  return (
    <>
      <Anchor x={x1} y={y1} onChange={onStartChange} />
      <Anchor x={x2} y={y2} onChange={onEndChange} />
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={5} stroke="black" />
    </>
  )
}

export default Handler;