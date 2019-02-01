#version 300 es
precision highp float;

// The fragment shader used to render the background of the scene
// Modify this to make your background more interesting

uniform float u_HeightVar;// added for hw1, used as changing time var


out vec4 out_Col;


void main() {


// regular background
  out_Col = vec4(164.0 / 255.0, 233.0 / 255.0, 1.0, 1.0);
}
