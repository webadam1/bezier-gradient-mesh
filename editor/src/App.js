import React, { useState } from 'react';
import Curve from './components/Curve';

function App() {
  const [curve, setCurve] = useState({
    x1: 50,
    y1: 50,
    x2: 100,
    y2: 150,
    x3: 200,
    y3: 150,
    x4: 250,
    y4: 300,
  });

  const onChange = (newCurve) => {
    setCurve({
      ...curve,
      ...newCurve,
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        <svg width="800" height="600" style={{ border: "1px solid red" }}>
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
          />
        </svg>
      </header>
    </div>
  );
}

export default App;
