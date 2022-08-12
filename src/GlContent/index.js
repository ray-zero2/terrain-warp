import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'lil-gui';
import { EffectPass, DepthOfFieldEffect, VignetteEffect, EffectComposer, RenderPass, FXAAEffect, SepiaEffect, SMAAEffect } from 'postprocessing';

import Camera from './Camera';
// import Petal from './petals/Petal';
import Plane from './plane';
import noiseTex from './textures/snoise.png';
import petalTex from './textures/petal.png';

export default class WebGLContent {
  constructor(canvas, ) {
    this.canvas = canvas;
    this.time = 0;
    this.resolution = {
      x: canvas.offsetWidth,
      y: canvas.offsetHeight
    };
    this.dpr = Math.min(window.devicePixelRatio, 2);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      stencil: false,
      depth: false,
      powerPreference: "high-performance"
    });
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    this.scene = new THREE.Scene();
    this.camera = new Camera({
      fov: 30,
      aspect: this.resolution.x / this.resolution.y,
      far: 20,
      near: 0.1,
      canvas,
      enableControl: true,
      enableDamping: true,
      dampingFactor: 0.05
    });
    this.clock = new THREE.Clock(true);
    this.plane = null;
    this.lights = {
      directional1: new THREE.DirectionalLight()
    };
    this.composer = new EffectComposer(undefined, {
      // multisampling: this.dpr === 1 ? 2 : undefined,
    });

    this.stats = new Stats()
    this.gui = new GUI();

    this.init().then(this.start.bind(this));
  }

  resize(width, height) {
    this.resolution.x = width;
    this.resolution.y = height;
    this.dpr = Math.min(window.devicePixelRatio , 2);
    this.renderer.setSize(this.resolution.x, this.resolution.y, false);
    this.camera.resize(this.resolution);
    this.composer?.setSize(this.resolution.x, this.resolution.y);
  }

  async init() {
    document.body.appendChild(this.stats.dom);
    this.renderer.toneMapping = THREE.CineonToneMapping;
    this.renderer.toneMappingExposure = 6;
    this.plane = new Plane(50, 50, 256, 256);
    this.scene.add(this.lights.directional1);
    this.scene.add(this.plane.obj);
    this.camera.init();
    this.setRenderer();
    this.setLights();
    this.setEffect();
    this.bind();

    // // gridHelper
    // const gridHelper = new THREE.GridHelper(200, 50);  // 引数は サイズ、1つのグリッドの大きさ
    // this.scene.add(gridHelper);

    // // axisHelper
    // const axisHelper = new THREE.AxesHelper(1000);  // 引数は 軸のサイズ
    // this.scene.add(axisHelper);

    this.handleResize();
  }

  // async fetchObjects() {
  //   const textureLoader = new THREE.TextureLoader();

  //   return await Promise.all([
  //     textureLoader.loadAsync(noiseTex),
  //     textureLoader.loadAsync(petalTex),
  //   ]).then((response) => {
  //     const noiseTexture = response[0];
  //     const petalTexture = response[1];
  //     noiseTexture.wrapS = THREE.MirroredRepeatWrapping;
  //     noiseTexture.wrapT = THREE.MirroredRepeatWrapping;
  //     petalTexture.mipmaps = THREE.LinearMipMapLinearFilter;
  //     const textures = {
  //       noise: noiseTexture,
  //       petal: petalTexture
  //     }
  //     return { textures };
  //   });
  // }


  start() {
    this.animate();
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    const deltaTime = this.clock.getDelta();
    this.time += deltaTime;
    this.camera.update(deltaTime);
    // this.petal.update(deltaTime);
    this.plane.update(deltaTime);
    // this.renderer.render(this.scene, this.camera);
    this.composer.render(deltaTime);
    this.stats.update();
  }

  setRenderer() {
    this.renderer.setSize(this.resolution.x, this.resolution.y, false);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.clearColor('#020203');
  }

  setLights() {
    const directionalLight = this.lights.directional1;
    directionalLight.intensity = 1;
    directionalLight.position.set(1, 0.5, -1.5).normalize().multiplyScalar(30);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024)
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 5.5
    directionalLight.shadow.camera.left = -2
    directionalLight.shadow.camera.right = 2
    directionalLight.shadow.camera.top = 1.5
    directionalLight.shadow.camera.bottom = -0.5
    directionalLight.shadow.normalBias = 0.005
    directionalLight.shadow.bias = 0.01
  }

  setEffect() {
    this.composer.setRenderer(this.renderer);
    this.composer.setSize(this.resolution.x, this.resolution.y, false);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const dofEffect = new DepthOfFieldEffect(this.camera, {
      focalLength: 0.06,
      bokehScale: 8.0,
      resolutionScale: 0.25
    });
    dofEffect.target = new THREE.Vector3(0, 0, 0);
    const dofPass = new EffectPass(this.camera, dofEffect);
    this.composer.addPass(dofPass);
    this.composer.addPass(new EffectPass(this.camera, new VignetteEffect()));

    const folder = this.gui.addFolder('Depth of field')
    folder
      .add({ enabled: dofPass.enabled }, 'enabled')
      .onChange((value) => {
        dofPass.enabled = value
      })
    folder.add(dofEffect, 'bokehScale').min(0).max(20).step(0.5)
    folder
      .add(dofEffect.circleOfConfusionMaterial, 'focalLength')
      .min(0.01)
      .max(0.15)
      .step(0.01)
  }

  handleResize() {
    const width = this.canvas.offsetWidth;
    const height = this.canvas.offsetHeight;
    console.log(window.innerWidth, window.innerHeight);
    this.resize(window.innerWidth, window.innerHeight);
  }

  bind() {
    window.addEventListener('resize', this.handleResize.bind(this));
  }
}
