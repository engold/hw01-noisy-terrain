import {vec2, vec4, mat4} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';

var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;
  attrCol: number;
  //attrTranslate: number;
  //attrUv: number;
    // Added for HW4
  // transform matrix columns
  attrTransformC1: number;
  attrTransformC2: number;
  attrTransformC3: number;
  attrTransformC4: number;

  unifModel: WebGLUniformLocation;
  unifModelInvTr: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;
  unifColor: WebGLUniformLocation;
  unifPlanePos: WebGLUniformLocation;
  unifHeightVar: WebGLUniformLocation;// added for hw1
  unifGlacierHeight: WebGLUniformLocation;// added for hw1
  unifTime: WebGLUniformLocation; // for u_Time

  constructor(shaders: Array<Shader>) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrNor = gl.getAttribLocation(this.prog, "vs_Nor");
    this.attrCol = gl.getAttribLocation(this.prog, "vs_Col");
    //this.attrTranslate = gl.getAttribLocation(this.prog, "vs_Translate");
    //this.attrUv = gl.getAttribLocation(this.prog, "vs_UV");
    this.unifModel      = gl.getUniformLocation(this.prog, "u_Model");
    this.unifModelInvTr = gl.getUniformLocation(this.prog, "u_ModelInvTr");
    this.unifViewProj   = gl.getUniformLocation(this.prog, "u_ViewProj");
    this.unifPlanePos   = gl.getUniformLocation(this.prog, "u_PlanePos");
    this.unifHeightVar   = gl.getUniformLocation(this.prog, "u_HeightVar"); // added for hw1
    this.unifGlacierHeight   = gl.getUniformLocation(this.prog, "u_GlacierHeight"); // added for hw1
    this.unifTime   = gl.getUniformLocation(this.prog, "u_Time"); // added for hw1
      // Added for HW4
      this.attrTransformC1 = gl.getAttribLocation(this.prog, "vs_TransformC1");
      this.attrTransformC2 = gl.getAttribLocation(this.prog, "vs_TransformC2");
      this.attrTransformC3 = gl.getAttribLocation(this.prog, "vs_TransformC3");
      this.attrTransformC4 = gl.getAttribLocation(this.prog, "vs_TransformC4");
  }

  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      activeProgram = this.prog;
    }
  }

//for hw1
setHeightVar(height: number){
  this.use();
  if (this.unifHeightVar !== -1) {
    gl.uniform1f(this.unifHeightVar, height);
  }

}

//for hw1
setGlacierHeightVar(height: number){
  this.use();
  if (this.unifGlacierHeight !== -1) {
    gl.uniform1f(this.unifGlacierHeight, height);
  }

}

// for u_Time
setUTime(t: number){
  this.use();
  if (this.unifTime !== -1) {
    gl.uniform1f(this.unifTime, t);
  }

}


  setModelMatrix(model: mat4) {
    this.use();
    if (this.unifModel !== -1) {
      gl.uniformMatrix4fv(this.unifModel, false, model);
    }

    if (this.unifModelInvTr !== -1) {
      let modelinvtr: mat4 = mat4.create();
      mat4.transpose(modelinvtr, model);
      mat4.invert(modelinvtr, modelinvtr);
      gl.uniformMatrix4fv(this.unifModelInvTr, false, modelinvtr);
    }
  }

  setViewProjMatrix(vp: mat4) {
    this.use();
    if (this.unifViewProj !== -1) {
      gl.uniformMatrix4fv(this.unifViewProj, false, vp);
    }
  }

  setPlanePos(pos: vec2) {
    this.use();
    if (this.unifPlanePos !== -1) {
      gl.uniform2fv(this.unifPlanePos, pos);
    }
  }

  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrPos, 0); // advance one index in pos VBO for each vertex
    }

    if (this.attrNor != -1 && d.bindNor()) {
      gl.enableVertexAttribArray(this.attrNor);
      gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrNor, 0);  // advance one index in nor VBO for each vertex
    }
    if (this.attrCol != -1 && d.bindCol()) {
      gl.enableVertexAttribArray(this.attrCol);
      gl.vertexAttribPointer(this.attrCol, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrCol, 1);
    }
     // TODO: Set up attribute data for additional instanced rendering data as needed
     if (this.attrTransformC1 != -1 && d.bindTransformC1()) {
      gl.enableVertexAttribArray(this.attrTransformC1);
      gl.vertexAttribPointer(this.attrTransformC1, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTransformC1, 1); // Advance 1 index in VBO
    }

    if (this.attrTransformC2 != -1 && d.bindTransformC2()) {
      gl.enableVertexAttribArray(this.attrTransformC2);
      gl.vertexAttribPointer(this.attrTransformC2, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTransformC2, 1); // Advance 1 index
    }

    if (this.attrTransformC3 != -1 && d.bindTransformC3()) {
      gl.enableVertexAttribArray(this.attrTransformC3);
      gl.vertexAttribPointer(this.attrTransformC3, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTransformC3, 1); // Advance 1 index
    }

    if (this.attrTransformC4 != -1 && d.bindTransformC4()) {
      gl.enableVertexAttribArray(this.attrTransformC4);
      gl.vertexAttribPointer(this.attrTransformC4, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTransformC4, 1); // Advance 1 index
    }

    d.bindIdx();
    gl.drawElementsInstanced(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0, d.numInstances);
    gl.drawElements(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrNor != -1) gl.disableVertexAttribArray(this.attrNor);
    if (this.attrCol != -1) gl.disableVertexAttribArray(this.attrCol);
     // Added for HW4
     if (this.attrTransformC1 != -1) gl.disableVertexAttribArray(this.attrTransformC1);
     if (this.attrTransformC2 != -1) gl.disableVertexAttribArray(this.attrTransformC2);
     if (this.attrTransformC3 != -1) gl.disableVertexAttribArray(this.attrTransformC3);
     if (this.attrTransformC4 != -1) gl.disableVertexAttribArray(this.attrTransformC4);
  }
};

export default ShaderProgram;
