#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;
uniform vec2 u_PlanePos; // Our location in the virtual world displayed by the plane

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.
// Columns for overall transformation matrix - unique to each instance
in vec4 vs_TransformC1;
in vec4 vs_TransformC2;
in vec4 vs_TransformC3;
in vec4 vs_TransformC4;

const float PI = 3.14159265359;

out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor; // normals



float random1( vec2 p , vec2 seed) {
  return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

float random1( vec3 p , vec3 seed) {
  return fract(sin(dot(p + seed, vec3(987.654, 123.456, 531.975))) * 85734.3545);
}

vec2 random2( vec2 p , vec2 seed) {
  return fract(sin(vec2(dot(p + seed, vec2(311.7, 127.1)), dot(p + seed, vec2(269.5, 183.3)))) * 85734.3545);
}

vec2 random3( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

float rand(vec2 inVec){
    return fract(sin(dot(inVec.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float rand1D(int x) {
  x = (x << 13) ^ x;
  return (1.0 - ( float(x) * ( float(x) * float(x) * 15731.0 + 789221.0) + 1376312589.0)) / 10737741824.0;
}

float getNewHeight(float value){
  float m = 1.75;
  if (value < 0.2) {
    return 0.2* m;
  } 
  else if (value < 0.4) {
    return (0.2 + ((value - 0.2) / 0.2)*0.2)* m;
  } 
  else if (value < 0.6) {
    return (0.4 + ((value - 0.4) / 0.2)*0.2)* m;
  }
  else if (value < 0.8) {
    return (0.6 + ((value - 0.6) / 0.2)*0.2)* m;
  } 
  else {
    return 1.0 * m;
  }
}

float interpNoise2D(float x, float y) {
  float intX = floor(x);
  float fractX = fract(x);
  float intY = floor(y);
  float fractY = fract(y);

  float v1 = rand(vec2(intX, intY));
  float v2 = rand(vec2(intX + 1.f, intY));
  float v3 = rand(vec2(intX, intY + 1.f));
  float v4 = rand(vec2(intX + 1.f, intY + 1.f));

  float i1 = mix(v1, v2, fractX);
  float i2 = mix(v3, v4, fractX);

  return mix(i1, i2, fractY);
}

float fbm(float x, float y) {
  float roughness = 1.0;
  float total = 0.0;
  float persistence = 0.5;
  int octaves = 8;

  for (int i = 0; i < octaves; i++) {
    float freq = pow(2.0, float(i));
    float amp = pow(persistence, float(i));

    total += interpNoise2D(x * freq, y * freq) * amp * roughness;
    roughness *= interpNoise2D(x*freq, y*freq);
  }
  return total;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
float interpNoise2D(vec2 vec){
  vec2 i = floor(vec);
  vec2 f = fract(vec);

  float a = rand(i);
  float b = rand(i + vec2(1.0f, 0.0f));
  float c = rand(i + vec2(0.0f, 1.0f));
  float d = rand(i + vec2(1.0f, 1.0f));
 
  vec2 u = f * f * (3.0f - 2.0f * f);

return mix(a, b, u.x) + (c-a)*u.y * (1.0f-u.x) + (d-b) * u.x * u.y;
}

float myFbm(float x, float y){
  float total = 0.0f;
  float persistence = 0.5f;
  float octaves = 8.0f;

  for(float i = 0.0f; i < octaves; i ++){
      float frequency = pow(2.0f, i);
      float amp = pow(persistence, i);
      total += interpNoise2D(vec2(x * frequency, y * frequency)) * amp;       
  }
  return total;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Worley Noise Book of Shaders: https://thebookofshaders.com/12/
float worley (float s, float mult) {
  float cellSize = s;
  vec2 cell = (vs_Pos.xz + u_PlanePos.xy) / cellSize;
  float noise = 0.0;
  
  vec2 fractPos = fract(cell);
  vec2 intPos = floor(cell);
  float distanceVar = 1.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x),float(y));
      vec2 rPoint = random3(intPos + neighbor);

      vec2 diff = neighbor + rPoint - fractPos;
      float dist = length(diff);
      
      if (dist < distanceVar) {
        distanceVar = dist;
        vec2 pt = (rPoint + intPos + neighbor) / cellSize;
        noise = distanceVar*mult;
      }
    } 
  }
  return noise;
}

float getBiome() {
  //                                    size
  float noise = worley(2000.0 + 100.0 * 40.0, 2.0) + 0.05*fbm(vs_Pos.x + u_PlanePos.x, vs_Pos.z + u_PlanePos.y);
  noise = mod(noise, 1.0);
  if (noise < 0.25) {
     return 2.0; // 2.0;
  } else if (noise < 0.5) {
    return 1.0;
  } else if (noise < 0.75) {
   return 3.0; //3.0;
  } else {
    return 4.0;
  }
}

mat4 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}


void main() {
    fs_Col = vs_Col;
    fs_Pos = vs_Pos;
    fs_Nor = vs_Nor;
    // vec3 offset = vs_Translate;
    // offset.z = (sin((u_Time + offset.x) * 3.14159 * 0.1) + cos((u_Time + offset.y) * 3.14159 * 0.1)) * 1.5;
    // vec3 billboardPos = offset + vs_Pos.x * u_CameraAxes[0] + vs_Pos.y * u_CameraAxes[1];
    // gl_Position = u_ViewProj * vec4(billboardPos, 1.0);

     // place the fish relative to the terrain ground plane
   // vec4 myPos = vec4(vs_Pos.x - (u_PlanePos.y* 0.5), vs_Pos.y, vs_Pos.z + (u_PlanePos.x * 0.5), 1.0);
    vec4 myPos = vs_Pos;
   
   // (rand() % (max- min)) + min
    float temp = mod( rand1D(45 ), 120.0-90.0) + 90.0; // get a rand value between 90 and 120
    float a = temp * (PI /180.0) * sin(u_Time* 0.005 * vs_Col.a)/ 5.05; // angle to rad conversion and repeat swivel angle
    //           rotate on Y axis, angle in rads
    mat4 rMat = rotationMatrix(vec3(0.0, 1.0, 0.0), a);
    // apply individual transforms per instance
    mat4 overallTransforms = mat4(vs_TransformC1, vs_TransformC2, vs_TransformC3, vs_TransformC4);
   // vec4 modifiedPos = rMat * vs_Pos;
    vec4 modifiedPos = rMat * myPos;

    modifiedPos.y += (sin(u_Time * 0.005 * (vs_Col.a/ 0.75))/ 2.0); // bob up and down
    float t = sin(u_Time * 0.0005);
    float offset = 0.5 * sin(vs_Pos.y * 2.0 + float(u_Time*0.025)) + 0.5;
    
    float dist = distance(vs_Pos.xyz, vec3(0.0,0.0,0.0));


    // jellyfish motion - waves down body
   // modifiedPos.xyz += vs_Nor.xyz * sin(modifiedPos.y* 10.0 + u_Time*0.005) * 0.1;

/*
  float index = getBiome();
  // use this to know what biome we're in to know which type of fish to render

  if (index == 1.0) {
    // sandy hills - done

  } 
  else if (index == 2.0) {
    // barren sand floor - done

  } 
  else if (index == 3.0) {
    // grassy floor

  } 
  else if (index == 4.0) {
    // sandbar rocks - done

  }
  */
  

    vec4 finalPos = overallTransforms * modifiedPos;
    gl_Position = u_ViewProj * finalPos;
}