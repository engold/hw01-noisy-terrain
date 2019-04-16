#version 300 es
precision highp float;

// The fragment shader used to render the background of the scene
// Modify this to make your background more interesting

uniform float u_HeightVar;// added for hw1, used as changing time var


out vec4 out_Col;


void main() {

vec3 col = vec3(0.0784, 0.1725, 0.4275);// vec3(0.0706, 0.2275, 0.6549);;
// regular background
  out_Col = vec4(col, 1.0);//vec4(164.0 / 255.0, 233.0 / 255.0, 1.0, 1.0);
}
