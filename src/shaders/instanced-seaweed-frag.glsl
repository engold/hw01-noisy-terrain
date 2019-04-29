#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;
uniform vec2 u_PlanePos; 

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor; // normals
in float iD;

out vec4 out_Col;


// float random (in vec2 st) {
//     return fract(sin(dot(st.xy,
//                          vec2(12.9898,78.233)))*
//         43758.5453123);
// }

// // Based on Morgan McGuire @morgan3d
// // https://www.shadertoy.com/view/4dS3Wd
// float noise (in vec2 st) {
//     vec2 i = floor(st);
//     vec2 f = fract(st);

//     // Four corners in 2D of a tile
//     float a = random(i);
//     float b = random(i + vec2(1.0, 0.0));
//     float c = random(i + vec2(0.0, 1.0));
//     float d = random(i + vec2(1.0, 1.0));

//     vec2 u = f * f * (3.0 - 2.0 * f);

//     return mix(a, b, u.x) +
//             (c - a)* u.y * (1.0 - u.x) +
//             (d - b) * u.x * u.y;
// }
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}


float fbm (vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    //
    // Loop of octaves
    for (int i = 0; i < 8; i++) {
        value += amplitude * abs(noise(st));
       // value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}


void main()
{
vec3 n = fs_Nor.xyz;

vec3 lightVector = vec3(5.0, 5.0, 5.0) + fs_Pos.xyz;//u_Eye;//vec3(0.4784, 0.3176, 0.1294);//normalize(u_Eye - p);
// h is the average of the view and light vectors
vec3 h = (vec3(0.0, 0.0, 1.0) + lightVector) / 2.0;
// specular intensity
float specularInt = max(pow(dot(normalize(h), normalize(n)), 23.0) , 0.0);  
// dot between normals and light direction
float diffuseTerm = dot(normalize(n), normalize(lightVector));  
// Avoid negative lighting values
diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);    
float ambientTerm = 0.2;
float lightIntensity = diffuseTerm + ambientTerm;
//float dist = 1.0 - (length(fs_Pos.xyz) * 2.0);
//out_Col = vec4(dist) * fs_Col;  
//vec3(0.149, 0.4157, 0.7216);
vec3 col;
float t = clamp(fs_Pos.z, 0.0, 1.0); // Distance fog
vec3 fog_color = vec3(0.0431, 0.1294, 0.3882);


if(fs_Col.a < 0.01 && fs_Col.a > -0.5){ // for coral top
col = mix(fs_Col.xyz, vec3(1.0, 0.4627, 1.0), smoothstep(0.5, 1.0, fs_Pos.z* fs_Pos.y));// smoothstep(0.0, 1.5, fs_Pos.y));
col = mix(col,vec3(0.8667, 0.451, 0.8667),smoothstep(0.75, 1.5, fs_Pos.y ) );
col = mix(col,vec3(0.902, 0.6157, 0.902),smoothstep(1.7, 1.9, fs_Pos.y ) );
col = mix(col,vec3(0.9882, 0.6745, 0.9882),smoothstep(2.0, 2.3, fs_Pos.y ) );
}
else if(fs_Col.a < 0.0){ // coral base
 vec3 color = fs_Col.xyz;
 col = mix(color,vec3(0.4549, 0.3961, 0.1608), 1.0- smoothstep(0.2, 1.5, fs_Pos.z ) );
 col = mix(color,vec3(0.6, 0.5294, 0.2235), 1.0- smoothstep(0.5, 1.0, fs_Pos.y ) );

 
   
}
else{ // for seaweed
 col = mix(fs_Col.xyz, fog_color, 0.25);//
 //col = fs_Col.xyz;
}

out_Col = clamp(vec4(col * lightIntensity, 1.0), 0.0, 1.0);


//out_Col = vec4(fs_Col.xyz, 1.0);
}