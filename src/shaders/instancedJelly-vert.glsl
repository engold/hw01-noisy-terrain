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


    float a = 110.0 * PI /180.0; // angle to rad conversion
    //           rotate on Y axis, angle in rads
    mat4 rMat = rotationMatrix(vec3(0.0, 1.0, 0.0), a);
    // apply individual transforms per instance
    mat4 overallTransforms = mat4(vs_TransformC1, vs_TransformC2, vs_TransformC3, vs_TransformC4);
    vec4 modifiedPos = rMat * vs_Pos;

    //modifiedPos.y += (sin(u_Time * 0.005)/ 2.0); // bob up and down
    float t = sin(u_Time * 0.0005);
    float offset = 0.5 * sin(vs_Pos.y * 2.0 + float(u_Time*0.025)) + 0.5;
    
//    float dist = distance(vs_Pos.xyz, vec3(0.0,0.0,0.0));
//    //Adjust our distance to be non-linear.
//     dist = pow(dist,4.0);
//     //Set the max amount a wave can be distorted based on distance.
//     dist = max(dist, 1.0);
//     modifiedPos.xyz += vs_Nor.xyz * sin(modifiedPos.x *0.4 + (u_Time* 0.005)) * 0.5 * (1.0 / dist); // looks like breathing motion?

    // jellyfish motion - waves down body
    modifiedPos.xyz += vs_Nor.xyz * sin(modifiedPos.y* 10.0 + u_Time*0.005) * 0.1;
    //modifiedPos.y += clamp(sin(u_Time * 0.005)*2.0, 0.0, 2.0); // for a jumpy motion
     modifiedPos.y += (sin(u_Time * 0.0009)/ 1.35); 

    vec4 finalPos = overallTransforms * modifiedPos;
    gl_Position = u_ViewProj * finalPos;
}