const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const ASPECT = HEIGHT /WIDTH;

var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera( 0, 1, 0, ASPECT, 1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

camera.position.z = 5;
const bezierCurveDivisions = 50;
var bezierSurface, bezierSurfaceGeometry, bezierSurfaceMaterial;

var bezierZValues = [
  [0, 0, 1, 0],
  [-1, 5, -5, 5],
  [5, -1, 5, -1],
  [0, 1, 0, 0]
];

const xlength = bezierZValues[0].length - 1;
const ylength = bezierZValues.length - 1;

var bezierControlPoints = bezierZValues.map(
  (array, i) => array.map(
    (value, j) => new THREE.Vector3(j / xlength, i / ylength, value)
  )
);

function drawBezierSurface(t) {
  if (bezierSurface) {
    scene.remove(bezierSurface);
    bezierSurface.material.dispose();
    bezierSurface.geometry.dispose();
    bezierSurface = undefined;
  }
	var basicBezierModel = [];  // 4 bezier curves calculated from bezier control points
	// calculating basic bezier model (main 4 bezier curves)
  bezierControlPoints = bezierZValues.map(
    (array, i) => array.map(
      (value, j) => new THREE.Vector3(j / xlength, i / ylength, ((Math.sin(t + j) + 1) / 2) * value)
    )
  );

	for (var i=0; i < bezierControlPoints.length; i++) {
		var bezier = new THREE.CubicBezierCurve3(
			bezierControlPoints[i][0],
			bezierControlPoints[i][1],
			bezierControlPoints[i][2],
			bezierControlPoints[i][3]
		)
		basicBezierModel.push( bezier.getPoints(bezierCurveDivisions) );
	}
	var bezierCurvesVertices = [];
	// calculating full bezier model (50 bezier curves in one direction, each containing 50 vertices)
	for (var i=0; i <= bezierCurveDivisions; i++) {
		var bezier = new THREE.CubicBezierCurve3(
			basicBezierModel[0][i],
			basicBezierModel[1][i],
			basicBezierModel[2][i],
			basicBezierModel[3][i]
		)
		bezierCurvesVertices = bezierCurvesVertices.concat( bezier.getPoints(bezierCurveDivisions) );
	}
	// now we've got full bezier model, it's time to create bezier surface and add it to the scene
	var bezierSurfaceVertices = bezierCurvesVertices;
	var bezierSurfaceFaces = [];
	// creating faces from vertices
	var v1, v2, v3, v4, face1, face2;  // vertex indices in bezierSurfaceVertices array
	for (var i=0; i < bezierCurveDivisions; i++) {
		for (var j=0; j < bezierCurveDivisions; j++) {
			v1 = i * (bezierCurveDivisions + 1) + j;
			v2 = (i+1) * (bezierCurveDivisions + 1) + j;
			v3 = i * (bezierCurveDivisions + 1) + (j+1);
			v4 = (i+1) * (bezierCurveDivisions + 1) + (j+1);

      var color1 = new THREE.Color(0xffffff);
      color1.multiplyScalar(bezierCurvesVertices[v1].z / 2);
      var color2 = new THREE.Color(0xffffff);
      color2.multiplyScalar(bezierCurvesVertices[v2].z / 2);
      var color3 = new THREE.Color(0xffffff);
      color3.multiplyScalar(bezierCurvesVertices[v3].z / 2);
      var color4 = new THREE.Color(0xffffff);
      color4.multiplyScalar(bezierCurvesVertices[v4].z / 2);

      face1 = new THREE.Face3(v1, v2, v3);
      face1.vertexColors = [color1, color2, color3];
      face2 = new THREE.Face3(v2, v4, v3);
      face2.vertexColors = [color2, color4, color3];
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

var animate = function (t) {
  drawBezierSurface(t);
	renderer.render( scene, camera );
  requestAnimationFrame(() => animate(t + 0.05));
};

animate(0);
