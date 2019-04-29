import {vec2, vec3, mat4} from 'gl-matrix';
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
let obj0: string = readTextFile('./src/geometry/smallFish_normals.obj');
let squareFishString: string = readTextFile('./src/geometry/squareFish_normals.obj');
let swObj: string = readTextFile('./src/geometry/seaweed_moreVerts.obj'); //readTextFile('./src/geometry/seaweed.obj');
let sharkString: string = readTextFile('./src/geometry/Shark.obj');
let ruddString: string = readTextFile('./src/geometry/Rudd_Fish.obj');
let coralBString: string = readTextFile('./src/geometry/finalCoralBottom2.obj');
let coralTString: string = readTextFile('./src/geometry/finalCoralTop.obj');
let mantaString: string = readTextFile('./src/geometry/manta.obj');

let guiSpeed: number;
let speed: number = 1.0;

let startVar: number = Date.now(); // for u_time

// for drawing fish testing
let testObj: MyIcosphere;
let mesh1: Mesh;
let goldfish: Mesh;
let jellyMesh: Mesh;
let jellyField: Mesh;
let squareFish: Mesh;
let squareFish2: Mesh;
let seaOfWeed: Mesh;
let seaWeed2: Mesh;
let seaWeed3: Mesh;
let seaWeed4: Mesh;
let seaWeed1: Mesh;
let shark: Mesh;
let rudd: Mesh;
let coralBottom: Mesh;
let coralTop: Mesh;
let mantaRay: Mesh;
let mantaRay2: Mesh;
let mantasInTheBack: Mesh;
let orangeFishSchool1: Mesh;

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

// for the yellow fish
// set them at the back of the barren ground land biome
function setFishVBOs2(theMesh: Mesh, formationData: any[],t :vec3){
  let colorsArray = []; 
  let col1Array = []; 
  let col2Array = []; 
  let col3Array = []; 
  let col4Array = [];  
  let scale: number = 3.5;
  let numInstances = formationData.length / 3.0;
  let counter:number = 0;

  let overallMat = mat4.create();
  let translateMat = mat4.create();
  let scalelMat = mat4.create();


for(var i = 0; i < numInstances* 3.0; i +=3) {  
  //reset
  overallMat = mat4.create();
  translateMat = mat4.create();
  scalelMat = mat4.create();

  mat4.fromScaling(scalelMat, vec3.fromValues(scale,scale,scale));
  mat4.fromTranslation(translateMat, vec3.fromValues(t[0] + formationData[i], 4.0 + t[1] + formationData[i+1] + Math.random(),t[2] + formationData[i+2] ));
  mat4.multiply(overallMat, overallMat, scalelMat);
  mat4.multiply(overallMat, overallMat, translateMat);

// yellow  
  colorsArray.push(1.0  - (Math.random() * (.2 - 0.01) + 0.01)); // r value
  colorsArray.push(1.0 - (Math.random() * (.2 - 0.01) + 0.01)); // g
  colorsArray.push( 0.0 + (Math.random() * (.2 - 0.01) + 0.01)); // b
  colorsArray.push(0.1 + (i % 30.0) / 31.0); // alpha, use as offset in shader
  // transform column 1
  col1Array.push(overallMat[0]);
  col1Array.push(overallMat[1]);
  col1Array.push(overallMat[2]);
  col1Array.push(overallMat[3]);
  // transform column 
  col2Array.push(overallMat[4]);
  col2Array.push(overallMat[5]);
  col2Array.push(overallMat[6]);
  col2Array.push(overallMat[7]);
  // transform column 3
  col3Array.push(overallMat[8]);
  col3Array.push(overallMat[9]);
  col3Array.push(overallMat[10]);
  col3Array.push(overallMat[11]);
  // transform column 4
  col4Array.push(overallMat[12]); 
  col4Array.push(overallMat[13]); // random val between 0 and 1 to offset height
  col4Array.push(overallMat[14]);
  col4Array.push(overallMat[15]); 
  
  counter ++;
}
let col1: Float32Array = new Float32Array(col1Array);
let col2: Float32Array = new Float32Array(col2Array);
let col3: Float32Array = new Float32Array(col3Array);
let col4: Float32Array = new Float32Array(col4Array);
let colors: Float32Array = new Float32Array(colorsArray);
//console.log(col4Array);
theMesh.setInstanceVBOs(col1, col2, col3, col4, colors);
theMesh.setNumInstances(counter); 
}

