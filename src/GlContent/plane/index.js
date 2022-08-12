import * as THREE from "three";
import { customizeMaterial } from "../utils/customizeMaterial";
import common_vs from './shaders/common.vs';
import begin_vertex from "./shaders/begin_vertex.vs";
import beginnormal from "./shaders/beginnormal.vs";
import uv_vertex from "./shaders/uv_vertex.vs";
import common_fs from "./shaders/common.fs";
import normal_fragment_begin from "./shaders/normal_fragment_begin.fs";
import aomap_fragment from "./shaders/aomap_fragment.fs";
import output_fragment from "./shaders/output_fragment.fs";

const MAX_OCTAVES = 7;

export default class Plane {
  constructor(width, height, widthSegment, heightSegment) {
    this.uniforms = {
      uTime: {
        value: 0,
      },
      uSubdivision: {
        value: new THREE.Vector2(widthSegment, heightSegment),
      },
      uNumOctaves: {
        value: MAX_OCTAVES,
      },
      uFrequency1: {
        value: 3.0,
      },
      uFrequency2: {
        value: 4.0,
      },
      uAmplitude1: {
        value: 0.3,
      },
      uAmplitude2: {
        value: 0.02,
      },
      uHeightShadeStart: {
        value: 0.03,
      },
      uHeightShadeLength: {
        value: 0.15,
      },
      uLimPower: {
        value: 0.8,
      },
    }

    const geometry = new THREE.PlaneBufferGeometry(1, 1, widthSegment, heightSegment);
    geometry.computeTangents();
    this.material = customizeMaterial(
      new THREE.MeshStandardMaterial({
        flatShading: true,
        metalness: 1.2,
        roughness: 1,
        envMapIntensity: 0.9,
        defines: {
          MAX_OCTAVES: MAX_OCTAVES.toFixed(0),
          USE_TANGENT: '',
        },
      }),
      this.uniforms,
      this.customizeShader.bind(this)
    );
    this.depthMaterial = customizeMaterial(
      new THREE.MeshDepthMaterial({
        depthPacking: THREE.RGBADepthPacking,
      }),
      this.uniforms,
      this.customizeShader.bind(this)
    );
    this.obj = new THREE.Mesh(geometry, this.material.material);
    this.time = 0;
    this.timescale = 1;

    this.init();
  }

  init() {
    this.obj.castShadow = true
    this.obj.receiveShadow = true
    this.obj.customDepthMaterial = this.depthMaterial.material;
    this.obj.rotation.x = -Math.PI / 2
    this.obj.scale.set(3, 3, 3);
  }

  update(deltaTime) {
    this.time += deltaTime;
    this.uniforms.uTime.value = this.time * this.timescale;
  }

  customizeShader(shader, renderer) {
    shader.vertexShader =
      shader.vertexShader
        .replace('#include <common>', common_vs)
        .replace('#include <uv_vertex>', uv_vertex)
        .replace('#include <beginnormal_vertex>', beginnormal)
        .replace('#include <begin_vertex>', begin_vertex);

    shader.fragmentShader =
      shader.fragmentShader
        .replace('#include <common>', common_fs)
        .replace('#include <normal_fragment_begin>', normal_fragment_begin)
        .replace('#include <aomap_fragment>', aomap_fragment)
        .replace('#include <output_fragment>', output_fragment);

      // // test
      // shader.fragmentShader =
      //   shader.fragmentShader
      //     .replace('#include <common>', `
      //       #include <common>
      //       uniform float uTime;
      //     `)
      //     .replace('#include <output_fragment>',
      //     `
      //       #include <output_fragment>
      //       gl_FragColor = vec4(abs(sin(uTime)), 0., 0., 1.);
      //     `);

  }
}