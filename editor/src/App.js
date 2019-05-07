import React from 'react';
import {
  MeshGradient,
  MeshRow,
  MeshPatch,
  MeshStop,
} from './components/GradientMesh';

function App() {
  return (
    <div className="App">
      <MeshGradient x="0" y="0" width="800" height="600">
        <MeshRow>
          <MeshPatch>
            <MeshStop path="c 25,-25 75, 25 100,0" stopColor="blue" />
            <MeshStop path="c 25, 25 -25, 75 0,100" stopColor="green" />
            <MeshStop path="c -25, 25 -75,-25 -100,0" stopColor="orange" />
            <MeshStop path="c -25,-25, 25,-75" stopColor="red" /> {/* Last point not needed (closed path) */}
          </MeshPatch>
          <MeshPatch>
            <MeshStop path="c 25,-25 75, 25 100,0" /> {/* stop-color from previous patch */}
            <MeshStop path="c 25, 25 -25, 75 0,100" stopColor="green" />
            <MeshStop path="c -25, 25 -75,-25" stopColor="orange" /> {/* Last point not needed (closed path). */}
            {/* Last path (left side) taken from right side of previous path (with points reversed). */}
          </MeshPatch>
        </MeshRow>
        <MeshRow>
          <MeshPatch>
            {/* First path (top side) taken from bottom path of patch above. */}
            <MeshStop path="c 25, 25 -25, 75 0,100" /> {/* stop-color from patch above. */}
            <MeshStop path="c -25, 25 -75,-25 -100,0" stopColor="orange" />
            <MeshStop path="c -25,-25, 25,-75" stopColor="red" /> {/* Last point not needed (closed path). */}
          </MeshPatch>
          <MeshPatch>
            {/* First path (top side) taken from bottom path of patch above (with points reversed). */}
            <MeshStop path="c 25, 25 -25, 75 0,100" /> {/* stop-color from patch above. */}
            <MeshStop path="c -25, 25 -75,-25" stopColor="orange" /> {/* Last point not needed (closed path). */}
            {/* Last path (left side) taken from right side of previous path (with points reversed). */}
          </MeshPatch>
        </MeshRow>
      </MeshGradient>
    </div>
  );
}

export default App;
