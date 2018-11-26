const gradientMeshShader = {

  uniforms: {
    "time":     { type: "f", value: 0.0 },
    "resolution": { type: "v2", value: { x: 600, y: 600} },
  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join("\n"),

  fragmentShader: [
    "uniform float time;",
    "uniform vec2 resolution;",
    `
    vec4 mod289(vec4 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    vec4 permute(vec4 x) {
      return mod289(((x*34.0)+1.0)*x);
    }
    vec4 taylorInvSqrt(vec4 r) {
      return 1.79284291400159 - 0.85373472095314 * r;
    }
    vec2 fade(vec2 t) {
      return t*t*t*(t*(t*6.0-15.0)+10.0);
    }
    float cnoise(vec2 P) {
      vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
      vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
      Pi = mod289(Pi); // To avoid truncation effects in permutation
      vec4 ix = Pi.xzxz;
      vec4 iy = Pi.yyww;
      vec4 fx = Pf.xzxz;
      vec4 fy = Pf.yyww;
    
      vec4 i = permute(permute(ix) + iy);
    
      vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
      vec4 gy = abs(gx) - 0.5 ;
      vec4 tx = floor(gx + 0.5);
      gx = gx - tx;
    
      vec2 g00 = vec2(gx.x,gy.x);
      vec2 g10 = vec2(gx.y,gy.y);
      vec2 g01 = vec2(gx.z,gy.z);
      vec2 g11 = vec2(gx.w,gy.w);
    
      vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
      g00 *= norm.x;  
      g01 *= norm.y;  
      g10 *= norm.z;  
      g11 *= norm.w;  
    
      float n00 = dot(g00, vec2(fx.x, fy.x));
      float n10 = dot(g10, vec2(fx.y, fy.y));
      float n01 = dot(g01, vec2(fx.z, fy.z));
      float n11 = dot(g11, vec2(fx.w, fy.w));
    
      vec2 fade_xy = fade(Pf.xy);
      vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
      float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
      return 2.3 * n_xy;
    }
    
    float pnoise(vec2 P, vec2 rep){
      vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
      vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
      Pi = mod(Pi, rep.xyxy); // To create noise with explicit period
      Pi = mod289(Pi);        // To avoid truncation effects in permutation
      vec4 ix = Pi.xzxz;
      vec4 iy = Pi.yyww;
      vec4 fx = Pf.xzxz;
      vec4 fy = Pf.yyww;
    
      vec4 i = permute(permute(ix) + iy);
    
      vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
      vec4 gy = abs(gx) - 0.5 ;
      vec4 tx = floor(gx + 0.5);
      gx = gx - tx;
    
      vec2 g00 = vec2(gx.x,gy.x);
      vec2 g10 = vec2(gx.y,gy.y);
      vec2 g01 = vec2(gx.z,gy.z);
      vec2 g11 = vec2(gx.w,gy.w);
    
      vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
      g00 *= norm.x;  
      g01 *= norm.y;  
      g10 *= norm.z;  
      g11 *= norm.w;  
    
      float n00 = dot(g00, vec2(fx.x, fy.x));
      float n10 = dot(g10, vec2(fx.y, fy.y));
      float n01 = dot(g01, vec2(fx.z, fy.z));
      float n11 = dot(g11, vec2(fx.w, fy.w));
    
      vec2 fade_xy = fade(Pf.xy);
      vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
      float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
      return 2.3 * n_xy;
    }`,

    `float random (in vec2 st, float seed) {
        return fract(sin(dot(st.xy,
                             vec2(12.9898,78.233) * seed))
                     * 43758.5453123);
    }
   
    float random (in vec2 st) {
        return fract(sin(dot(st.xy,
                             vec2(12.9898,78.233)))
                     * 43758.5453123);
    }
    
    float noise (in vec2 st, float seed) {
        vec2 i = floor(st);
        vec2 f = fract(st);
    
        // Four corners in 2D of a tile
        float a = random(i, seed);
        float b = random(i + vec2(1.0, 0.0), seed);
        float c = random(i + vec2(0.0, 1.0), seed);
        float d = random(i + vec2(1.0, 1.0), seed);
    
        vec2 u = f*f*(3.0-2.0*f);
        
        return mix(a, b, u.x) +
                (c - a)* u.y * (1.0 - u.x) +
                (d - b) * u.x * u.y;
    }
    
    float noise (in vec2 _st) {
        vec2 i = floor(_st);
        vec2 f = fract(_st);
    
        // Four corners in 2D of a tile
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
    
        vec2 u = f * f * (3.0 - 2.0 * f);
    
        return mix(a, b, u.x) +
                (c - a)* u.y * (1.0 - u.x) +
                (d - b) * u.x * u.y;
    }
    
    float fbm ( in vec2 _st) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      // Rotate to reduce axial bias
      mat2 rot = mat2(cos(0.5), sin(0.5),
                      -sin(0.5), cos(0.50));
      for (int i = 0; i < 5; ++i) {
          v += a * noise(_st);
          _st = rot * _st * 2.0 + shift;
          a *= 0.5;
      }
      return v;
    }
    
    float noise2 (in vec2 st, float seed) {
        vec2 i = floor(st);
        vec2 f = fract(st);
    
        // Four corners in 2D of a tile
        float a = random(i, seed);
        float b = random(i + vec2(1.0, 0.0), seed);
        float c = random(i + vec2(0.0, 1.0), seed);
        float d = random(i + vec2(1.0, 1.0), seed);
    
        vec2 u = f*f*(3.0-2.0*f);
        
        return mix(a, b, u.x) +
                (c - a)* u.y * (1.0 - u.x) +
                (d - b) * u.x * u.y;
    }`,

    "void main() {",
    " vec2 st = gl_FragCoord.xy;",
    " vec2 pos = vec2(st * 0.0001 * (5. - sin(time)));",
    " float n = noise(pos, sin(time) + 1.);",
    " float b = noise(pos, sin(time - 100.) + 100.);",

    " float color = pnoise(st, vec2(n * b, sin(time)));",

    " float x = cnoise(vec2(st.x + time * 3., st.y * 0.06));",
    " float y = cnoise(vec2(st.x * 0.01, (st.y + time* 1000.) * 0.003));",
    " float z = cnoise(vec2((st.x + time * 10000.) * 0.003, (st.y + time * 1000.) * 0.01));",

    `st /= 50.;
    vec3 cloudColor = vec3(0.0);

    vec2 q = vec2(0.);
    q.x = fbm( st + 0.00*time);
    q.y = fbm( st + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 10.*time );
    r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 10.*time);

    float f = fbm(vec2(st.x + 0.5 * z, (st.y * b) / 10000.));
    float asd = fbm(vec2(st.x / (20. + r.x) - (time + b + (z * z)), st.y / (5. + z) - time));
    cloudColor = mix(cloudColor,
      vec3(1,1,1),
      clamp(length(r.x),0.0,1.0));`,

    "float c = asd * asd * asd * asd * f * 30. * color * color * x;",
    "//c = asd * asd * asd * asd;",
    " gl_FragColor = vec4(c, c, c, 1.0);",
    "}"

  ].join("\n")

};
