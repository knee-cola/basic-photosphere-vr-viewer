import {StereoEffect} from './StereoEffect';
import {Scene, PerspectiveCamera,WebGLRenderer, HemisphereLight, Clock} from 'three';
import DeviceOrientationControls from 'three.orientation';
import OrbitControls from 'threejs-orbit-controls';
import {Photosphere} from './Photosphere';
import './ES5Polyfill';
import { FullScreenUtil } from './FullScreenUtil';

export class StereoEffectViewer {
    constructor(textureFileUrl, exitHandler) {

        // binding methods used as event handlers
        this.adjustSize = this.adjustSize.bind(this);
        this.doLoopAnimations = this.doLoopAnimations.bind(this);

        this.setupRenderer();
        this.setupCamera();
        this.setupStereo();
		this.setupLight();
		this.setupControls();
     
        this.loadPhotosphere(textureFileUrl);

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
                x: 0,
                y: 10, // kamera je na visini od 10 nečega
                z: 0
            };

		// http://threejs.org/docs/#Reference/Cameras/PerspectiveCamera
		this.camera = new PerspectiveCamera(fieldOfView, aspectRatio, near, far);
		this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);

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

        // IF device orientation is available
        // > setup 
		if (window.DeviceOrientationEvent) {
            this.controls = new DeviceOrientationControls(this.camera);
            this.controls.connect();
            this.controls.update();
		} else {
            this.controls = new OrbitControls(this.camera, domEl);
            this.controls.noPan = true;
            this.controls.noZoom = true;
            this.controls.rotateUp(-Math.PI/2); // rotiram kameru da gleda u horizont
		}
    }

    loadPhotosphere(textureFileUrl) {
        this.photoSphere = new Photosphere(this.scene, this.renderer, textureFileUrl);
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

        this.controls.update(dt);
        this.effect.render(this.scene, this.camera);

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
        
                this.effect.setSize(width, height);
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