function setFishVBOs(theMesh: Mesh, formationData: any[], t: vec3){
  let colorsArray = []; 
  let col1Array = []; 
  let col2Array = []; 
  let col3Array = []; 
  let col4Array = [];  
  let scale: number = 5;
  let numInstances = formationData.length / 3.0;
  let counter:number = 0;

  let overallMat = mat4.create();
  let translateMat = mat4.create();
  let scalelMat = mat4.create();

for(var i = 0; i < numInstances* 3.0; i +=3) {
  
  //reset
  overallMat = mat4.create();
  translateMat = mat4.create();
  scalelMat = mat4.create();

  mat4.fromScaling(scalelMat, vec3.fromValues(scale,scale,scale));
  mat4.fromTranslation(translateMat, vec3.fromValues(t[0] + formationData[i], t[1] + formationData[i+1] + Math.random(), t[2] +formationData[i+2] ));
  mat4.multiply(overallMat, overallMat, scalelMat);
  mat4.multiply(overallMat, overallMat, translateMat);
  
  colorsArray.push(0.9333  + (Math.random() * (.06667 - 0.01) + 0.01)); // r value
  colorsArray.push(0.3529 + (Math.random() * (0.15 - 0.01) + 0.01)); // g
  colorsArray.push( 0.1216 + (Math.random() * (0.15 - 0.01) + 0.01)); // b
  colorsArray.push(0.1 + (i % 30.0) / 31.0); // alpha, use as offset in shader
  // transform column 1
  col1Array.push(overallMat[0]);
  col1Array.push(overallMat[1]);
  col1Array.push(overallMat[2]);
  col1Array.push(overallMat[3]);
  // transform column 
  col2Array.push(overallMat[4]);
  col2Array.push(overallMat[5]);
  col2Array.push(overallMat[6]);
  col2Array.push(overallMat[7]);
  // transform column 3
  col3Array.push(overallMat[8]);
  col3Array.push(overallMat[9]);
  col3Array.push(overallMat[10]);
  col3Array.push(overallMat[11]);
  // transform column 4
  col4Array.push(overallMat[12]); 
  col4Array.push(overallMat[13]); // random val between 0 and 1 to offset height
  col4Array.push(overallMat[14]);
  col4Array.push(overallMat[15]); 
  
  counter ++;
}
let col1: Float32Array = new Float32Array(col1Array);
let col2: Float32Array = new Float32Array(col2Array);
let col3: Float32Array = new Float32Array(col3Array);
let col4: Float32Array = new Float32Array(col4Array);
let colors: Float32Array = new Float32Array(colorsArray);
//console.log(col4Array);
theMesh.setInstanceVBOs(col1, col2, col3, col4, colors);
theMesh.setNumInstances(counter); 
}


//jellyfish
function setJellyVBOs(theMesh: Mesh,t :vec3, numInstances:number){
  let colorsArray = []; 
  let col1Array = []; 
  let col2Array = []; 
  let col3Array = []; 
  let col4Array = [];  
  let scale: number = 8.0;
  let counter:number = 0;

  let overallMat = mat4.create();
  let translateMat = mat4.create();
  let scalelMat = mat4.create();

  let temp: number = 0;


for(var i = 0; i < numInstances; i ++) {  
  //reset
  overallMat = mat4.create();
  translateMat = mat4.create();
  scalelMat = mat4.create();

  if( i%2 != 0.0){
      temp = -i;
  }
  else{
    temp = i;
  }

  mat4.fromScaling(scalelMat, vec3.fromValues(scale,scale,scale));
  mat4.fromTranslation(translateMat, vec3.fromValues(t[0] + temp*2.5 + Math.random(),
                                                     t[1] + Math.random() * 2.0,
                                                     t[2]+ temp * 2.5 + Math.random()));
  mat4.multiply(overallMat, overallMat, scalelMat);
  mat4.multiply(overallMat, overallMat, translateMat);

// purple,  vec3(0.8314, 0.1647, 1.0);
  colorsArray.push(0.8314 + (Math.random() * (.0169 - 0.01) + 0.01)); // r value
  colorsArray.push(0.1647 + (Math.random() * (.2 - 0.01) + 0.01)); // g
  colorsArray.push(1.0 - (Math.random() * (.2 - 0.01) + 0.01)); // b
  colorsArray.push(0.1 + (i % 30.0) / 31.0); // alpha, use as offset in shader
  // transform column 1
  col1Array.push(overallMat[0]);
  col1Array.push(overallMat[1]);
  col1Array.push(overallMat[2]);
  col1Array.push(overallMat[3]);
  // transform column 
  col2Array.push(overallMat[4]);
  col2Array.push(overallMat[5]);
  col2Array.push(overallMat[6]);
  col2Array.push(overallMat[7]);
  // transform column 3
  col3Array.push(overallMat[8]);
  col3Array.push(overallMat[9]);
  col3Array.push(overallMat[10]);
  col3Array.push(overallMat[11]);
  // transform column 4
  col4Array.push(overallMat[12]); 
  col4Array.push(overallMat[13]); // random val between 0 and 1 to offset height
  col4Array.push(overallMat[14]);
  col4Array.push(overallMat[15]); 
  
  counter ++;
}
  let col1: Float32Array = new Float32Array(col1Array);
  let col2: Float32Array = new Float32Array(col2Array);
  let col3: Float32Array = new Float32Array(col3Array);
  let col4: Float32Array = new Float32Array(col4Array);
  let colors: Float32Array = new Float32Array(colorsArray);

  theMesh.setInstanceVBOs(col1, col2, col3, col4, colors);
  theMesh.setNumInstances(counter); 
}

