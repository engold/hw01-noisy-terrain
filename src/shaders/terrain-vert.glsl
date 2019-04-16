#version 300 es

uniform mat4 u_Model;
uniform mat4 u_ModelInvTr;
uniform mat4 u_ViewProj;
uniform vec2 u_PlanePos; // Our location in the virtual world displayed by the plane
uniform float u_Time;

in vec4 vs_Pos;
in vec4 vs_Nor;
in vec4 vs_Col;

out vec3 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_Col;

out float index; // identifier for type of terrain
out float time;

out float fs_Sine;

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

void main()
{
  float height = fbm((vs_Pos.x + u_PlanePos.x) / 24.0, (vs_Pos.z + u_PlanePos.y) / 24.0); 
  float noiseTerm = fbm((vs_Pos.x + u_PlanePos.x + worley(50.f,8.0)) / 8.0, (vs_Pos.z + u_PlanePos.y + worley(50.f,8.0)) / 8.0);
  fs_Pos = vs_Pos.xyz;
  vec4 modelposition = vec4(1.0);
  float n = 0.0;

// returns an identifier number for which biome we are currently in
  index = getBiome();

  if (index == 1.0) {
    // sandy hills - done
    //          exp controls sharpness
    float n = pow(2.0*height,2.1) + abs(mod(floor(height*32.0), 2.0)) * 0.2;
    fs_Sine = n;
    modelposition = vec4(vs_Pos.x, vs_Pos.y + n, vs_Pos.z, 1.0);
  } 
  else if (index == 2.0) {
    // barren sand floor - done
    float n = smoothstep(0.0,0.7, pow(worley(4.0,50.0),3.0)) + sqrt(2.0*noiseTerm);
    fs_Sine = n/ height; // for sunlight patches
    modelposition = vec4(vs_Pos.x, vs_Pos.y + n, vs_Pos.z, 1.0);
  } 
  else if (index == 3.0) {
    // grassy floor
    float noise = smoothstep(0.0,0.5, pow(worley(4.0, 40.0), 3.5)) + worley(2.0*noiseTerm, 2.5) + floor(sin(height) * 3.0);
    fs_Sine = noise* height;
    modelposition = vec4(vs_Pos.x, vs_Pos.y + noise, vs_Pos.z, 1.0);
  } 
  else if (index == 4.0) {
    // sandbar rocks - done
    float n = pow(getNewHeight(height), 1.5);
    fs_Sine = n;
    modelposition = vec4(vs_Pos.x, vs_Pos.y + n, vs_Pos.z, 1.0);

  }
  
  //modelposition = vs_Pos; // completely flat 
  modelposition = u_Model * modelposition;
  gl_Position = u_ViewProj * modelposition;
}