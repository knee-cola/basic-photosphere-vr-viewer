/**
 * Based on http://www.decarpentier.nl/lens-distortion
 */

import {StereoCamera} from 'three';
import EffectComposer, { RenderPass, ShaderPass } from 'three-effectcomposer-es6'
import * as dat from 'dat.gui';

export class DistortionShader {

    constructor(renderer, camera, scene) {

        this.renderer = renderer;
        this.camera = camera;
        this.scene = scene;

        // https://rawgit.com/owntheweb/three.js/dev/examples/vr_effect_composer_stereo_camera.html
        this.stereoCamera = new StereoCamera();
        this.stereoCamera.aspect = 0.5;

        this.composer = new EffectComposer(renderer);

        this.renderPass = new RenderPass(scene, camera);
        this.composer.addPass(this.renderPass);

        this.shaderPass = new ShaderPass(this.getDistortionShaderDefinition());
        this.shaderPass.renderToScreen = true;
        this.composer.addPass(this.shaderPass);

        this.guiParameters = {
            horizontalFOV:		140,
            strength: 			0.5,
            cylindricalRatio:	2,
        };

        this.updateDistortionEffect();
        this.updateDistortionEffect = this.updateDistortionEffect.bind(this);
    }

    setSize(width, height) {
        this.composer.setSize(width, height);
        this.composer.reset();
    }

    render() {
        const { renderer, camera, scene, composer, renderPass, stereoCamera } = this;

        scene.updateMatrixWorld();
        camera.updateMatrixWorld();
        stereoCamera.update(camera);

        const {width, height } = renderer.getSize(),
              top = 0,
              left = 0,
              bottom = width,
              right = height,
              center = right / 2;

        renderer.clear();
//        renderer.setScissorTest( true );
//        renderer.setScissor( left, top, center, bottom);
        renderer.setViewport( left, top, right, bottom/2);
        renderPass.camera = camera; //note: bending rule by setting RenderPass.camera directly without set/get methods
        composer.render();

//        renderer.setViewport( center, top, right, bottom);
//        renderer.setScissor( center, top, right, bottom);
//        renderPass.camera = stereoCamera.cameraR; //note: bending rule by setting RenderPass.camera directly without set/get methods
//        composer.render();
//        renderer.setScissorTest( false );
    }

    showGUI() {
        this.gui = new dat.GUI({width:320});
        this.gui.add( this.guiParameters, "horizontalFOV", 5, 160, 1 ).onChange( this.updateDistortionEffect );
        this.gui.add( this.guiParameters, "strength", 0.0, 1.0, 0.025 ).onChange( this.updateDistortionEffect );
        this.gui.add( this.guiParameters, "cylindricalRatio", 0.25, 4.0, 0.025 ).onChange( this.updateDistortionEffect );
    }

    getDistortionShaderDefinition() {
        return({
            uniforms: {
                "tDiffuse": 		{ type: "t", value: null },
                "strength": 		{ type: "f", value: 0 },
                "height": 			{ type: "f", value: 1 },
                "aspectRatio":		{ type: "f", value: 1 },
                "cylindricalRatio": { type: "f", value: 1 }
            },

            vertexShader: [
                "uniform float strength;",          // s: 0 = perspective, 1 = stereographic
                "uniform float height;",            // h: tan(verticalFOVInRadians / 2)
                "uniform float aspectRatio;",       // a: screenWidth / screenHeight
                "uniform float cylindricalRatio;",  // c: cylindrical distortion ratio. 1 = spherical
                
                "varying vec3 vUV;",                // output to interpolate over screen
                "varying vec2 vUVDot;",             // output to interpolate over screen
                
                "void main() {",
                    "gl_Position = projectionMatrix * (modelViewMatrix * vec4(position, 1.0));",
                
                    "float scaledHeight = strength * height;",
                    "float cylAspectRatio = aspectRatio * cylindricalRatio;",
                    "float aspectDiagSq = aspectRatio * aspectRatio + 1.0;",
                    "float diagSq = scaledHeight * scaledHeight * aspectDiagSq;",
                    "vec2 signedUV = (2.0 * uv + vec2(-1.0, -1.0));",
                
                    "float z = 0.5 * sqrt(diagSq + 1.0) + 0.5;",
                    "float ny = (z - 1.0) / (cylAspectRatio * cylAspectRatio + 1.0);",
                
                    "vUVDot = sqrt(ny) * vec2(cylAspectRatio, 1.0) * signedUV;",
                    "vUV = vec3(0.5, 0.5, 1.0) * z + vec3(-0.5, -0.5, 0.0);",
                    "vUV.xy += uv;",
                "}"
            ].join("\n"),
            
            fragmentShader: [
                "uniform sampler2D tDiffuse;",      // sampler of rendered scene�s render target
                "varying vec3 vUV;",                // interpolated vertex output data
                "varying vec2 vUVDot;",             // interpolated vertex output data

                "void main() {",
                    "vec3 uv = dot(vUVDot, vUVDot) * vec3(-0.5, -0.5, -1.0) + vUV;",
                    "gl_FragColor = texture2DProj(tDiffuse, uv);",
                "}"
            ].join("\n")
        });
    }

    updateDistortionEffect() {

        if(!this.shaderPass) {
            return;
        }

        const guiParameters = this.guiParameters,
              camera = this.camera,
              shaderPass = this.shaderPass;
        
        const height = Math.tan(THREE.Math.degToRad(guiParameters.horizontalFOV) / 2) / camera.aspect;

        camera.fov = Math.atan(height) * 2 * 180 / 3.1415926535;
        camera.updateProjectionMatrix();
        
        shaderPass.uniforms[ "strength" ].value = guiParameters.strength;
        shaderPass.uniforms[ "height" ].value = height;
        shaderPass.uniforms[ "aspectRatio" ].value = camera.aspect;
        shaderPass.uniforms[ "cylindricalRatio" ].value = guiParameters.cylindricalRatio;
    }

    dispose() {
        if(this.gui) {
            this.gui.destroy();
            this.gui = null;
        }
    }
}