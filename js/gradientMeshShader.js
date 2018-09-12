const gradientMeshShader = {

  uniforms: {

    "tDiffuse": { type: "t", value: null },
    "time":     { type: "f", value: 0.0 },
    "resolution": { type: "vec2", value: { x: 600, y: 600} },
    "controlPoints": {
      value: [
        [{r: 1., g: 1., b: 1.}, {r: 0., g: 1., b: 1.}],
        [{r: 1., g: 0., b: 1.}, {r: 0., g: 1., b: 0.}],
      ]
    }

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

    "void main() {",
    "    vec2 st = gl_FragCoord.xy/resolution.xy;",
    "    st.x *= resolution.x/resolution.y;",

    "    vec3 color = vec3(0.);",
    "    color = vec3(st.x,st.y,abs(sin(time)));",

    "    gl_FragColor = vec4(color,1.0);",
    "}"

  ].join("\n")

};
