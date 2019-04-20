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
in float index;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.


void main()
{
    //float t = clamp(smoothstep(40.0, 50.0, length(fs_Pos)), 0.0, 1.0); // Distance fog
    //                                    length(fs_Pos/ 1.5)) / 2.0     // gives circular blur
    //float t = clamp(smoothstep(40.0, 50.0, fs_Pos.z), 0.0, 1.0); // Distance fog
    float t = clamp(smoothstep(70.0, 80.0, fs_Pos.z), 0.0, 1.0); // Distance fog
    // t*= 2.5; // extend the fog??
  
  vec3 c = vec3(0.0784, 0.1725, 0.4275);// vec3(0.0706, 0.2275, 0.6549);
  vec3 c2 = vec3(0.1765, 0.2824, 0.5725);//vec3(0.3255, 0.4824, 0.9137);
   vec3 fog_color = vec3(0.0706, 0.1529, 0.3804);

    // vec3 fog_color = vec3(0.0784, 0.1725, 0.4275);

     // out_Col = vec4(mix(vec3(0.0),vec3(1.0) , sin(u_Time*0.005)), 1.0);
    // get around floating point error
    if (index - 1.0 < 0.2) {
        // sand hill color vec3(0.5608, 0.4392, 0.1059)
            out_Col = vec4(mix(vec3(0.7608, 0.6588, 0.3804) * 0.5 * (fs_Sine*0.15) + 0.2, fog_color, t), 1.0);
    } 
    else if (index - 2.0 < 0.2) {
        // flat sand floor color
        out_Col = vec4(mix(vec3(0.8863, 0.7176, 0.2902) * 0.5 * (fs_Sine*0.15) + 0.1, fog_color, t), 1.0);
    } 
    else if (index - 3.0 < 0.2) {
       // grassy area
        //---------------------------------------------------------------------------------
        // if(fs_Sine - 1.0 > 2.0){
        //   out_Col = vec4(mix(vec3(1.0, 0.9647, 0.4784), fog_color, t), 1.0);
        // }
        // else{
        out_Col = vec4(mix(vec3(0.0706, 0.3922, 0.1333)* 0.5 * (fs_Sine*0.15) + 0.2, fog_color, t), 1.0);
       // }
    }
     else if (index - 4.0 < 0.2) {
         if (fs_Sine -1.0 >= 0.2) {
            out_Col = vec4(mix(vec3(0.4667, 0.4667, 0.4667) * 0.5 * (fs_Sine*0.15) + 0.2, fog_color, t), 1.0);
        } else if (fs_Sine > 0.6) {
            vec3 rock = vec3(0.3333, 0.3333, 0.3333); // good
            vec3 rockBottom = vec3(0.2549, 0.2275, 0.0902); // good
            vec3 temp = mix(rockBottom, rock, (fs_Sine - 0.6) / 0.4);
            out_Col = vec4(mix(temp, fog_color, t), 1.0);
        } else {
            vec3 sand = vec3(193.0/255.0, 175.0/255.0, 94.0/255.0);
            vec3 low = vec3(0.4784, 0.4078, 0.2235);
            vec3 in_between = mix(low, sand, (fs_Sine - 0.4) / 0.6);
            out_Col = vec4(mix(in_between, fog_color, t), 1.0);
        }
    }
    else {
        out_Col = vec4(mix(vec3(0.5 * (fs_Sine*0.15) + 0.1), fog_color, t), 1.0);
    }
    
  
}