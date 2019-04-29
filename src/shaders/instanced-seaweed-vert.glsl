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
out float iD;




float rand1D(int x) {
  x = (x << 13) ^ x;
  return (1.0 - ( float(x) * ( float(x) * float(x) * 15731.0 + 789221.0) + 1376312589.0)) / 10737741824.0;
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

    // offset.z = (sin((u_Time + offset.x) * 3.14159 * 0.1) + cos((u_Time + offset.y) * 3.14159 * 0.1)) * 1.5;
 
     // place the fish relative to the terrain ground plane in model matrix (overallTransform)
    //vec4 myPos = vs_Pos;
     vec4 myPos = vec4(vs_Pos.x , vs_Pos.y, vs_Pos.z , 1.0);

   
   // (rand() % (max- min)) + min
    float temp = mod( rand1D(45 ), 120.0-90.0) + 90.0; // get a rand value between 90 and 120
    float a = temp * (PI /180.0) * sin(u_Time* 0.005 * vs_Col.a)/ 5.05; // angle to rad conversion and repeat swivel angle
    //           rotate on Y axis, angle in rads
    mat4 rMat = rotationMatrix(vec3(0.0, 1.0, 0.0), a);
    mat4 rMatCoral = rotationMatrix(vec3(0.0, 1.0, 0.0), 180.0 * (PI/180.0));
    // apply individual transforms per instance

    //mat4 overallTransforms = mat4(vs_TransformC1, vs_TransformC2, vs_TransformC3, vs_TransformC4);
    // change the model matrix to include the offset of the Key Press movements
   mat4 overallTransforms = mat4(vs_TransformC1, vs_TransformC2, vs_TransformC3, 
   vs_TransformC4 + vec4((vs_Pos.x -u_PlanePos.x)* 2.0, 0.0, (vs_Pos.z -u_PlanePos.y)*2.0, 1.0));
    vec4 modifiedPos;// = rMat * myPos;
    vec4 offsetPos;

if(vs_Col.a < 0.01){ // coral ID- no animation
modifiedPos = rMatCoral* myPos;
offsetPos = modifiedPos;
}
else{
    modifiedPos = rMat * myPos;
    modifiedPos.xyz += vs_Nor.xyz * sin(modifiedPos.y* 10.0 + (u_Time*0.0025) + vs_Col.a) * 0.1 ;
    offsetPos = modifiedPos;
    offsetPos.xz = modifiedPos.zx; // flip x and z
}

// sin curve on y axis??
//  modifiedPos.xyz += vs_Nor.xyz * sin(modifiedPos.y* 10.0 + (u_Time*0.0025) + vs_Col.a) * 0.1 ;
//  vec4 offsetPos = modifiedPos;
//  offsetPos.xz = modifiedPos.zx; // flip x and z


    vec4 finalPos = overallTransforms * offsetPos;
    gl_Position = u_ViewProj * finalPos;
}