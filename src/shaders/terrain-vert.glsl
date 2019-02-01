#version 300 es


uniform mat4 u_Model;
uniform mat4 u_ModelInvTr;
uniform mat4 u_ViewProj;
uniform vec2 u_PlanePos; // Our location in the virtual world displayed by the plane
uniform float u_HeightVar;// added for hw1
uniform float u_GlacierHeight;// added for hw1
uniform float u_Time;

in vec4 vs_Pos;
in vec4 vs_Nor;
in vec4 vs_Col;

out vec3 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_Col;

out float fs_Sine;
out float fs_height;

float random1( vec2 p , vec2 seed) {
  return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

float random1( vec3 p , vec3 seed) {
  return fract(sin(dot(p + seed, vec3(987.654, 123.456, 531.975))) * 85734.3545);
}

vec2 random2( vec2 p , vec2 seed) {
  return fract(sin(vec2(dot(p + seed, vec2(311.7, 127.1)), dot(p + seed, vec2(269.5, 183.3)))) * 85734.3545);
}


float testing(float x, float y){
 float temp = smoothstep(0.0, 0.3, x)  * smoothstep(0.3, 0.7, x) ;
 //temp = (floor(x*10.0)/10.0 );

return temp;
}


float randomFunc(vec2 inVal){

return fract(sin(dot(inVal, vec2(12.9898, 78.233)))* 43758.5453123);

}


// -------------------------------Worley Noise--------------------------------------------------------------------
vec2 getWorleyCenter(float pos_x, float pos_y){
  float gridSize = 50.0;
  vec2 theGrid = vec2(floor(pos_x), floor(pos_y)); // clamp point to corner of corresponding grid cell
  theGrid = theGrid - mod(theGrid, gridSize); // fit it to the grid

  vec2 returnVec = theGrid + (gridSize * vec2(random1(theGrid, vec2(5.f,5.f)), random1(theGrid, vec2(10.f,10.f))));

  return returnVec;
}

float getWorleyNoise(float x, float y){
  vec2 closetPoint = getWorleyCenter(x,y);
float gridSize = 50.0;
// loop for neightboring cells
  for(int i = 0; i < 3; i++){
    for(int j = 0; j < 3; j++){
          vec2 neighborPoint = vec2(x + gridSize * float((i-1)), y + gridSize * float((j-1)));
          vec2 neighborPointCenter = getWorleyCenter(neighborPoint.x, neighborPoint.y);

          // if find a closer neighbor, update closetPoint
          float dist = distance(vec2(x,y), neighborPointCenter);
          if(dist < distance(vec2(x,y), closetPoint)){
              closetPoint = neighborPointCenter;
          }
    }
  }

// force value to be between 0 and 1
  return mix(0.0, 4.0, clamp(distance(closetPoint, vec2(x,y)), 0.0, 1.0));
 

}
// ----------------------------------------------------------------------------------------------

// -----------------------------FBM----------------------------------------------------------
float noiseFunc(vec2 inVec){
  vec2 i = floor(inVec);
  vec2 f = fract(inVec);

  float a = randomFunc(i);
  float b = randomFunc(i + vec2(1.0, 0.0));
  float c = randomFunc(i+ vec2(0.0, 1.0));
  float d = randomFunc(i+ vec2(1.0, 1.0));
  
  vec2 u = f*f*(3.0-2.0*f);

return mix(a, b, u.x) + (c-a)*u.y * (1.0-u.x) + (d-b) * u.x * u.y;

}


float redistrib(float x, float y){
  vec2 position = vec2(x,y);
  vec2 seedVec = vec2(3.0,3.0);
  float temp = random1(position, seedVec) + .5 * random1(2.0*position, seedVec) + .25 * random1(4.0* position, seedVec);

  return temp;
}

float fbm(float x, float y) {
  float total = 0.0;
  float persistence = 0.5;
  int oct = 8;
  //float offset = .1;

    for (int i = 0; i < oct; i++) {
        total += noiseFunc(vec2(x,y)) * persistence;
        persistence *= 0.25;
        //total += noiseFunc(vec2((x+offset)*float(oct), (y+offset)*float(oct))) * persistence;
     // offset += .1;
    }
    return total;

}

void main()
{

//     float m;
// if(u_Time == 0.0){
//     m = 1.0;
// }
// else{
//  m = min(sin(u_Time * .005), 0.0);
 
// }

  fs_Sine = (sin((vs_Pos.x + u_PlanePos.x) * 3.14159 * 0.1) + cos((vs_Pos.z + u_PlanePos.y) * 3.14159 * 0.1));
  float noiseTerm = 0.5 * pow(redistrib(vs_Pos.x + u_PlanePos.x,(vs_Pos.z + u_PlanePos.y + .5)), 0.5*u_GlacierHeight)  + 2.5 * fbm((vs_Pos.x + u_PlanePos.x), (vs_Pos.z + u_PlanePos.y)) + getWorleyNoise((vs_Pos.x + u_PlanePos.x), (vs_Pos.z + u_PlanePos.y));
  float height = noiseTerm * u_GlacierHeight;

  vec4 modelposition = vec4(vs_Pos.x, height, vs_Pos.z, 1.0);

  fs_Pos = modelposition.xyz;
  height *= u_HeightVar;
  fs_height = height;
  modelposition = u_Model * modelposition;
  gl_Position = u_ViewProj * modelposition;
}


