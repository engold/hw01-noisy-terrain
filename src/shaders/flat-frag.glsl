#version 300 es
precision highp float;

// The fragment shader used to render the background of the scene
// Modify this to make your background more interesting

uniform float u_HeightVar;// added for hw1, used as changing time var
uniform float u_Time;


out vec4 out_Col;
in vec4 fs_Pos;

void main() {

vec3 col = vec3(0.0784, 0.1725, 0.4275);// vec3(0.0706, 0.2275, 0.6549);
vec3 col2 = vec3(0.1765, 0.2824, 0.5725);//vec3(0.3255, 0.4824, 0.9137);

 out_Col = vec4(col, 1.0);//vec4(mix(col, col2, 0.35* fs_Pos.y), 1.0); // slight gradient in y dir
// regular background
 // out_Col = vec4(col, 1.0);//vec4(164.0 / 255.0, 233.0 / 255.0, 1.0, 1.0);
}
