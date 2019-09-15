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
const patchDivCount = 20;

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

function multiply(a, b) {
  const aNumRows = a.length;
  const aNumCols = a[0].length;
  const bNumRows = b.length;
  const bNumCols = b[0].length,
    m = new Array(aNumRows);  // initialize array of rows
  for (let r = 0; r < aNumRows; ++r) {
    m[r] = new Array(bNumCols); // initialize the current row
    for (let c = 0; c < bNumCols; ++c) {
      m[r][c] = 0;             // initialize the current cell
      for (let i = 0; i < aNumCols; ++i) {
        m[r][c] += a[r][i] * b[i][c];
      }
    }
  }
  return m;
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
  const vec = multiply(multiply(multiply(multiply(transpose(Uvec), HM), hermitePatch), HM_T), Vvec);
  return vec[0][0];
}

const allPatches = getPatches(hermiteColors);
let hermitePatches = new THREE.Group();
let positionBufferAttribute;
let colorBufferAttribute;
const gradientMeshGeometry = new THREE.BufferGeometry();
const patchVertexCount = (patchDivCount + 1) * (patchDivCount + 1);
const patchFaceCount = patchDivCount * patchDivCount * 2;
const vertexCount = allPatches.length * patchFaceCount * 3;
console.log({ patchVertexCount, patchFaceCount, vertexCount });
let gradientMesh;
const vertexArray = new Array(vertexCount * 3);
const colorArray = new Array(vertexCount * 3);
const surfaceElements = new Array(patchVertexCount * 3);
const vertexColors = new Array(patchVertexCount * 3);
let vertices;
let colors;

function initializeHermiteSurface() {
  allPatches.forEach((patch, patchIndex) => {
    for(let i = 0; i <= patchDivCount; i++) {
      for(let j = 0; j <= patchDivCount; j++) {
        const x = getPatchPoint(patch.x, i / patchDivCount, j / patchDivCount);
        const y = getPatchPoint(patch.y, i / patchDivCount, j / patchDivCount);
        const r = getPatchPoint(patch.r, i / patchDivCount, j / patchDivCount);
        const g = getPatchPoint(patch.g, i / patchDivCount, j / patchDivCount);
        const b = getPatchPoint(patch.b, i / patchDivCount, j / patchDivCount);
        const z = (r + b + g) / 3;
        const baseIndex = ((i * (patchDivCount + 1)) + j) * 3;
        surfaceElements[baseIndex] = x;
        surfaceElements[baseIndex + 1] = y;
        surfaceElements[baseIndex + 2] = z;
        vertexColors[baseIndex] = r;
        vertexColors[baseIndex + 1] = g;
        vertexColors[baseIndex + 2] = b;
      }
    }
    for (let i = 0; i < patchDivCount; i++) {
      for (let j = 0; j < patchDivCount; j++) {
        const baseIndex = ((patchIndex * (patchFaceCount / 2)) + (i * patchDivCount) + j) * 18;
        /*
        v1----v3
        |   / |
        | /   |
        v2---v4
        */
        const v1_index = (i * (patchDivCount + 1) + j) * 3;
        vertexArray[baseIndex] = surfaceElements[v1_index];
        vertexArray[baseIndex + 1] = surfaceElements[v1_index + 1];
        vertexArray[baseIndex + 2] = surfaceElements[v1_index + 2];

        colorArray[baseIndex] = vertexColors[v1_index];
        colorArray[baseIndex + 1] = vertexColors[v1_index + 1];
        colorArray[baseIndex + 2] = vertexColors[v1_index + 2];

        const v2_index = ((i + 1) * (patchDivCount + 1) + j) * 3;
        vertexArray[baseIndex + 3] = vertexArray[baseIndex + 9] = surfaceElements[v2_index];
        vertexArray[baseIndex + 4] = vertexArray[baseIndex + 10] = surfaceElements[v2_index + 1];
        vertexArray[baseIndex + 5] = vertexArray[baseIndex + 11] = surfaceElements[v2_index + 2];

        colorArray[baseIndex + 3] = colorArray[baseIndex + 9] = vertexColors[v2_index];
        colorArray[baseIndex + 4] = colorArray[baseIndex + 10] = vertexColors[v2_index + 1];
        colorArray[baseIndex + 5] = colorArray[baseIndex + 11] = vertexColors[v2_index + 2];

        const v3_index = (i * (patchDivCount + 1) + (j + 1)) * 3;
        vertexArray[baseIndex + 6] = vertexArray[baseIndex + 12] = surfaceElements[v3_index];
        vertexArray[baseIndex + 7] = vertexArray[baseIndex + 13] = surfaceElements[v3_index + 1];
        vertexArray[baseIndex + 8] = vertexArray[baseIndex + 14] = surfaceElements[v3_index + 2];

        colorArray[baseIndex + 6] = colorArray[baseIndex + 12] = vertexColors[v3_index];
        colorArray[baseIndex + 7] = colorArray[baseIndex + 13] = vertexColors[v3_index + 1];
        colorArray[baseIndex + 8] = colorArray[baseIndex + 14] = vertexColors[v3_index + 2];

        const v4_index = ((i + 1) * (patchDivCount + 1) + (j + 1)) * 3;
        vertexArray[baseIndex + 15] = surfaceElements[v4_index];
        vertexArray[baseIndex + 16] = surfaceElements[v4_index + 1];
        vertexArray[baseIndex + 17] = surfaceElements[v4_index + 2];

        colorArray[baseIndex + 15] = vertexColors[v4_index];
        colorArray[baseIndex + 16] = vertexColors[v4_index + 1];
        colorArray[baseIndex + 17] = vertexColors[v4_index + 2];
      }
    }
  });
  vertices = new Float32Array(vertexArray);
  colors = new Float32Array(colorArray);
  positionBufferAttribute = new THREE.BufferAttribute(vertices, 3);
  positionBufferAttribute.setDynamic(true);
  gradientMeshGeometry.addAttribute('position', positionBufferAttribute);

  colorBufferAttribute = new THREE.BufferAttribute(colors, 3);
  colorBufferAttribute.setDynamic(true);
  gradientMeshGeometry.addAttribute('color', colorBufferAttribute);
  const material = new THREE.MeshBasicMaterial( { color: 0xffffff, vertexColors: THREE.VertexColors, side: THREE.DoubleSide } );
  gradientMesh = new THREE.Mesh( gradientMeshGeometry, material );
  scene.add(gradientMesh);
  console.log(gradientMesh);
  gradientMesh.geometry.attributes.position.needsUpdate = true;
  gradientMesh.geometry.attributes.color.needsUpdate = true;
}

