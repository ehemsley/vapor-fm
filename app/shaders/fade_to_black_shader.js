module.exports = {
  uniforms: {
    "tDiffuse": { type: "t", value: null },
    "fade":     { type: "f", value: 0.0 }
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
    "uniform float fade;",
    "varying vec2 vUv;",

    "void main() {",
      "vec4 color = texture2D(tDiffuse, vUv);",
      "gl_FragColor = color * (1.0 - fade);",
    "}"
  ].join("\n")

};
