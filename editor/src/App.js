import React, { useState } from 'react';
import Curve from './components/Curve';

function App() {
  const GRID_SIZE = 5;
  const GRID_STEP = 100;
  const GRID_OFFSET = 50;

  const generateGrid = () => {
    const curves = [];
    for (let i = 0; i < GRID_SIZE + 1; i++) {
      for (let j = 0; j < GRID_SIZE + 1; j++) {
        const ANCHOR_STEP = GRID_STEP / 4;
        if (i !== GRID_SIZE) {
          curves.push({
            x1: GRID_OFFSET + i * GRID_STEP,
            y1: GRID_OFFSET + j * GRID_STEP,
            x2: GRID_OFFSET + i * GRID_STEP + ANCHOR_STEP,
            y2: GRID_OFFSET + j * GRID_STEP,
            x3: GRID_OFFSET + (i + 1) * GRID_STEP - ANCHOR_STEP,
            y3: GRID_OFFSET + j * GRID_STEP,
            x4: GRID_OFFSET + (i + 1) * GRID_STEP,
            y4: GRID_OFFSET + j * GRID_STEP,
          });
        }
        if (j !== GRID_SIZE) {
          curves.push({
            x1: GRID_OFFSET + i * GRID_STEP,
            y1: GRID_OFFSET + j * GRID_STEP,
            x2: GRID_OFFSET + i * GRID_STEP,
            y2: GRID_OFFSET + j * GRID_STEP + ANCHOR_STEP,
            x3: GRID_OFFSET + i * GRID_STEP,
            y3: GRID_OFFSET + (j + 1) * GRID_STEP - ANCHOR_STEP,
            x4: GRID_OFFSET + i * GRID_STEP,
            y4: GRID_OFFSET + (j + 1) * GRID_STEP,
          });
        }
      }
    }
    return curves;
  }

  const [grid, setGrid] = useState(generateGrid());

  const onChange = (newCurve, index) => {
    const nextGrid = [...grid];
    nextGrid[index] = {
      ...nextGrid[index],
      ...newCurve
    }
    setGrid(nextGrid);
  }

  const renderCurves = () => {
    return grid.map((curve, i) => {
      return (
        <Curve
          x1={curve.x1}
          y1={curve.y1}
          x2={curve.x2}
          y2={curve.y2}
          x3={curve.x3}
          y3={curve.y3}
          x4={curve.x4}
          y4={curve.y4}
          onChange={onChange}
          index={i}
        />
      )
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        <svg width="800" height="600" style={{ border: "1px solid red" }}>
          {renderCurves()}
        </svg>
      </header>
    </div>
  );
}

export default App;
