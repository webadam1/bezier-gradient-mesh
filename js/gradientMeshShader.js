const factorials = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600, 6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000, 6402373705728000, 121645100408832000, 2432902008176640000, 51090942171709440000, 1124000727777607680000, 25852016738884976640000, 620448401733239439360000, 15511210043330985984000000, 403291461126605635584000000, 10888869450418352160768000000, 304888344611713860501504000000, 8841761993739701954543616000000, 265252859812191058636308480000000, 8222838654177922817725562880000000, 263130836933693530167218012160000000, 8683317618811886495518194401280000000, 295232799039604140847618609643520000000];

const shaderCPMatrix = [
  [{r: 0.5, g: 0.2, b: 0.9}, {r: 0., g: 1., b: 1.}, {r: 0., g: 1., b: 0.5}, {r: 0., g: 1., b: 0.5}],
  [{r: 1., g: 0., b: 1.}, {r: 0., g: 0., b: 0.}, {r: 0., g: 0., b: 1.}, {r: 0., g: 1., b: 0.5}],
  [{r: 0., g: 0.5, b: 0.5}, {r: 0., g: 1., b: 1.}, {r: 0.5, g: 0.5, b: 1.}, {r: 0., g: 1., b: 0.5}],
  [{r: 1., g: 1., b: 1.}, {r: 0., g: 1., b: 1.}, {r: 0.5, g: 1., b: 0.5}, {r: 0.8, g: 1., b: 0.5}],
];
const n = shaderCPMatrix.length;
const m = shaderCPMatrix[0].length;
const shaderCoefficientsU = [];
for(let i = 0; i < n; i++) {
  if (i === 0 || i === n) {
    shaderCoefficientsU.push(1);
  } else {
    shaderCoefficientsU.push(factorials[n - 1] / (factorials[i] * factorials[n - i - 1]));
  }
}
const shaderCoefficientsV = [];
for(let j = 0; j < m; j++) {
  if (j === 0 || j === m) {
    shaderCoefficientsV.push(1);
  } else {
    shaderCoefficientsV.push(factorials[m - 1] / (factorials[j] * factorials[m - j - 1]));
  }
}

let shaderCPArray = shaderCPMatrix[0].map(function(col, i){
  return shaderCPMatrix.map(function(row){
    return row[i];
  });
});
shaderCPArray = [].concat(...shaderCPArray.reverse()).reverse();
shaderCPArray = shaderCPArray.map((v) => new THREE.Vector3(v.r, v.g, v.b));

console.log(shaderCPArray);
const gradientMeshShader = {

  uniforms: {

    "tDiffuse": { type: "t", value: null },
    "time":     { type: "f", value: 0.0 },
    "resolution": { type: "v2", value: { x: 600, y: 600} },
    "controlPoints": { type: 'v3[]', value: shaderCPArray },
    "coefficientsU": { type: "f[]", value: shaderCoefficientsU },
    "coefficientsV": { type: "f[]", value: shaderCoefficientsV },

  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join("\n"),

  fragmentShader: [

    "uniform vec2 resolution;",
    "uniform vec2 u_mouse;",
    "uniform float time;",
    `uniform vec3 controlPoints[${shaderCPArray.length}];`,
    `uniform float coefficientsU[${shaderCoefficientsU.length}];`,
    `uniform float coefficientsV[${shaderCoefficientsV.length}];`,

    `#define N ${shaderCPMatrix[0].length}`,
    `#define M ${shaderCPMatrix.length}`,

    "vec3 getColor(float u, float v) {",
      "vec3 color;",
      "for(int i = 0; i < N; i++) {",
          "float polynomialU = coefficientsU[i] * pow(u, float(i)) * pow((1. - u), float(N - i - 1));",
          "for(int j = 0; j < M; j++) {",
            "float polynomialV = coefficientsU[j] * pow(v, float(j)) * pow((1. - v), float(M - j - 1));",
            "color += (controlPoints[i * N + j] * polynomialU * polynomialV);",
          "}",
        "}",
      "return color;",
    "}",

    "void main() {",
      "vec2 st = gl_FragCoord.xy/resolution.xy;",
      "st.x *= resolution.x/resolution.y;",

      "vec3 color = vec3(0.);",
      "color = getColor(st.x, st.y);",

      "gl_FragColor = vec4(color,1.0);",
    "}"

  ].join("\n")

};
