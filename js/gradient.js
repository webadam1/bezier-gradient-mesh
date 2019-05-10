const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera( 0, 1, 0, 1, 1, 1000 );
const camera2 = new THREE.PerspectiveCamera( 50, 1, 1, 1000 );
camera2.position.z = 3;
camera2.position.x = 0.5;
camera2.position.y = -2;
camera2.rotation.x = 0.8;
scene.add(camera2);

const renderer = new THREE.WebGLRenderer();
const parentElement = document.querySelector('.gradient-mesh');
renderer.setSize(parentElement.clientWidth, parentElement.clientHeight);
renderer.domElement.style = '';
parentElement.insertBefore(renderer.domElement, parentElement.firstChild);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

camera.position.z = 10;
const hermiteCurveDivisions = 10;

let hermiteCoordinates = [
  [
    { y: 0, x: 0 },
    { y: 0.5, x: 0 },
    { y: 1, x: 0 },
  ],
  [
    { y: 0, x: 0.5 },
    { y: 0.5, x: 0.5 },
    { y: 1, x: 0.5 },
  ],
  [
    { y: 0, x: 1 },
    { y: 0.5, x: 1 },
    { y: 1, x: 1 },
  ],
];

let hermiteColors = [
  [
    { r: 1, b: 1, g: 1, a: 1 },
    { r: 0.3, b: 0.2, g: 0, a: 1 },
    { r: 0.5, b: 0.4, g: 0.2, a: 1 },
  ],
  [
    { r: 0.4, b: 0.9, g: 0.6, a: 1 },
    { r: 0.6, b: 0.9, g: 0.96, a: 1 },
    { r: 0.4, b: 0.5, g: 0.6, a: 1 },
  ],
  [
    { r: 0.02, b: 0.4, g: 0, a: 1 },
    { r: 0.02, b: 0.3, g: 0, a: 1 },
    { r: 0.02, b: 0.5, g: 1, a: 1 },
  ],
];

function transpose(matrix) {
  const w = matrix.length || 0;
  const h = matrix[0] instanceof Array ? matrix[0].length : 0;
  if (h === 0 || w === 0) { return []; }
  const t = [];

  for(let i = 0; i < h; i++) {
    t[i] = [];
    for(let j = 0; j < w; j++) {
      t[i][j] = matrix[j][i];
    }
  }
  return t;
}

function multiplyMatrices(A, B) {
  const result = new Array(A.length).fill(0).map(() => new Array(B[0].length).fill(0));

  return result.map((row, i) => {
    return row.map((val, j) => {
      return A[i].reduce((sum, elm, k) => sum + (elm*B[k][j]) ,0)
    })
  })
}

const HM = [
  [2, -2, 1, 1],
  [-3, 3, -2, -1],
  [0, 0, 1, 0],
  [1, 0, 0, 0],
];

const SubdivisionVecValues = new Array(hermiteCurveDivisions + 1).fill(0).map((v, i) => {
  const p = i / hermiteCurveDivisions;
  return [[p ** 3], [p ** 2], [p], [1]];
});

const UVec_TxHM = SubdivisionVecValues.map((v) => multiplyMatrices(transpose(v), HM));
const HM_TxVVec = SubdivisionVecValues.map((v) => multiplyMatrices(transpose(HM), v));

function getPatch(matrix, i, j, { attributeName, xTangent = 0, yTangent = 0, twistTangent = 0 }) {
  if (attributeName) {
    return ([
      [matrix[i][j][attributeName], matrix[i + 1][j][attributeName], xTangent, xTangent],
      [matrix[i][j + 1][attributeName], matrix[i + 1][j + 1][attributeName], xTangent, xTangent],
      [yTangent, yTangent, twistTangent, twistTangent],
      [yTangent, yTangent, twistTangent, twistTangent],
    ]);
  }
  return ([
    [matrix[i][j], matrix[i + 1][j], xTangent, xTangent],
    [matrix[i][j + 1], matrix[i + 1][j + 1], xTangent, xTangent],
    [yTangent, yTangent, twistTangent, twistTangent],
    [yTangent, yTangent, twistTangent, twistTangent],
  ])
}

