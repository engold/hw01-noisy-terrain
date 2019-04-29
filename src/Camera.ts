var CameraControls = require('3d-view-controls');
import {vec3, mat4} from 'gl-matrix';

class Camera {
  controls: any;
  projectionMatrix: mat4 = mat4.create();
  viewMatrix: mat4 = mat4.create();
  fovy: number = 45;
  aspectRatio: number = 1;
  near: number = 0.1;
 // far: number = 1000;
  far: number = 1000; // tried to double gow far I see in Z dir?
  position: vec3 = vec3.create();
  direction: vec3 = vec3.create();
  target: vec3 = vec3.create();
  up: vec3 = vec3.create();

  constructor(position: vec3, target: vec3) {
    this.controls = CameraControls(document.getElementById('canvas'), {
      eye: position,
      center: target,
    });
    vec3.add(this.target, this.position, this.direction);
    mat4.lookAt(this.viewMatrix, this.controls.eye, this.controls.center, this.controls.up);
  }

  setAspectRatio(aspectRatio: number) {
    this.aspectRatio = aspectRatio;
  }

  updateProjectionMatrix() {
    mat4.perspective(this.projectionMatrix, this.fovy, this.aspectRatio, this.near, this.far);
  }

  update() {
    this.controls.tick();
    vec3.add(this.target, this.position, this.direction);
   // this.position = vec3.fromValues(this.controls.eye[0], this.controls.eye[1], this.controls.eye[2]); // added
   // this.target = vec3.fromValues(this.controls.center[0], this.controls.center[1], this.controls.center[2]); // added
    mat4.lookAt(this.viewMatrix, this.controls.eye, this.controls.center, this.controls.up);
    // added
   //  this.position = this.controls.eye;
  }
};

export default Camera;