function setJellyFieldVBOs(theMesh: Mesh,t :vec3, numInstances:number, offset: number, h_offset:number){
  let colorsArray = []; 
  let col1Array = []; 
  let col2Array = []; 
  let col3Array = []; 
  let col4Array = [];  
  let scale: number = 12 + (Math.random() * (1.0 - 0.5) + 0.5);
  let counter:number = 0;
  let overallMat = mat4.create();
  let translateMat = mat4.create();
  let scalelMat = mat4.create();
  let temp: number = 1;
  let temp2: number = 1;


for(var i = 0; i < numInstances; i ++) {  
  //reset
  overallMat = mat4.create();
  translateMat = mat4.create();
  scalelMat = mat4.create();

 
  //  * (max - min) + min;
  temp = Math.random() * (10.0 - 0.75) + 0.75;
  temp2 = temp;
  // for odd numbered
  if( i%2 != 0.0){
    temp *= -1;
   }
  mat4.fromScaling(scalelMat, vec3.fromValues(scale,scale,scale));
  mat4.fromTranslation(translateMat, vec3.fromValues(t[0] + temp * Math.random() * offset, // (tempZ*(tempX*0.75))
                                                     t[1] + Math.random() * h_offset,
                                                     t[2] + temp2 * Math.random()* offset)
                                                     );
  mat4.multiply(overallMat, overallMat, scalelMat);
  mat4.multiply(overallMat, overallMat, translateMat);

//   vec3(0.8314, 0.1647, 1.0);
  colorsArray.push(0.8314 + (Math.random() * (0.15 - 0.01) + 0.01)); // r value
  colorsArray.push( 0.1647 + (Math.random() * (0.15 - 0.01) + 0.01)); // g
  colorsArray.push(1.0 + (Math.random() * (0.15 - 0.01) + 0.01)); // b
  colorsArray.push(0.1 + (i % 30.0) / 31.0); // alpha, use as offset in shader
  // transform column 1
  col1Array.push(overallMat[0]);
  col1Array.push(overallMat[1]);
  col1Array.push(overallMat[2]);
  col1Array.push(overallMat[3]);
  // transform column 
  col2Array.push(overallMat[4]);
  col2Array.push(overallMat[5]);
  col2Array.push(overallMat[6]);
  col2Array.push(overallMat[7]);
  // transform column 3
  col3Array.push(overallMat[8]);
  col3Array.push(overallMat[9]);
  col3Array.push(overallMat[10]);
  col3Array.push(overallMat[11]);
  // transform column 4
  col4Array.push(overallMat[12]); 
  col4Array.push(overallMat[13]); // random val between 0 and 1 to offset height
  col4Array.push(overallMat[14]);
  col4Array.push(overallMat[15]); 
  
  counter ++;
}
  let col1: Float32Array = new Float32Array(col1Array);
  let col2: Float32Array = new Float32Array(col2Array);
  let col3: Float32Array = new Float32Array(col3Array);
  let col4: Float32Array = new Float32Array(col4Array);
  let colors: Float32Array = new Float32Array(colorsArray);
  //console.log(col4Array);
  theMesh.setInstanceVBOs(col1, col2, col3, col4, colors);
  theMesh.setNumInstances(counter); 
}