function animateHermiteSurface(t) {
  allPatches.forEach((patch, patchIndex) => {
    for(let i = 0; i <= patchDivCount; i++) {
      for(let j = 0; j <= patchDivCount; j++) {
        const x = getPatchPoint(patch.x, i / patchDivCount, j / patchDivCount);
        const y = getPatchPoint(patch.y, i / patchDivCount, j / patchDivCount);
        const r = getPatchPoint(patch.r, i / patchDivCount, j / patchDivCount);
        const g = getPatchPoint(patch.g, i / patchDivCount, j / patchDivCount);
        const b = getPatchPoint(patch.b, i / patchDivCount, j / patchDivCount);
        const z = (r + b + g) / 3;
        const baseIndex = ((i * (patchDivCount + 1)) + j) * 3;
        surfaceElements[baseIndex] = x;
        surfaceElements[baseIndex + 1] = y;
        surfaceElements[baseIndex + 2] = z;
        vertexColors[baseIndex] = r;
        vertexColors[baseIndex + 1] = g;
        vertexColors[baseIndex + 2] = b;
      }
    }
    for (let i = 0; i < patchDivCount; i++) {
      for (let j = 0; j < patchDivCount; j++) {
        const baseIndex = ((patchIndex * (patchFaceCount / 2)) + (i * patchDivCount) + j) * 18;
        /*
        v1----v3
        |   / |
        | /   |
        v2---v4
        */
        const v1_index = (i * (patchDivCount + 1) + j) * 3;
        vertices[baseIndex] = surfaceElements[v1_index];
        vertices[baseIndex + 1] = surfaceElements[v1_index + 1];
        vertices[baseIndex + 2] = surfaceElements[v1_index + 2];

        colors[baseIndex] = vertexColors[v1_index];
        colors[baseIndex + 1] = vertexColors[v1_index + 1];
        colors[baseIndex + 2] = vertexColors[v1_index + 2];

        const v2_index = ((i + 1) * (patchDivCount + 1) + j) * 3;
        vertices[baseIndex + 3] = vertices[baseIndex + 9] = surfaceElements[v2_index];
        vertices[baseIndex + 4] = vertices[baseIndex + 10] = surfaceElements[v2_index + 1];
        vertices[baseIndex + 5] = vertices[baseIndex + 11] = surfaceElements[v2_index + 2];

        colors[baseIndex + 3] = colors[baseIndex + 9] = vertexColors[v2_index];
        colors[baseIndex + 4] = colors[baseIndex + 10] = vertexColors[v2_index + 1];
        colors[baseIndex + 5] = colors[baseIndex + 11] = vertexColors[v2_index + 2];

        const v3_index = (i * (patchDivCount + 1) + (j + 1)) * 3;
        vertices[baseIndex + 6] = vertices[baseIndex + 12] = surfaceElements[v3_index];
        vertices[baseIndex + 7] = vertices[baseIndex + 13] = surfaceElements[v3_index + 1];
        vertices[baseIndex + 8] = vertices[baseIndex + 14] = surfaceElements[v3_index + 2];

        colors[baseIndex + 6] = colors[baseIndex + 12] = vertexColors[v3_index];
        colors[baseIndex + 7] = colors[baseIndex + 13] = vertexColors[v3_index + 1];
        colors[baseIndex + 8] = colors[baseIndex + 14] = vertexColors[v3_index + 2];

        const v4_index = ((i + 1) * (patchDivCount + 1) + (j + 1)) * 3;
        vertices[baseIndex + 15] = surfaceElements[v4_index];
        vertices[baseIndex + 16] = surfaceElements[v4_index + 1];
        vertices[baseIndex + 17] = surfaceElements[v4_index + 2];

        colors[baseIndex + 15] = vertexColors[v4_index];
        colors[baseIndex + 16] = vertexColors[v4_index + 1];
        colors[baseIndex + 17] = vertexColors[v4_index + 2];
      }
    }
  });
  gradientMesh.geometry.attributes.position.setArray(vertices);
  gradientMesh.geometry.attributes.color.setArray(colors);
  gradientMesh.geometry.attributes.position.needsUpdate = true;
  gradientMesh.geometry.attributes.color.needsUpdate = true;
}
initializeHermiteSurface();

const animate = (t) => {
  animateHermiteSurface(t);
  renderer.render(scene, camera);
	// requestAnimationFrame(() => animate(t + 0.05));
};

animate(0);
