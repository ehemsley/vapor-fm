var visualizerElement = document.getElementById('visualizer');

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

//scene.fog = new THREE.Fog( 0x11051b, 10, 15 );

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x07020a);
renderer.setSize(window.innerWidth, window.innerHeight);
visualizerElement.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry(3, 3, 3);
var material = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: false});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

var lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff});

var lineBoxArray = [];

for (var i = 0; i < 20; i ++) {
  var lineBoxGeometry = new THREE.Geometry();
  lineBoxGeometry.vertices.push(new THREE.Vector3(-20, 10, -10));
  lineBoxGeometry.vertices.push(new THREE.Vector3(20, 10, -10));
  lineBoxGeometry.vertices.push(new THREE.Vector3(20, -10, -10));
  lineBoxGeometry.vertices.push(new THREE.Vector3(-20, -10, -10));
  lineBoxGeometry.vertices.push(new THREE.Vector3(-20, 10, -10));
  var lineBox = new THREE.Line(lineBoxGeometry, lineMaterial);
  lineBoxArray[i] = lineBox;
  scene.add(lineBox);
}

camera.position.z = 5;

var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };

var renderTargetCube = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
var cubeComposer = new THREE.EffectComposer(renderer, renderTargetCube);
var renderPass = new THREE.RenderPass(scene, camera);
cubeComposer.addPass(renderPass);

renderTargetGlow = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
glowComposer = new THREE.EffectComposer(renderer, renderTargetGlow);

var horizontalBlur = new THREE.ShaderPass(THREE.HorizontalBlurShader);
horizontalBlur.uniforms['h'].value = 2.0 / window.innerWidth;

var verticalBlur = new THREE.ShaderPass(THREE.VerticalBlurShader);
verticalBlur.uniforms['v'].value = 2.0 / window.innerHeight;

glowComposer.addPass(renderPass);

glowComposer.addPass(horizontalBlur);
glowComposer.addPass(verticalBlur);
glowComposer.addPass(horizontalBlur);
glowComposer.addPass(verticalBlur);

blendPass = new THREE.ShaderPass(THREE.AdditiveBlendShader);
blendPass.uniforms['tBase'].value = cubeComposer.renderTarget1;
blendPass.uniforms['tAdd'].value = glowComposer.renderTarget1;
blendPass.uniforms['amount'].value = 2.0;
blendComposer = new THREE.EffectComposer(renderer);
blendComposer.addPass(blendPass);

bloomPass = new THREE.BloomPass(3, 12, 2.0, 512);
blendComposer.addPass(bloomPass);

var badTV = new THREE.ShaderPass(THREE.BadTVShader);
badTV.uniforms['distortion'].value = 1.0;
badTV.uniforms['distortion2'].value = 1.0;
badTV.uniforms['speed'].value = 0.1;
badTV.uniforms['rollSpeed'].value = 0.0;
blendComposer.addPass(badTV);

var rgbEffect = new THREE.ShaderPass(THREE.RGBShiftShader);
rgbEffect.uniforms['amount'].value = 0.0015;
rgbEffect.uniforms['angle'].value = 0;
blendComposer.addPass(rgbEffect);

var film = new THREE.ShaderPass(THREE.FilmShader);
film.uniforms['sCount'].value = 800;
film.uniforms['sIntensity'].value = 0.9;
film.uniforms['nIntensity'].value = 0.4;
film.uniforms['grayscale'].value = 0;
blendComposer.addPass(film);

var vignette = new THREE.ShaderPass(THREE.VignetteShader);
vignette.uniforms['darkness'].value = 1;
vignette.uniforms['offset'].value = 1.1;
vignette.renderToScreen = true;
blendComposer.addPass(vignette);

window.addEventListener('resize', onResize, false);

function onResize(){

  var renderW = window.innerWidth;
  var renderH = window.innerHeight;

  camera.aspect = renderW / renderH;
  camera.updateProjectionMatrix();

  renderer.setSize( renderW,renderH);

  renderer.domElement.width = renderW;
  renderer.domElement.height = renderH;
}

var timer = 0;
var xRotationDirection = 1;
var yRotationDirection = -1;

function render() {
  requestAnimationFrame(render);

  timer += 0.01;

  rgbEffect.uniforms['amount'].value = Math.sin(timer * 2) * 0.01;
  badTV.uniforms['time'].value = timer;

  analyser.getByteFrequencyData(frequencyData);
  analyser.getFloatTimeDomainData(floats);

  var rotationAddition = getAverageVolume(frequencyData) / 2000;

  cube.rotation.x += (0.01 + rotationAddition) * xRotationDirection;
  cube.rotation.y += (0.01 + rotationAddition) * yRotationDirection;

  beatdetect.detect(floats);

  var scaleValue = 1.1;
  if (beatdetect.isKick()) {
    cube.scale.x = scaleValue;
    cube.scale.y = scaleValue;
    cube.scale.z = scaleValue;

    badTV.uniforms['distortion'].value = 5 * Math.random();
    badTV.uniforms['distortion2'].value = 5 * Math.random();
    if (Math.random() < 0.05) badTV.uniforms['rollSpeed'].value = (Math.random() < 0.5 ? -1 : 1) * getAverageVolume(frequencyData) / 5000;

    xRotationDirection = Math.random() < 0.5 ? -1 : 1;
    yRotationDirection = Math.random() < 0.5 ? -1 : 1;

  } else {
    cube.scale.x = Math.max(cube.scale.x - 0.001, 1);
    cube.scale.y = Math.max(cube.scale.y - 0.001, 1);
    cube.scale.z = Math.max(cube.scale.z - 0.001, 1);

    badTV.uniforms['distortion'].value = Math.max(badTV.uniforms['distortion'].value - 0.1, 1);
    badTV.uniforms['distortion2'].value = Math.max(badTV.uniforms['distortion2'].value - 0.1, 1);
    if (badTV.uniforms['rollSpeed'].value > 0) {
      badTV.uniforms['rollSpeed'].value = Math.max(badTV.uniforms['rollSpeed'].value - 0.001, 0);
    } else {
      badTV.uniforms['rollSpeed'].value = Math.min(badTV.uniforms['rollSpeed'].value + 0.001, 0);
    }
  }

  for (var i = 0; i < lineBoxArray.length; i++) {
    lineBoxArray[i].scale.x = ((timer + (i * 0.5)) * 0.2) % 1.5;
    lineBoxArray[i].scale.y = ((timer + (i * 0.5)) * 0.2) % 1.5;
  }

  cubeComposer.render(0.1);
  glowComposer.render(0.1);
  blendComposer.render(0.1);
}

render();
