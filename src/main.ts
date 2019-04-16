import {vec2, vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import Plane from './geometry/Plane';
//import Mesh from './geometry/Mesh';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import {readTextFile} from './globals';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  'Load Scene': loadScene, // A function pointer, essentially
  'Swim Speed' : 1.0,
  //SeaLevel: 0.75, //added for hw1
  //timeOfDay: 1, // added for hw1
 // GlacierHeight: 1, // added for hw1
};

let square: Square;
let plane : Plane;
let wPressed: boolean;
let aPressed: boolean;
let sPressed: boolean;
let dPressed: boolean;
let planePos: vec2;

let obj0: string = readTextFile('./src/geometry/wahoo.obj')

let guiSpeed: number;
let speed: number = 1.0;

let startVar: number = Date.now(); // for u_time

function loadScene() {
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  //                                                        100,100
  plane = new Plane(vec3.fromValues(0,0,0), vec2.fromValues(400,300), 20);
  plane.create();

  wPressed = false;
  aPressed = false;
  sPressed = false;
  dPressed = false;
  planePos = vec2.fromValues(0,0);
}

function main() {
  window.addEventListener('keypress', function (e) {
    // console.log(e.key);
    switch(e.key) {
      case 'w':
      wPressed = true;
      break;
      case 'a':
      aPressed = true;
      break;
      case 's':
      sPressed = true;
      break;
      case 'd':
      dPressed = true;
      break;
    }
  }, false);

  window.addEventListener('keyup', function (e) {
    switch(e.key) {
      case 'w':
      wPressed = false;
      break;
      case 'a':
      aPressed = false;
      break;
      case 's':
      sPressed = false;
      break;
      case 'd':
      dPressed = false;
      break;
    }
  }, false);

  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
    //added for hw1
 gui.add(controls, 'Swim Speed', 1.0, 5.0).step(.1);
//gui.add(controls, 'SeaLevel', 0.45, 3.0).step(.025);
//gui.add(controls, 'GlacierHeight', 1, 1.5).step(.05);
//gui.add(controls, 'timeOfDay', 0, 10).step(1);



  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 10, -20), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(164.0 / 255.0, 233.0 / 255.0, 1.0, 1);
  gl.enable(gl.DEPTH_TEST);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/terrain-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/terrain-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  function processKeyPresses() {
    let velocity: vec2 = vec2.fromValues(0,0);
    if(wPressed) {
      //velocity[1] += 1.0;
      velocity[1] += 0.5* speed;
    }
    if(aPressed) {
      //velocity[0] += 1.0;
      velocity[0] += 0.5* speed;
    }
    if(sPressed) {
     // velocity[1] -= 1.0;
      velocity[1] -= 0.5* speed;
    }
    if(dPressed) {
      //velocity[0] -= 1.0;
      velocity[0] -= 0.5* speed;
    }
    let newPos: vec2 = vec2.fromValues(0,0);
    vec2.add(newPos, velocity, planePos);
    lambert.setPlanePos(newPos);
    planePos = newPos;
  }

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

    if (guiSpeed - controls["Swim Speed"] != 0){
      guiSpeed = controls["Swim Speed"];
      speed = controls["Swim Speed"];
    }
   
    processKeyPresses();

  // added for hw1 to turn on animating
  //activate u_time or set it to 0
  // if(controls["Activate Global Warming"] != false){
  //    lambert.setUTime(Date.now() - startVar);
  // }else{ // set time == 0
  //     lambert.setUTime(0);
  // }

    lambert.setUTime(Date.now() - startVar);
    flat.setUTime(Date.now() - startVar);
    // add for hw1 
    renderer.render(camera, lambert, .10, [
      plane,
    ]);
    // added or hw1, set glacierHeight
   // lambert.setGlacierHeightVar(controls.GlacierHeight);

    renderer.render(camera, flat, 1.0, [ // added for hw1
      square,
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