function getPatches(coordinateValues, colorValues) {
  const patches = [];
  const columnLength = colorValues.length - 1;
  for (let i = 0; i < columnLength; i++) {
    const rowLength = colorValues[i].length - 1;
    for (let j = 0; j < rowLength; j++) {
      const patch = {};
      patch.x = getPatch(coordinateValues, i, j, { attributeName: 'x', xTangent: 0.5 });
      patch.y = getPatch(coordinateValues, i, j, { attributeName: 'y', yTangent: 0.5 });
      patch.r = getPatch(colorValues, i, j, { attributeName: 'r' });
      patch.g = getPatch(colorValues, i, j, { attributeName: 'g' });
      patch.b = getPatch(colorValues, i, j, { attributeName: 'b' });
      patches.push(patch);
    }
  }
  return patches;
}

function getPatchPointByIndex(hermitePatch, ui, vi) {
  const vec = multiplyMatrices(multiplyMatrices(UVec_TxHM[ui], hermitePatch), HM_TxVVec[vi]);
  return vec[0][0];
}

const allPatches = getPatches(hermiteCoordinates, hermiteColors);
let hermitePatches = new THREE.Group();

function drawHermiteSurface(t) {
  if (hermitePatches) {
    for (let i = hermitePatches.children.length - 1; i >= 0; i--) {
      hermitePatches.remove(hermitePatches.children[i]);
    }
    scene.remove(hermitePatches);
    hermitePatches = null;
  }
  hermitePatches = new THREE.Group();

  allPatches.forEach((patch) => {
    const surfaceElements = [];
    let vertexColors = [];
    for(let i = 0; i <= hermiteCurveDivisions; i++) {
      for(let j = 0; j <= hermiteCurveDivisions; j++) {
        const x = getPatchPointByIndex(patch.x, i, j);
        const y = getPatchPointByIndex(patch.y, i, j);
        const r = Math.sin(t) * getPatchPointByIndex(patch.r, i, j);
        const g = (- Math.sin(t / 2 - Math.PI)) * getPatchPointByIndex(patch.g, i, j);
        const b = (1 + Math.sin(t / 5 + Math.PI)) * getPatchPointByIndex(patch.b, i, j);
        const vertex = new THREE.Vector3(x, y, (r + g + b) / 3);
        surfaceElements.push(vertex);
        vertexColors.push(new THREE.Color(r, g, b));
      }
    }
    let hermiteSurfaceVertices = surfaceElements;
    const hermiteSurfaceFaces = [];
    // creating faces from vertices
    let v1, v2, v3, v4, face1, face2;  // vertex indices in hermiteSurfaceVertices array
    for (let i = 0; i < hermiteCurveDivisions; i++) {
      for (let j = 0; j < hermiteCurveDivisions; j++) {
        v1 = i * (hermiteCurveDivisions + 1) + j;
        v2 = (i + 1) * (hermiteCurveDivisions + 1) + j;
        v3 = i * (hermiteCurveDivisions + 1) + (j + 1);
        v4 = (i + 1) * (hermiteCurveDivisions + 1) + (j + 1);

        face1 = new THREE.Face3(v1, v2, v3);
        face1.vertexColors = [vertexColors[v1], vertexColors[v2], vertexColors[v3]];
        face2 = new THREE.Face3(v2, v4, v3);
        face2.vertexColors = [vertexColors[v2], vertexColors[v4], vertexColors[v3]];
        hermiteSurfaceFaces.push( face1 );
        hermiteSurfaceFaces.push( face2 );
      }
    }
    const hermiteSurfaceGeometry = new THREE.Geometry();
    hermiteSurfaceGeometry.vertices = hermiteSurfaceVertices;
    hermiteSurfaceGeometry.faces = hermiteSurfaceFaces;
    hermiteSurfaceGeometry.computeFaceNormals();
    hermiteSurfaceGeometry.computeVertexNormals();
    const hermiteSurfaceMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: THREE.VertexColors, side: THREE.DoubleSide });
    const hermiteSurface = new THREE.Mesh(hermiteSurfaceGeometry, hermiteSurfaceMaterial);
    hermitePatches.add(hermiteSurface);
  });
  scene.add(hermitePatches);
}

const animate = (t) => {
  drawHermiteSurface(t);
	renderer.render(scene, camera2);
	requestAnimationFrame(() => animate(t + 0.05));
};

animate(0);
