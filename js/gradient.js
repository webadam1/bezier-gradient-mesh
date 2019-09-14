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
const hermiteCurveDivisions = 15;

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

const HM_T = transpose(HM);

function getPatch(matrix, i, j, attributeName) {
  if (attributeName) {
    return ([
      [matrix[i][j][attributeName], matrix[i + 1][j][attributeName], 0, 0],
      [matrix[i][j + 1][attributeName], matrix[i + 1][j + 1][attributeName], 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
  }
  return ([
    [matrix[i][j], matrix[i + 1][j], 0, 0],
    [matrix[i][j + 1], matrix[i + 1][j + 1], 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ])
}

function getPatches(colorValues) {
  const patches = [];
  const columnLength = colorValues.length - 1;
  for (let i = 0; i < columnLength; i++) {
    const rowLength = colorValues[i].length - 1;
    for (let j = 0; j < rowLength; j++) {
      const patch = {};
      patch.x = [
        [i / columnLength, (i + 1) / columnLength, 0.5, 0.5],
        [i / columnLength, (i + 1) / columnLength, 0.5, 0.5],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      patch.y = [
        [j / rowLength, j / rowLength, 0, 0],
        [(j + 1) / rowLength, (j + 1) / rowLength, 0, 0],
        [0.5, 0.5, 0, 0],
        [0.5, 0.5, 0, 0],
      ];
      patch.r = getPatch(colorValues, i, j, 'r');
      patch.g = getPatch(colorValues, i, j, 'g');
      patch.b = getPatch(colorValues, i, j, 'b');
      patches.push(patch);
    }
  }
  return patches;
}

function getPatchPoint(hermitePatch, u, v) {
  const Uvec = [[u ** 3], [u ** 2], [u], [1]];
  const Vvec = [[v ** 3], [v ** 2], [v], [1]];
  const vec = multiplyMatrices(multiplyMatrices(multiplyMatrices(multiplyMatrices(transpose(Uvec), HM), hermitePatch), HM_T), Vvec);
  return vec[0][0];
}

const allPatches = getPatches(hermiteColors);
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
        const x = getPatchPoint(patch.x, i / hermiteCurveDivisions, j / hermiteCurveDivisions);
        const y = getPatchPoint(patch.y, i / hermiteCurveDivisions, j / hermiteCurveDivisions);
        const r = getPatchPoint(patch.r, i / hermiteCurveDivisions, j / hermiteCurveDivisions);
        const g = getPatchPoint(patch.g, i / hermiteCurveDivisions, j / hermiteCurveDivisions);
        const b = getPatchPoint(patch.b, i / hermiteCurveDivisions, j / hermiteCurveDivisions);
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
    const hermiteSurfaceMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: THREE.VertexColors });
    const hermiteSurface = new THREE.Mesh(hermiteSurfaceGeometry, hermiteSurfaceMaterial);
    hermitePatches.add(hermiteSurface);
  });
  scene.add(hermitePatches);
}

const animate = (t) => {
  drawHermiteSurface(t);
	renderer.render(scene, camera);
	// requestAnimationFrame(() => animate(t + 0.05));
};

animate(0);