//seaweed
function setSeaWeedVBOs(theMesh: Mesh,t :vec3, numInstances:number, offset: number){
  let colorsArray = []; 
  let col1Array = []; 
  let col2Array = []; 
  let col3Array = []; 
  let col4Array = [];  
  let scale: number = 12.0;
  let counter:number = 0;
  let overallMat = mat4.create();
  let translateMat = mat4.create();
  let scalelMat = mat4.create();
  let temp: number = 1;
  let temp2: number = 1;


for(var i = 0; i < numInstances; i ++) {  
  //reset
  overallMat = mat4.create();
  translateMat = mat4.create();
  scalelMat = mat4.create();

 
  //  * (max - min) + min;
  temp = Math.random() * (10.0 - 0.75) + 0.75;
  temp2 = temp;
  // for odd numbered
  if( i%2 != 0.0){
    temp *= -1;
   }
  mat4.fromScaling(scalelMat, vec3.fromValues(scale,scale,scale));
  mat4.fromTranslation(translateMat, vec3.fromValues(t[0] + temp * Math.random() * offset, // (tempZ*(tempX*0.75))
                                                     t[1] + Math.random() ,
                                                     t[2] + temp2 * Math.random()* offset)
                                                     );
  mat4.multiply(overallMat, overallMat, scalelMat);
  mat4.multiply(overallMat, overallMat, translateMat);

// purple, getting overwritten in shader
  colorsArray.push(0.0627 + (Math.random() * (0.15 - 0.01) + 0.01)); // r value
  colorsArray.push(0.4 + (Math.random() * (0.15 - 0.01) + 0.01)); // g
  colorsArray.push(0.1333 + (Math.random() * (0.15 - 0.01) + 0.01)); // b
  colorsArray.push(0.1 + (i % 30.0) / 31.0); // alpha, use as offset in shader
  // transform column 1
  col1Array.push(overallMat[0]);
  col1Array.push(overallMat[1]);
  col1Array.push(overallMat[2]);
  col1Array.push(overallMat[3]);
  // transform column 
  col2Array.push(overallMat[4]);
  col2Array.push(overallMat[5]);
  col2Array.push(overallMat[6]);
  col2Array.push(overallMat[7]);
  // transform column 3
  col3Array.push(overallMat[8]);
  col3Array.push(overallMat[9]);
  col3Array.push(overallMat[10]);
  col3Array.push(overallMat[11]);
  // transform column 4
  col4Array.push(overallMat[12]); 
  col4Array.push(overallMat[13]); // random val between 0 and 1 to offset height
  col4Array.push(overallMat[14]);
  col4Array.push(overallMat[15]); 
  
  counter ++;
}
  let col1: Float32Array = new Float32Array(col1Array);
  let col2: Float32Array = new Float32Array(col2Array);
  let col3: Float32Array = new Float32Array(col3Array);
  let col4: Float32Array = new Float32Array(col4Array);
  let colors: Float32Array = new Float32Array(colorsArray);
  //console.log(col4Array);
  theMesh.setInstanceVBOs(col1, col2, col3, col4, colors);
  theMesh.setNumInstances(counter); 
}

