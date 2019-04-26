import React from 'react';
import Handler from '../Handler';

const Curve = ({ x1, y1, x2, y2, x3, y3, x4, y4, onChange, index }) => {
  const onPrimaryHandleChange = (positions) => {
    onChange(positions, index);
  }

  const onSecondaryHandleChange = (positions) => {
    if (positions.hasOwnProperty('x1')) {
      onChange({
        x3: positions.x1,
        y3: positions.y1,
      }, index);
    } else {
      onChange({
        x4: positions.x2,
        y4: positions.y2,
      }, index);
    }
  }

  return (
    <>
      <path
        d={`M${x1},${y1}C${x2},${y2},${x3},${y3},${x4},${y4}`}
        stroke="#569be2"
        strokeWidth={1}
        fill="none"
      />
      <Handler x1={x1} y1={y1} x2={x2} y2={y2} onChange={onPrimaryHandleChange} />
      <Handler x1={x3} y1={y3} x2={x4} y2={y4} onChange={onSecondaryHandleChange} />
    </>
  )
}

export default Curve;