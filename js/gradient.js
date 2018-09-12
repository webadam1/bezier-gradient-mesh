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
const bezierCurveDivisions = 20;
let bezierSurface, bezierSurfaceGeometry, bezierSurfaceMaterial;

let bezierZValues = [
  [0, 0, 5, 4, 4],
  [0, 8, -10, 0, 8],
  [0, 4, 8, 2, -5],
  [4, -2, 0, 5, 8],
  [0, 0, 8, 0, 0]
];

const xLength = bezierZValues[0].length - 1;
const yLength = bezierZValues.length - 1;

const startColor = new THREE.Color(0x662ac1);
const endColor = new THREE.Color(0x2ac1c1);

let bezierControlPoints = bezierZValues.map(
  (array, i) => array.map(
    (value, j) => new THREE.Vector3(j / xLength, i / yLength, value)
  )
);

function getVertexColor(vertex) {
  const zColor1 = new THREE.Color(0xff5500).multiplyScalar(vertex.z);
  const xColor1 = startColor.clone()
		.multiplyScalar(1 - vertex.x)
		.add(endColor.clone().multiplyScalar(vertex.x));
  zColor1.add(xColor1);
  return zColor1;
}

function getPoint(controlPoints, u, v) {
	const vector = new THREE.Vector3(0, 0, 0);
	const n = controlPoints.length;
	const m = controlPoints[0].length;
  const coefficientsU = [];
  for(let i = 0; i < n; i++) {
    if (i === 0 || i === n) {
      coefficientsU.push(1);
    } else {
      coefficientsU.push(factorials[n - 1] / (factorials[i] * factorials[n - i - 1]));
    }
  }
  const coefficientsV = [];
  for(let j = 0; j < m; j++) {
    if (j === 0 || j === m) {
      coefficientsV.push(1);
    } else {
      coefficientsV.push(factorials[m - 1] / (factorials[j] * factorials[m - j - 1]));
    }
  }
  for(let i = 0; i < n; i++) {
    const polynomialU = coefficientsU[i] * (u ** i) * ((1 - u) ** (n - i - 1));
    for(let j = 0; j < m; j++) {
      const polynomialV = coefficientsV[j] * (v ** j) * ((1 - v) ** (m - j - 1));
      vector.add(controlPoints[i][j].clone().multiplyScalar(polynomialU * polynomialV));
    }
  }
	return vector;
}

function drawBezierSurface(t) {
	if (bezierSurface) {
		scene.remove(bezierSurface);
		bezierSurface.material.dispose();
		bezierSurface.geometry.dispose();
		bezierSurface = undefined;
	}

	bezierControlPoints = bezierZValues.map(
		(array, i) => array.map(
			(value, j) => new THREE.Vector3(
        (j > xLength * 0.3 && j < xLength * 0.7) ? ((Math.sin((t + i) * 0.5) + 1) * 3 * ((j % 2) * 8 - 0.25) + j) / (xLength + 1) : j / xLength,
        (i > 0 && i < yLength) ? ((Math.sin((t + j) * 0.75) + 1) * 2 + i) / (yLength + 1) : i / yLength,
				((Math.sin(t / 4 + j) + 1) / 3) * value / 2)
		)
	);

  const surfaceElements = [];
  const vertexColors = [];

  for(let i = 0; i <= bezierCurveDivisions; i++) {
    for(let j = 0; j <= bezierCurveDivisions; j++) {
      const vertex = getPoint(bezierControlPoints, i / bezierCurveDivisions, j /bezierCurveDivisions);
      surfaceElements.push(vertex);
      vertexColors.push(getVertexColor(vertex));
    }
  }

	// now we've got full bezier model, it's time to create bezier surface and add it to the scene
	const bezierSurfaceVertices = surfaceElements;
	const bezierSurfaceFaces = [];
	// creating faces from vertices
	let v1, v2, v3, v4, face1, face2;  // vertex indices in bezierSurfaceVertices array
	for (let i = 0; i < bezierCurveDivisions; i++) {
		for (let j = 0; j < bezierCurveDivisions; j++) {
			v1 = i * (bezierCurveDivisions + 1) + j;
			v2 = (i + 1) * (bezierCurveDivisions + 1) + j;
			v3 = i * (bezierCurveDivisions + 1) + (j + 1);
			v4 = (i + 1) * (bezierCurveDivisions + 1) + (j + 1);

      face1 = new THREE.Face3(v1, v2, v3);
      face1.vertexColors = [vertexColors[v1], vertexColors[v2], vertexColors[v3]];
      face2 = new THREE.Face3(v2, v4, v3);
      face2.vertexColors = [vertexColors[v2], vertexColors[v4], vertexColors[v3]];
			bezierSurfaceFaces.push( face1 );
			bezierSurfaceFaces.push( face2 );
		}
	}
	bezierSurfaceGeometry = new THREE.Geometry();
  bezierSurfaceGeometry.vertices = bezierSurfaceVertices;
  bezierSurfaceGeometry.faces = bezierSurfaceFaces;
	bezierSurfaceGeometry.computeFaceNormals();
	bezierSurfaceGeometry.computeVertexNormals();
	bezierSurfaceMaterial = new THREE.MeshBasicMaterial({ color: 0xaabbff, vertexColors: THREE.VertexColors });
	bezierSurface = new THREE.Mesh(bezierSurfaceGeometry, bezierSurfaceMaterial);
	bezierSurface.material.side = THREE.DoubleSide;
	scene.add(bezierSurface);
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