//coral
function setCoralVBOs(theMesh: Mesh, theOtherMesh:Mesh, t :vec3, numInstances:number, offset: number){
  let colorsArray = []; 
  let colorsArray_Bottom = [];
  let col1Array = []; 
  let col2Array = []; 
  let col3Array = []; 
  let col4Array = [];  
  let col4ArrayBottom = [];   // for bottom
  let scale: number = 24.0;
  let counter:number = 0;
  let overallMat = mat4.create();
  let translateMat = mat4.create();
  let translateMatBottom = mat4.create(); // for bottom rock piece
  let overallMatBottom = mat4.create(); // for bottom
  let scalelMat = mat4.create();
  let temp: number = 1;
  let temp2: number = 1;
  let r1: number;
  let r2: number;
  let r3: number;


for(var i = 0; i < numInstances; i ++) {  
  //reset
  overallMat = mat4.create();
  translateMat = mat4.create();
  translateMatBottom = mat4.create(); // for bottom
  overallMatBottom = mat4.create(); // for bottom
  scalelMat = mat4.create();
 
  //  * (max - min) + min;
  temp = Math.random() * (10.0 - 0.75) + 0.75;
  temp2 = temp;
  // for odd numbered
  if( i%2 != 0.0){
    temp *= -1;
   }

   r1 =  Math.random();
   r2 =  Math.random() * (0.75 - 0.3) - 0.3;
   r3 =  Math.random();

  mat4.fromScaling(scalelMat, vec3.fromValues(scale,scale,scale));
  mat4.fromTranslation(translateMat, vec3.fromValues(t[0] + temp * r1 * offset,
                                                     t[1]+ 0.5 + r2, // offset the height from the base by 2
                                                     t[2] + temp2 * r3* offset)
                                                     );
  mat4.multiply(overallMat, overallMat, scalelMat);
  mat4.multiply(overallMat, overallMat, translateMat);                                                   
 // for bottom
  mat4.fromTranslation(translateMatBottom, vec3.fromValues(t[0] + temp * r1 * offset,
                                                    t[1] + r2, // offset the height from the base by 2
                                                     t[2] + temp2 * r3* offset)
                                                     );
  mat4.multiply(overallMatBottom, overallMatBottom, scalelMat);
  mat4.multiply(overallMatBottom, overallMatBottom, translateMatBottom);

// purple, getting overwritten in shader
  colorsArray.push(1.0 + (Math.random() * (0.15 - 0.01) + 0.01)); // r value
  colorsArray.push(0.0 + (Math.random() * (0.15 - 0.01) + 0.01)); // g
  colorsArray.push(1.0 + (Math.random() * (0.15 - 0.01) + 0.01)); // b
  colorsArray.push(0.0); // alpha, use as offset in shader

  colorsArray_Bottom.push(0.8549); // for bottom array
  colorsArray_Bottom.push(0.8078);
  colorsArray_Bottom.push(0.5451);
  colorsArray_Bottom.push(-1.0);
  // transform column 1
  col1Array.push(overallMat[0]);
  col1Array.push(overallMat[1]);
  col1Array.push(overallMat[2]);
  col1Array.push(overallMat[3]);
  // transform column 
  col2Array.push(overallMat[4]);
  col2Array.push(overallMat[5]);
  col2Array.push(overallMat[6]);
  col2Array.push(overallMat[7]);
  // transform column 3
  col3Array.push(overallMat[8]);
  col3Array.push(overallMat[9]);
  col3Array.push(overallMat[10]);
  col3Array.push(overallMat[11]);
  // transform column 4
  col4Array.push(overallMat[12]); 
  col4Array.push(overallMat[13]); 
  col4Array.push(overallMat[14]);
  col4Array.push(overallMat[15]); 

  col4ArrayBottom.push(overallMatBottom[12]); 
  col4ArrayBottom.push(overallMatBottom[13]); 
  col4ArrayBottom.push(overallMatBottom[14]);
  col4ArrayBottom.push(overallMatBottom[15]); 
  
  counter ++;
}
  let col1: Float32Array = new Float32Array(col1Array);
  let col2: Float32Array = new Float32Array(col2Array);
  let col3: Float32Array = new Float32Array(col3Array);
  let col4: Float32Array = new Float32Array(col4Array);
  let col4Bottom: Float32Array = new Float32Array(col4ArrayBottom);// for bottom
  let colors: Float32Array = new Float32Array(colorsArray);
  let colorsBottom: Float32Array = new Float32Array(colorsArray_Bottom);

  theMesh.setInstanceVBOs(col1, col2, col3, col4, colors);
  theMesh.setNumInstances(counter); 
  theOtherMesh.setInstanceVBOs(col1, col2, col3, col4Bottom, colorsBottom);
  theOtherMesh.setNumInstances(counter); 
}

