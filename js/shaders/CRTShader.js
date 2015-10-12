THREE.CRTShader = {
  uniforms: {
    "tDiffuse": { type: "t", value: null },
    "time": { type: "f", value: 0.0}
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
    "varying vec2 vUv;",

    "vec2 curve(vec2 uv)",
    "{",
      "uv = (uv - 0.5) * 2.0;",
      "uv *= 1.1;",
      "uv.x *= 1.0 + pow((abs(uv.y) / 5.0), 2.0);",
      "uv.y *= 1.0 + pow((abs(uv.x) / 4.0), 2.0);",
      "uv = (uv / 2.0) + 0.5;",
      "uv = uv * 0.92 + 0.04;",
      "return uv;",
    "}",

    "void main() {",
      "vec2 uv = curve(vUv);",
      "vec3 original_color = texture2D(tDiffuse, vUv).xyz;",
      "vec3 color;",
      "float x = sin(0.3 * time + uv.y * 21.0) * sin(0.7 * time + uv.y * 29.0) * sin(0.3+0.33*time + uv.y*31.0)*0.0017;",

      "color.r = texture2D(tDiffuse, vec2(x+uv.x+0.001, uv.y+0.001)).x + 0.05;",
      "color.g = texture2D(tDiffuse, vec2(x+uv.x,uv.y-0.002)).y + 0.05;",
      "color.b = texture2D(tDiffuse, vec2(x+uv.x-0.002,uv.y)).z + 0.05;",
      "color.r += 0.08*texture2D(tDiffuse, 0.75*vec2(x+0.025,-0.027)+vec2(uv.x+0.001,uv.y+0.001)).x;",
      "color.g += 0.05*texture2D(tDiffuse, 0.75*vec2(x-0.022,-0.02)+vec2(uv.x,uv.y-0.002)).y;",
      "color.b += 0.08*texture2D(tDiffuse, 0.75*vec2(x-0.02, -0.018)+vec2(uv.x-0.002, uv.y)).z;",

      "color = clamp(color*0.6+0.4*color*color*1.0, 0.0, 1.0);",
      "float vignette = (16.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y));",
      "color *= vec3(pow(vignette, 0.3));",

      "color *= vec3(0.95, 1.05, 0.95);",
      "color *= 2.8;",

      "color *= 1.0+0.01*sin(110.0*time);",
      "if (uv.x < 0.0 || uv.x > 1.0)",
        "color *= 0.0;",
      "if (uv.y < 0.0 || uv.y > 1.0)",
        "color *= 0.0;",

      "gl_FragColor = vec4(color, 1.0);",

    "}"
  ].join("\n")
};
