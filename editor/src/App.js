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
      <MeshGradient x="100" y="100" width="800" height="600">
        <MeshRow>
          <MeshPatch>
            <MeshStop path="c 25,-5 75, 5 100,0" stopColor="blue" />
            <MeshStop path="c 5, 25 -5, 75 0,100" stopColor="green" />
            <MeshStop path="c -25, 5 -75,-5 -100,0" stopColor="orange" />
            <MeshStop path="c -5,-25 5,-75" stopColor="red" /> {/* Last point not needed (closed path) */}
          </MeshPatch>
          <MeshPatch>
            <MeshStop path="c 25,-5 75, 5 100,0" /> {/* stop-color from previous patch */}
            <MeshStop path="c 5, 25 -5, 75 0,100" stopColor="teal" />
            <MeshStop path="c -25, 5 -75,-5" stopColor="gold" /> {/* Last point not needed (closed path). */}
            {/* Last path (left side) taken from right side of previous path (with points reversed). */}
          </MeshPatch>
          {/* <MeshPatch>
            <MeshStop path="c 25,-5 75, 5 100,0" />
            <MeshStop path="c 5, 25 -5, 75 0,100" stopColor="cyan" />
            <MeshStop path="c -25, 5 -75,-5" stopColor="magenta" />
          </MeshPatch> */}
        </MeshRow>
        <MeshRow>
          <MeshPatch>
            {/* First path (top side) taken from bottom path of patch above. */}
            <MeshStop path="c 5, 25 -5, 75 0,100" /> {/* stop-color from patch above. */}
            <MeshStop path="c -25, 5 -75,-5 -100,0" stopColor="pink" />
            <MeshStop path="c -5,-25 5,-75" stopColor="purple" /> {/* Last point not needed (closed path). */}
          </MeshPatch>
          <MeshPatch>
            {/* First path (top side) taken from bottom path of patch above (with points reversed). */}
            <MeshStop path="c 5, 25 -5, 75 0,100" /> {/* stop-color from patch above. */}
            <MeshStop path="c -25, 5 -75,-5" stopColor="gray" /> {/* Last point not needed (closed path). */}
            {/* Last path (left side) taken from right side of previous path (with points reversed). */}
          </MeshPatch>
          {/* <MeshPatch>
            <MeshStop path="c 25, 25 -25, 75 0,100" />
            <MeshStop path="c -25, 25 -75,-25" stopColor="crimson" />
          </MeshPatch> */}
        </MeshRow>
      </MeshGradient>
    </div>
  );
}

export default App;