//MantaRays
function setMantaRayVBOs(theMesh: Mesh,t :vec3, numInstances:number, offset: number){
  let colorsArray = []; 
  let col1Array = []; 
  let col2Array = []; 
  let col3Array = []; 
  let col4Array = [];  
  let scale: number = 13.0;
  let counter:number = 0;
  let overallMat = mat4.create();
  let translateMat = mat4.create();
  let scalelMat = mat4.create();
  let temp: number = 1;
  let temp2: number = 1;


for(var i = 0; i < numInstances; i ++) {  
  //reset
  overallMat = mat4.create();
  translateMat = mat4.create();
  scalelMat = mat4.create();

 
  //  * (max - min) + min;
  temp = Math.random() * (10.0 - 0.75) + 0.75;
  temp2 = temp;
  // for odd numbered
  if( i%2 != 0.0){
    temp *= -1;
   }
  mat4.fromScaling(scalelMat, vec3.fromValues(scale,scale,scale));
  mat4.fromTranslation(translateMat, vec3.fromValues(t[0] + temp * Math.random() * offset, // (tempZ*(tempX*0.75))
                                                     t[1] + Math.random() ,
                                                     t[2] + temp2 * Math.random()* offset)
                                                     );
  mat4.multiply(overallMat, overallMat, scalelMat);
  mat4.multiply(overallMat, overallMat, translateMat);

//  [0.4275, 0.3412, 0.3412, -1.0]
  colorsArray.push(0.4275+ (Math.random() * (0.15 - 0.01) + 0.01)); // r value
  colorsArray.push(0.3412+ (Math.random() * (0.15 - 0.01) + 0.01)); // g
  colorsArray.push(0.3412 + (Math.random() * (0.15 - 0.01) + 0.01)); // b
  colorsArray.push(-1.0  * (0.1 + (i % 30.0) / 31.0)); // id for shader
  // transform column 1
  col1Array.push(overallMat[0]);
  col1Array.push(overallMat[1]);
  col1Array.push(overallMat[2]);
  col1Array.push(overallMat[3]);
  // transform column 
  col2Array.push(overallMat[4]);
  col2Array.push(overallMat[5]);
  col2Array.push(overallMat[6]);
  col2Array.push(overallMat[7]);
  // transform column 3
  col3Array.push(overallMat[8]);
  col3Array.push(overallMat[9]);
  col3Array.push(overallMat[10]);
  col3Array.push(overallMat[11]);
  // transform column 4
  col4Array.push(overallMat[12]); 
  col4Array.push(overallMat[13]); // random val between 0 and 1 to offset height
  col4Array.push(overallMat[14]);
  col4Array.push(overallMat[15]); 
  
  counter ++;
}
  let col1: Float32Array = new Float32Array(col1Array);
  let col2: Float32Array = new Float32Array(col2Array);
  let col3: Float32Array = new Float32Array(col3Array);
  let col4: Float32Array = new Float32Array(col4Array);
  let colors: Float32Array = new Float32Array(colorsArray);

  theMesh.setInstanceVBOs(col1, col2, col3, col4, colors);
  theMesh.setNumInstances(counter); 
}

let formationArray: any = [];
let formationArray2: any = [];

