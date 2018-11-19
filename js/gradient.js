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

let hermiteZValues = [
  [0, 0.5, 0, 0.1],
  [0.2, 1, 0.3, 0.5],
  [0.5, 0.5, 0.5, 0],
];

function getHermiteVertexColor({ x, y, z }) {
  let r, g, b;
  r = Math.ceil(((102 * x) + (42 * (1 - x))) / 2);
  g = Math.ceil(((42 * x) + (193 * (1 - x))));
  b = Math.ceil(((193 * x) + (193 * (1 - x))));
  r += Math.ceil(Math.min(Math.max(z, 0), 1) * 255);
  const color = `rgb(${r}, ${g}, ${b})`;
  return new THREE.Color(color);
}

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

function getBatches(zValues) {
  const batches = [];
  const columnLength = zValues.length - 1;
  for (let i = 0; i < columnLength; i++) {
    const rowLength = zValues[i].length - 1;
    for (let j = 0; j < rowLength; j++) {
      const batch = {};
      batch.x = [
        [i / columnLength, (i + 1) / columnLength, 0.5, 0.5],
        [i / columnLength, (i + 1) / columnLength, 0.5, 0.5],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      batch.y = [
        [j / rowLength, j / rowLength, 0, 0],
        [(j + 1) / rowLength, (j + 1) / rowLength, 0, 0],
        [0.5, 0.5, 0, 0],
        [0.5, 0.5, 0, 0],
      ];
      batch.z = [
        [zValues[i][j], zValues[i + 1][j], 0, 0],
        [zValues[i][j + 1], zValues[i + 1][j + 1], 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      batches.push(batch);
    }
  }
  return batches;
}

function getBatchPoint(hermiteBatch, u, v) {
  const Uvec = [[u ** 3], [u ** 2], [u], [1]];
  const Vvec = [[v ** 3], [v ** 2], [v], [1]];
  const vec = multiplyMatrices(multiplyMatrices(multiplyMatrices(multiplyMatrices(transpose(Uvec), HM), hermiteBatch), HM_T), Vvec);
  return vec[0][0];
}

const allBatches = getBatches(hermiteZValues);
let hermiteBatches = new THREE.Group();

function drawHermiteSurface(t) {
	if (hermiteBatches) {
    for (let i = hermiteBatches.children.length - 1; i >= 0; i--) {
      hermiteBatches.remove(hermiteBatches.children[i]);
    }
		scene.remove(hermiteBatches);
	}
  hermiteBatches = new THREE.Group();

  allBatches.forEach((batch) => {
    const surfaceElements = [];
    let vertexColors = [];
    for(let i = 0; i <= hermiteCurveDivisions; i++) {
      for(let j = 0; j <= hermiteCurveDivisions; j++) {
        const x = getBatchPoint(batch.x, i / hermiteCurveDivisions, j / hermiteCurveDivisions);
        const y = getBatchPoint(batch.y, i / hermiteCurveDivisions, j / hermiteCurveDivisions);
        const z = getBatchPoint(batch.z, i / hermiteCurveDivisions, j / hermiteCurveDivisions);
        const vertex = new THREE.Vector3(
          x,
          y,
          z * ((Math.cos(t + x * 2) + 1) / 2)
        );
        surfaceElements.push(vertex);
        vertexColors.push(getHermiteVertexColor(vertex));
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
    hermiteSurface.material.side = THREE.DoubleSide;
    hermiteBatches.add(hermiteSurface);
  });
  scene.add(hermiteBatches);
}

//COMPOSER
const composer = new THREE.EffectComposer(renderer);

//PASSES
const renderPass = new THREE.RenderPass(scene, camera);
composer.addPass(renderPass);

const shaderPass = new THREE.ShaderPass(gradientMeshShader);
composer.addPass(shaderPass);

shaderPass.renderToScreen = true;
shaderPass.uniforms.resolution.value = {x: parentElement.clientWidth, y: parentElement.clientHeight };

const animate = (t) => {
  // drawBezierSurface(t);
	composer.render();
  shaderPass.uniforms.time.value = t / 3;
	requestAnimationFrame(() => animate(t + 0.05));
};

animate(0);
