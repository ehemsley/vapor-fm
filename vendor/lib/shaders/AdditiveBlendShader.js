/**
 * @author felixturner / http://airtight.cc/
 *
 * modified by evan hemsley / http://ehemsley.me
 *
 * Simple additive buffer blending - makes things glowy
 *
 * based on @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
 * from http://www.clicktorelease.com/code/perlin/lights.html
 *
 * tBase: base texture
 * tAdd: texture to add
 * amount: amount to add 2nd texture
 */

THREE.AdditiveBlendShader = {

	uniforms: {

		"tBase": { type: "t", value: null },
		"tAdd": { type: "t", value: null },
		"amountOne": { type: "f", value: 1.0 },
    "amountTwo": { type: 'f', value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [


		"uniform sampler2D tBase;",
		"uniform sampler2D tAdd;",
		"uniform float amountOne;",
		"uniform float amountTwo;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel1 = texture2D( tBase, vUv );",
			"vec4 texel2 = texture2D( tAdd, vUv );",
			"gl_FragColor = texel1 * amountOne + texel2 * amountTwo;",

		"}"

	].join("\n")

};
