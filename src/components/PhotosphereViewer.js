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
        this.onFullscreen = this.onFullscreen.bind(this);
        // this.setupViewport = this.setupViewport.bind(this);

        // this.setupViewport();
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
        const devicePixelRatio = window.devicePixelRatio;
		this.renderer.setSize(window.innerWidth*devicePixelRatio, window.innerHeight*devicePixelRatio);
        
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

//    /**
//     * Scales viewport so that native pixel density is used
//     */
//	setupViewport() {
//
//        let viewportMeta = [].filter.call(document.getElementsByTagName('meta'), el => el.name === "viewport");
//        
//        // IF no viewport <meta> exists in the document
//        // > create one
//        if(viewportMeta.length === 0) {
//            viewportMeta = document.createElement('META');
//            viewportMeta.name = 'viewport';
//            document.head.appendChild(viewportMeta);
//
//        } else {
//            viewportMeta=viewportMeta[0]; // filter function returns an array
//        }
//
//        const scale = 1/window.devicePixelRatio;
//
//        // scale viewpoer
//		viewportMeta.setAttribute('content', `initial-scale=${scale}, maximum-scale=${scale}, user-scalable=0`);
//    }
    
    setupControls() {
        const domEl = this.renderer.domElement;

        // IF device orientation is available
        // > setup 
		if (window.DeviceOrientationEvent) {
            this.controls = new DeviceOrientationControls(this.camera);
            this.controls.connect();
            this.controls.update();

            // user interaction is needed for the fullscreen to be activated
//            domEl.addEventListener('click', this.gotoFullscreen.bind(this), false);  
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

    gotoFullscreen() {

        const domEl = document.body;
        let eventName;

		if (domEl.requestFullscreen) {
			eventName = "fullscreenchange";
			domEl.requestFullscreen();
		} else if (domEl.msRequestFullscreen) {
			eventName = "msfullscreenchange";
			domEl.msRequestFullscreen();
		} else if (domEl.mozRequestFullScreen) {
			eventName = "mozfullscreenchange";
			domEl.mozRequestFullScreen();
		} else if (domEl.webkitRequestFullscreen) {
			eventName = "webkitfullscreenchange";
			domEl.webkitRequestFullscreen();
		}

        if(!this.fsEvAttached) {
            document.addEventListener(eventName, this.onFullscreen, false);
            this.fsEvAttached = true;
        }
    }

    onFullscreen() {
		// window.setTimeout(this.setupViewport, 0);
    }

    startAnimationLoop() {
        this.clock = new THREE.Clock();
        requestAnimationFrame(this.doLoopAnimations);
    }

    doLoopAnimations() {
        const dt = this.clock.getDelta();

        this.controls.update(dt);
        this.effect.render(this.scene, this.camera);

        // request the next animation frame
        requestAnimationFrame(this.doLoopAnimations);
    }

    adjustSize() {
        const domEl = this.renderer.domElement,
              devicePixelRatio = window.devicePixelRatio;
              width = window.innerWidth*devicePixelRatio,
              height = window.innerHeight*devicePixelRatio;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.effect.setSize(width, height);
    }
}