function loadScene() {
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();

let jellyString: string = readTextFile('./src/geometry/jellyFish.obj');
jellyMesh = new Mesh(jellyString, vec3.fromValues(0.0, 2.0, 0.0));
jellyMesh.create(); 

 testObj = new MyIcosphere(vec3.fromValues(3.0, 3.0, 3.0), 1.0, 5.0);
 testObj.create();

 formationArray = populateFormationlArray('./src/geometry/torus.txt');
 formationArray2 = populateFormationlArray('./src/geometry/rectangle.txt');

// tiny fish
 mesh1 = new Mesh(obj0, vec3.fromValues(0.0, 2.0, 0.0));
 mesh1.create(); 
 setFishVBOs(mesh1, formationArray, vec3.fromValues(3.0, 4,0));
 //mesh1.setNumInstances(1); // for testing indiviual animation
 //second smaller group of orange fish
 goldfish = new Mesh(obj0, vec3.fromValues(0.0, 2.0, 0.0));
 goldfish.create(); 
 setFishVBOs(goldfish, formationArray, vec3.fromValues(-40, 6, 90));
 goldfish.setNumInstances(30);
 //more orange fish for the coral area
 orangeFishSchool1 = new Mesh(obj0, vec3.fromValues(0.0, 2.0, 0.0));
 orangeFishSchool1.create(); 
 setFishVBOs(orangeFishSchool1, formationArray, vec3.fromValues(10.0, 8.0, 620));

 // a school of yellow fish
 squareFish = new Mesh(squareFishString, vec3.fromValues(0.0, 2.0, 0.0));
 squareFish.create();
 setFishVBOs2(squareFish, formationArray2, vec3.fromValues(-55, 7.5, 300));
 // another school of yellow square fish
 squareFish2 = new Mesh(squareFishString, vec3.fromValues(0.0, 2.0, 0.0));
 squareFish2.create();
 setFishVBOs2(squareFish2, formationArray2, vec3.fromValues(15, 12.5, 200));

 //seaweed
 seaOfWeed = new Mesh(swObj, vec3.fromValues(0.0, 0.0, 0.0));
 seaOfWeed.create();
 setSeaWeedVBOs(seaOfWeed, vec3.fromValues(0.0, 0.0, -5.0), 200, 1.3);
 // more groups od seaweed
 seaWeed2 = new Mesh(swObj, vec3.fromValues(0.0, 0.0, 0.0));
 seaWeed2.create();
 seaWeed3 = new Mesh(swObj, vec3.fromValues(0.0, 0.0, 0.0));
 seaWeed3.create();
 seaWeed4 = new Mesh(swObj, vec3.fromValues(0.0, 0.0, 0.0));
 seaWeed4.create();
 seaWeed1 = new Mesh(swObj, vec3.fromValues(0.0, 0.0, 0.0));
 seaWeed1.create();
 setSeaWeedVBOs(seaWeed2, vec3.fromValues(-3.5, 0.0, 35.0), 1000, 7);
 setSeaWeedVBOs(seaWeed3, vec3.fromValues(2.0, 0.0, 5.0), 300, 5.0);
 setSeaWeedVBOs(seaWeed4, vec3.fromValues(0.0, 0.0, 240.0), 800, 5.0); // for the grassy area
 setSeaWeedVBOs(seaWeed1, vec3.fromValues(0.0, 0.0, -20.0), 1200, 16.0); // closest to the camera on start
 //setSeaWeedVBOs(seaWeed1, vec3.fromValues(0.0, 0.0, -20.0), 600, 6.0); // closest to the camera on start

 // jelly fish model
 setJellyVBOs(jellyMesh, vec3.fromValues(5, 6, 230), 3);

// a bunch of jelly fish
jellyField = new Mesh(jellyString, vec3.fromValues(0.0, 2.0, 0.0));
jellyField.create(); 
setJellyFieldVBOs(jellyField, vec3.fromValues(2.0, 5.0, 130.0), 85, 15.0, 2.0);

 
 //shark
 let scale: number = 2.75;
 let colorsList: number[] = [0.0627,  0.051,   0.2471, -10.0]; //vec3(0.0627, 0.051, 0.2471)
 let c1Array: number[] = [scale, 0.0, 0.0, 0.0];
 let c2Array: number[] = [0.0, scale, 0.0, 0.0];
 let c3Array: number[] = [0.0, 0.0, scale, 0.0];
 let c4Array: number[] = [1500.0, 17.0,  70.0,  1.0]; // displacement
 let col1Array: Float32Array = new Float32Array(c1Array);
 let col2Array: Float32Array = new Float32Array(c2Array);
 let col3Array: Float32Array = new Float32Array(c3Array);
 let col4Array: Float32Array = new Float32Array(c4Array);
 let colorArray: Float32Array = new Float32Array(colorsList);
 
 shark = new Mesh(sharkString, vec3.fromValues(0.0, 0.0, 0.0));
 shark.create();
 shark.setInstanceVBOs(col1Array, col2Array, col3Array, col4Array, colorArray);
 shark.setNumInstances(1);

// manta rays
mantaRay = new Mesh(mantaString, vec3.fromValues(0.0, 0.0, 0.0));
mantaRay.create();
mantaRay2 = new Mesh(mantaString, vec3.fromValues(0.0, 0.0, 0.0));
mantaRay2.create();
mantasInTheBack = new Mesh(mantaString, vec3.fromValues(0.0, 0.0, 0.0));
mantasInTheBack.create();

 setMantaRayVBOs(mantaRay, vec3.fromValues(40, 1.2, 110), 10, 3.5);
 setMantaRayVBOs(mantaRay2, vec3.fromValues(-25, 1.2, 110), 10, 3.5);
 setMantaRayVBOs(mantasInTheBack, vec3.fromValues(-25, 1.2, 500), 300, 30.5);


 // 3 rudd fish that go across screen
 rudd = new Mesh(ruddString, vec3.fromValues(0.0, 0.0, 0.0));
 rudd.create();
 let scale2: number = 0.20;
 let s: number = 0.15; 
 let c1: vec3 = vec3.fromValues(0.0784, 0.0706, 0.3608);
 let c2: vec3 = vec3.fromValues(0.102, 0.098, 0.3255);
 let c3: vec3 = vec3.fromValues(0.1765, 0.1647, 0.502); 
 let colorsListRudd: number[] = [c1[0],  c1[1], c1[2], 2.0, c2[0],  c2[1], c2[3], 3.0, c1[0],  c1[1], c1[2], 0.75]; 
 let c1ArrayRudd: number[] = [scale2, 0.0, 0.0, 0.0, s, 0.0, 0.0, 0.0,  s*0.75, 0.0, 0.0, 0.0];
 let c2ArrayRudd: number[] = [0.0, scale2, 0.0, 0.0, 0.0, s, 0.0, 0.0,  0.0, s*0.75, 0.0, 0.0];
 let c3ArrayRudd: number[] = [0.0, 0.0, scale2, 0.0, 0.0, 0.0, s, 0.0,  0.0, 0.0, s*0.75, 0.0];
 let c4ArrayRudd: number[] = [-230.0, 20.0,  40.0,  1.0, -385.0, 22.0,  60.0,  1.0, 400.0, 40.0,  50.0,  1.0]; // displacement
 let col1ArrayRudd: Float32Array = new Float32Array(c1ArrayRudd);
 let col2ArrayRudd: Float32Array = new Float32Array(c2ArrayRudd);
 let col3ArrayRudd: Float32Array = new Float32Array(c3ArrayRudd);
 let col4ArrayRudd: Float32Array = new Float32Array(c4ArrayRudd);
 let colorArrayRudd: Float32Array = new Float32Array(colorsListRudd);
 rudd.setInstanceVBOs(col1ArrayRudd, col2ArrayRudd, col3ArrayRudd, col4ArrayRudd, colorArrayRudd);
 rudd.setNumInstances(3);

 coralBottom = new Mesh(coralBString, vec3.fromValues(0.0, 0.0, 0.0));
 coralBottom.create();
 coralTop = new Mesh(coralTString, vec3.fromValues(0.0, 0.0, 0.0));
 coralTop.create();
 setCoralVBOs(coralTop, coralBottom, vec3.fromValues(0.0, 0.0, 200.0), 60 , 14.0);

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
// for schools fish
  const instance = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);
  const instanceJellyShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instancedJelly-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instancedJelly-frag.glsl')),
  ]);
  //for plants
  const instancePlants = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-seaweed-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-seaweed-frag.glsl')),
  ]);
  // shark and other things relative to camera
  const screenSpaceShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-shark-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-shark-frag.glsl')),
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
    instancePlants.setPlanePos(newPos);
    screenSpaceShader.setPlanePos(newPos);
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
    instancePlants.setUTime(Date.now() - startVar);
    screenSpaceShader.setUTime(Date.now() - startVar);
    // draw the ground/terrain
    renderer.render(camera, lambert, 1.0, [
      plane,
    ]);
      // draw the blue background
    renderer.render(camera, flat, 1.0, [ // added for hw1
      square,
    ]);
    // draw the instanced geometry
      // draw fish swimming by
      renderer.render(camera, screenSpaceShader, 1.0, [
        shark,
        rudd,
        mantaRay,
        mantaRay2,
        mantasInTheBack
        ]);
    // draw small fish
    renderer.render(camera, instance, 1.0, [
     // testObj, // sphere
      mesh1, // tiny fish school 1
      goldfish, // tiny orange school of fish #2
      squareFish, // the square fish
      squareFish2,
      orangeFishSchool1,
    ]);
    // draw jellyfish
    renderer.render(camera, instanceJellyShader, 1.0, [
     // testObj, // sphere
      jellyMesh, // jellyfish model
      jellyField, // a bunch of jellies
  
    ]);
    //draw plants
    renderer.render(camera, instancePlants, 1.0, [
      seaOfWeed,//seaweed
      seaWeed1,
      seaWeed2,
      seaWeed3, 
      seaWeed4, 
      coralBottom,
      coralTop ,
     ]);
    

    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    // set dimensions for u_Dimensions in shader, I added this
    instancePlants.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  // set dimensions for u_Dimensions in shader, i added this
  instancePlants.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
