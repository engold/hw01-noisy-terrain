import {vec2, vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import Plane from './geometry/Plane';
import MyIcosphere from './geometry/MyIcosphere';
import Mesh from './geometry/Mesh';
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

//let obj0: string = readTextFile('./src/geometry/wahoo.obj')
let obj0: string = readTextFile('./src/geometry/smallFish_normals.obj')

let guiSpeed: number;
let speed: number = 1.0;

let startVar: number = Date.now(); // for u_time

// for drawing fish testing
let testObj: MyIcosphere;
let mesh1: Mesh;

function populateFormationlArray(textFilePath: string): any {
  let theString: string = readTextFile(textFilePath);
  var parsedArray = theString.split('\n');
  let theArray: any = []; // array for the vec3s of instacned pos data
  //console.log(parsedArray);
  for (var i = 0; i < parsedArray.length; i ++){    
    var newArray = parsedArray[i].split(/[ ,]+/);
    //console.log(newArray);
    theArray.push(parseFloat(newArray[0])); 
    theArray.push(parseFloat(newArray[1])); 
    theArray.push(parseFloat(newArray[2]));    
  }
  return theArray;
}

function setFishVBOs(theMesh: Mesh, formationData: any[]){
  let colorsArray = []; 
  let col1Array = []; 
  let col2Array = []; 
  let col3Array = []; 
  let col4Array = [];  
  let scale: number = 1.0;
  let numInstances = formationData.length / 3.0;
  let counter:number = 0;
for(var i = 0; i < numInstances* 3.0; i +=3) {  
  colorsArray.push(0.9333,); // r value
  colorsArray.push(0.3529); // g
  colorsArray.push( 0.1216); // b
  colorsArray.push(0.1 + (i % 30.0) / 31.0); // alpha, use as offset in shader
  // transform column 1
  col1Array.push(scale);
  col1Array.push(0.0);
  col1Array.push(0.0);
  col1Array.push(0.0);
  // transform column 2
  col2Array.push(0.0);
  col2Array.push(scale);
  col2Array.push(0.0);
  col2Array.push(0.0);
  // transform column 3
  col3Array.push(0.0);
  col3Array.push(0.0);
  col3Array.push(scale);
  col3Array.push(0.0);
  // transform column 4
  col4Array.push(formationData[i]); 
  col4Array.push(5 + formationData[i+1] + Math.random()); // random val between 0 and 1 to offset height
  col4Array.push(formationData[i+2]);
  col4Array.push(1.0); 
  
  counter ++;
}
let col1: Float32Array = new Float32Array(col1Array);
let col2: Float32Array = new Float32Array(col2Array);
let col3: Float32Array = new Float32Array(col3Array);
let col4: Float32Array = new Float32Array(col4Array);
let colors: Float32Array = new Float32Array(colorsArray);
console.log(col4Array);
theMesh.setInstanceVBOs(col1, col2, col3, col4, colors);
theMesh.setNumInstances(counter); 
}

let formationArray: any = [];

function loadScene() {
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();

 testObj = new MyIcosphere(vec3.fromValues(3.0, 3.0, 3.0), 1.0, 5.0);
 testObj.create();

 formationArray = populateFormationlArray('./src/geometry/torus.txt');

// tiny fish
 mesh1 = new Mesh(obj0, vec3.fromValues(0.0, 2.0, 0.0));
 mesh1.create(); 
 setFishVBOs(mesh1, formationArray);
// mesh1.setNumInstances(1); // for testing indiviual animation

 // testing for jelly fish - color overwritten in jelly shader
 let scale: number = 2.0;
 let colorsList: number[] = [0.9333, 0.3529, 0.1216, 1.0]; // orange
 let c1Array: number[] = [scale, 0.0, 0.0, 0.0];
 let c2Array: number[] = [0.0, scale, 0.0, 0.0];
 let c3Array: number[] = [0.0, 0.0, scale, 0.0];
 let c4Array: number[] = [0.0, 4.0,  0.0,  1.0]; // displacement
 let col1Array: Float32Array = new Float32Array(c1Array);
 let col2Array: Float32Array = new Float32Array(c2Array);
 let col3Array: Float32Array = new Float32Array(c3Array);
 let col4Array: Float32Array = new Float32Array(c4Array);
 let colorArray: Float32Array = new Float32Array(colorsList);
 // the jelly fish
 testObj.setInstanceVBOs(col1Array, col2Array, col3Array, col4Array, colorArray);
 testObj.setNumInstances(1);

//  let offsetsArray = [];
//   let colorsArray = [];
//   let n: number = 100.0;
//   for(let i = 0; i < n; i++) {
//     for(let j = 0; j < n; j++) {
//       offsetsArray.push(i);
//       offsetsArray.push(j);
//       offsetsArray.push(0);

//       colorsArray.push(i / n);
//       colorsArray.push(j / n);
//       colorsArray.push(1.0);
//       colorsArray.push(1.0); // Alpha channel
//     }
//   }
//   let offsets: Float32Array = new Float32Array(offsetsArray);
//   let colors: Float32Array = new Float32Array(colorsArray);
//   mesh1.setInstanceVBOs(offsets, colors);
//   mesh1.setNumInstances(n * n); // grid of "particles"


  //                                                        100,100
  plane = new Plane(vec3.fromValues(0,0,0), vec2.fromValues(600,300), 20);
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
// for fish and plants
  const instance = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);
  const instanceJellyShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instancedJelly-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instancedJelly-frag.glsl')),
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
    //-------------------------
    instance.setPlanePos(newPos);
    instanceJellyShader.setPlanePos(newPos);
    //---------------------------
    planePos = newPos;

    // update instanced geom here?? - I added this
 
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

    //console.log(camera.position); // camera pos doesnt move when mouse zooms out...

    // set u_Time in the shaders
    lambert.setUTime(Date.now() - startVar);
    flat.setUTime(Date.now() - startVar);
    instance.setUTime(Date.now() - startVar);
    instanceJellyShader.setUTime(Date.now() - startVar);
    // draw the ground/terrain
    renderer.render(camera, lambert, 1.0, [
      plane,
    ]);
      // draw the blue background
    renderer.render(camera, flat, 1.0, [ // added for hw1
      square,
    ]);
    // draw the instanced geometry
    // draw small fish
    renderer.render(camera, instance, 1.0, [
     // testObj, // sphere
      mesh1, // tiny fish
    ]);
    // draw jellyfish
    renderer.render(camera, instanceJellyShader, 1.0, [
      testObj // sphere
  
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
