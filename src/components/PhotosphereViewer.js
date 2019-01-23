import {StereoEffect} from './StereoEffect';
import {Scene, PerspectiveCamera,WebGLRenderer, HemisphereLight} from 'three';
import DeviceOrientationControls from 'three.orientation';
import OrbitControls from 'threejs-orbit-controls';
import {Photosphere} from './Photosphere';
import './ES5Polyfill';

export class PhotosphereViewer {
    constructor(textureFileUrl) {
        // binding methods used as event handlers
        this.adjustSize = this.adjustSize.bind(this);
        this.doLoopAnimations = this.doLoopAnimations.bind(this);

        this.setupRenderer();
        this.setupCamera();
		this.setupLight();
		this.setupControls();
     
        this.loadPhotosphere(textureFileUrl);

        this.adjustSize();
        this.startAnimationLoop();

		window.addEventListener('resize', this.adjustSize, false);
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
        this.clock = new THREE.Clock();
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
        const domEl = this.renderer.domElement,
              width = window.innerWidth,
              height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.effect.setSize(width, height);
    }

    dispose() {
        this.isDisposed = true;
        document.body.removeChild(this.renderer.domElement);
        this.renderer.dispose();
    }
}