import {StereoEffect} from './StereoEffect';
import {Scene, PerspectiveCamera,WebGLRenderer, HemisphereLight, Clock, PlaneGeometry, ShadowMaterial, GridHelper, Mesh} from 'three';
import {Photosphere} from './Photosphere';
import './ES5Polyfill';
import { InvertedOrientationControls } from './InvertedOrientationControls';
import { FullScreenUtil } from './FullScreenUtil';

export class StereoEffectDistortionViewer {
    constructor(textureFileUrl, exitHandler) {

        // binding methods used as event handlers
        this.adjustSize = this.adjustSize.bind(this);
        this.doLoopAnimations = this.doLoopAnimations.bind(this);

        this.setupRenderer();
        this.setupCamera();
        this.setupStereo();
        this.setupLight();
     
        this.loadPhotosphere(textureFileUrl).then(() => {
            this.setupControls();
        });

        this.fsUtil = new FullScreenUtil();

        this.fsUtil.onExitFullscreen(() => {
            this.dispose();
            if(exitHandler) {
                exitHandler();
            }
        });

        this.fsUtil.enterFullscreen().then(() => {
            this.adjustSize();
            this.startAnimationLoop();
            window.addEventListener('resize', this.adjustSize, false);
        });
}
    
    setupRenderer() {
        this.renderer = new WebGLRenderer();

        const domEl = this.renderer.domElement;
        
		this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        document.body.appendChild(domEl);

        this.scene = new Scene();
    }

    setupCamera() {

		const fieldOfView = 90,
			aspectRatio = 1,
			near = 1,
			far = 1000,
            cameraPosition = {
                x: 300,
                y: 0,
                z: 0
            };

		// http://threejs.org/docs/#Reference/Cameras/PerspectiveCamera
		this.camera = new PerspectiveCamera(fieldOfView, aspectRatio, near, far);
        this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);

        this.camera.lookAt(0,0,0);
        
        this.scene.add(this.camera);
    }

    setupStereo() {
        this.effect = new StereoEffect(this.renderer);
        this.effect.setEyeSeparation(-6);

//        this.eyeSeparation = -10;
//
//        this.renderer.domElement.addEventListener('click', () => {
//            this.effect.setEyeSeparation(this.eyeSeparation++);
//        });  
    }

    setupLight() {
        // simplest possible lighting
		this.scene.add(new HemisphereLight(0xffffff, 0x000000, 1));
    }

    setupControls() {
        const domEl = this.renderer.domElement;

        this.controls = new InvertedOrientationControls(this.photoSphere.sphereMesh);
        this.controls.connect();
        this.controls.update();
    }

    loadPhotosphere(textureFileUrl) {
        this.photoSphere = new Photosphere(this.scene, this.renderer);
        return(this.photoSphere.loadTexture(textureFileUrl));
    }

    startAnimationLoop() {
        this.clock = new Clock();
        requestAnimationFrame(this.doLoopAnimations);
    }

    doLoopAnimations() {
        if(this.isDisposed) {
            return;
        }
        const dt = this.clock.getDelta();

        if(this.controls) {
            let rotQ = this.controls.update();
            this.photoSphere.updateDeformation(rotQ);
            this.photoSphere.commitDeformation();
        }

        if(this.effect) {
            this.effect.render(this.scene, this.camera);
        } else {
            this.renderer.render(this.scene, this.camera);
        }

        // request the next animation frame
        requestAnimationFrame(this.doLoopAnimations);
    }

    adjustSize() {
        // The delay ensures the browser has a chance to layout
        // the page and update the clientWidth/clientHeight.
        // This problem particularly crops up under iOS.
        if (!this.sizeAdjPending) {
            window.setTimeout(() => {
                const domEl = this.renderer.domElement,
                      width = window.innerWidth,
                      height = window.innerHeight;
  
                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix();
        
                if(this.effect) {
                    this.effect.setSize(width, height);
                }
                this.renderer.setSize(width, height);

                this.sizeAdjPending = false;
            }, 250);
        }

        this.sizeAdjPending = true;
    }

    dispose() {
        this.isDisposed = true;
        document.body.removeChild(this.renderer.domElement);
        this.renderer.dispose();
    }
}