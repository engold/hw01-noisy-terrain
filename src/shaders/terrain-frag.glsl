#version 300 es
precision highp float;

uniform vec2 u_PlanePos; // Our location in the virtual world displayed by the plane

uniform float u_HeightVar;// added for hw1
uniform float u_GlacierHeight;// added for hw1
uniform float u_Time;// added for hw1

in vec3 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;

in float fs_Sine;
in float fs_height;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.


// perlin noise from book of shaders: https://thebookofshaders.com/11/
// 2D random function
float randomFunc(vec2 inVal){

return fract(sin(dot(inVal, vec2(12.9898, 78.233)))* 43758.5453123);

}


float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = randomFunc(i);
    float b = randomFunc(i + vec2(1.0, 0.0));
    float c = randomFunc(i + vec2(0.0, 1.0));
    float d = randomFunc(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}


void main()
{

//     float m;
// if(u_Time == 0.0){
//     m = 1.0;
// }
// else{
//  m = min(sin(u_Time * .001), -1.0);
// }



    float t = clamp(smoothstep(40.0, 50.0, length(fs_Pos)), 0.0, 1.0); // Distance fog
    //out_Col = vec4(mix(vec3(0.5 * (fs_Sine + 1.0)), vec3(164.0 / 255.0, 233.0 / 255.0, 1.0), t), 1.0);
float x = fs_Pos.x + u_PlanePos.x;
float y = fs_Pos.z + u_PlanePos.y;

float n = noise(vec2(x,y));

vec3 col = vec3(n);
vec3 orange = vec3(1.0, 0.6824, 0.0);

vec3 finalCol = mix(orange, col, fs_height);


out_Col = vec4(mix(finalCol, vec3(164.0 / 255.0, 233.0 / 255.0, 1.0), t), 1.0);
//out_Col = vec4(mix(   mixedColor , vec3(164.0 / 255.0, 233.0 / 255.0, 1.0), t), 1.0);

    // out_Col = vec4(mix(vec3(0.5 * (fs_Sine + 1.0)), vec3(164.0 / 255.0, 233.0 / 255.0, 1.0), t), 1.0);
}

