const simpleNoiseShader = {

  uniforms: {

    "tDiffuse": { type: "t", value: null },
    "time":     { type: "f", value: 0.0 },
    "amount":   { type: "f", value: 0.3 },
    "size":     { type: "f", value: 1.0 }
  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

    "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join("\n"),

  fragmentShader: [

    "uniform sampler2D tDiffuse;",
    "uniform float time;",
    "uniform float amount;",
    "uniform float size;",

    "varying vec2 vUv;",

    "float rand(vec2 co) {",
      "return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
    "}",

    "void main() {",
      "vec2 p = vUv;",
      "float xs = floor(gl_FragCoord.x / size);",
      "float ys = floor(gl_FragCoord.y / size);",
      "vec4 snow = vec4(rand(vec2(xs,ys * time))*amount);",
      "vec4 color = texture2D(tDiffuse, p);",
      "vec4 color2 = texture2D(tDiffuse, p + vec2(p.x + snow.x, .01));",
      "vec4 color3 = texture2D(tDiffuse, p - vec2(p.y + snow.y, .01));",
      "gl_FragColor = (color + color2 + color3) / 3.;", //additive
    "}"

  ].join("\n")

};
