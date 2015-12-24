module.exports = {
  uniforms: {
    "tDiffuse": { type: "t", value: null },
    "time": { type: "f", value: 0.0},
    "amount": { type: "f", value: 0.0}
  },

  vertexShader: [
    "varying vec2 vUv;",

    "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
    "}"
  ].join("\n"),

  fragmentShader: [
    "uniform sampler2D tDiffuse;",
    "uniform float time;",
    "uniform float amount;",

    "varying vec2 vUv;",

    "highp float rand(vec2 co)",
    "{",
      "highp float a = 12.9898;",
      "highp float b = 78.233;",
      "highp float c = 43758.5453;",
      "highp float dt= dot(co.xy ,vec2(a,b));",
      "highp float sn= mod(dt,3.14);",
      "return fract(sin(sn) * c);",
    "}",

    "void main() {",
      "vec2 uv = vUv;",
      "uv.x += (rand(vec2(time, gl_FragCoord.y)-0.5)/64.0) * amount;",
      "uv.y += (rand(vec2(time)-0.5)/32.0) * amount;",
      "vec4 color = texture2D(tDiffuse, uv);",

      "gl_FragColor = color;",
    "}"

  ].join("\n")
};
