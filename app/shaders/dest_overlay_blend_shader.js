module.exports = {
  uniforms: {
    "tSource": { type: "t", value: null },
    "tDest": {type: "t", value: null }
  },

  vertexShader: [
    "varying vec2 vUv;",

    "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
    "}"
  ].join("\n"),

  fragmentShader: [
    "uniform sampler2D tSource;",
    "uniform sampler2D tDest;",
    "varying vec2 vUv;",

    "void main() {",
      "vec4 src = texture2D(tSource, vUv);",
      "vec4 dst = texture2D(tDest, vUv);",

      "gl_FragColor = src * (1.0 - dst.a) + dst;",
    "}"

  ].join("\n")
};
