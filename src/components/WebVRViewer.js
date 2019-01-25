import {Scene, PerspectiveCamera,WebGLRenderer, HemisphereLight, Clock} from 'three';
import OrbitControls from 'threejs-orbit-controls';
import {Photosphere} from './Photosphere';
import './ES5Polyfill';
import VREffect from 'three-vreffect-module';
import VRControls from 'three-vrcontrols-module';
import WebVRPolyfill from 'webvr-polyfill';

export class WebVRViewer {
    constructor(textureFileUrl) {
        this.init(textureFileUrl);
    }

    async init(textureFileUrl) {
        // binding methods used as event handlers
        this.adjustSize = this.adjustSize.bind(this);
        this.doLoopAnimations = this.doLoopAnimations.bind(this);
        this.handleVRDisplayPresentChange = this.handleVRDisplayPresentChange.bind(this);
        
        this.configWebVR();

        this.setupRenderer();
        this.setupCamera();
        this.setupStereo();
		this.setupLight();

        await this.setupControls();
        
        this.loadPhotosphere(textureFileUrl);
        
        window.addEventListener('resize', this.adjustSize, false);
        window.addEventListener('vrdisplaypresentchange', this.handleVRDisplayPresentChange);
    }

    start() {
        // Kick off the render loop.
        this.startAnimationLoop();

        // window.setTimeout(() => { this.vrDisplay.requestPresent([{source: this.renderer.domElement}]); }, 500);
        this.vrDisplay.requestPresent([{source: this.renderer.domElement}])
            .then(() => {})
            .catch(err => console.dir(err));
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
        const domEl = this.renderer.domElement;
        this.effect = new VREffect(this.renderer);
        this.effect.setSize(domEl.clientWidth, domEl.clientHeight, false);
    }

    setupLight() {
        // simplest possible lighting
		this.scene.add(new HemisphereLight(0xffffff, 0x000000, 1));
    }

    async setupControls() {

        // The polyfill provides this in the event this browser
        // does not support WebVR 1.1
        let vrDisplays = await navigator.getVRDisplays();
        // If we have a native display, or we have a CardboardVRDisplay
        // from the polyfill, use it
        if (vrDisplays.length) {
            this.vrDisplay = vrDisplays[0];
            // Apply VR headset positional data to camera.
            this.controls = new VRControls(this.camera);

            // define function to be used to start animation loop
            this.requestAnimationFrame = loopFn => this.vrDisplay.requestAnimationFrame(loopFn);
        }
        // Otherwise, we're on a desktop environment with no native
        // displays, so provide controls for a monoscopic desktop view
        else {
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.target.set(0, 0, -1);
            
            // define function to be used to start animation loop
            this.requestAnimationFrame = loopFn => window.requestAnimationFrame(loopFn);
        }
    }

    loadPhotosphere(textureFileUrl) {
        this.photoSphere = new Photosphere(this.scene, this.renderer, textureFileUrl);
    }

    startAnimationLoop() {
        this.clock = new Clock();
        this.requestAnimationFrame(this.doLoopAnimations);
    }

    doLoopAnimations() {
        if(this.isDisposed) {
            return;
        }
        const dt = this.clock.getDelta();

        this.controls.update(dt);
        this.effect.render(this.scene, this.camera);

        // request the next animation frame
        this.requestAnimationFrame(this.doLoopAnimations);
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
                // VREffect resets the pixel ratio to 1 each time
                // each time the `setSize` is called ...
                // so here we need to correct it back to native ratio
                this.renderer.setPixelRatio(window.devicePixelRatio);
                this.renderer.setSize(width, height);

                this.sizeAdjPending = false;
            }, 250);
        }

        this.sizeAdjPending = true;
    }

    configWebVR() {
        var config = (function() {
            var config = {
                // https://github.com/mrdoob/three.js/issues/9749
                // BUFFER_SCALE: 1
            };
            var q = window.location.search.substring(1);
            if (q === '') {
              return config;
            }

            var params = q.split('&');
            var param, name, value;

            for (var i = 0; i < params.length; i++) {
              param = params[i].split('=');
              name = param[0];
              value = param[1];
              // All config values are either boolean or float
              config[name] = value === 'true' ? true :
                             value === 'false' ? false :
                             parseFloat(value);
            }
            return config;
          })();

        return(new WebVRPolyfill(config));
    }

    handleVRDisplayPresentChange() {
        this.adjustSize();
    }

    dispose() {
        this.isDisposed = true;
        document.body.removeChild(this.renderer.domElement);
        window.removeEventListener('resize', this.adjustSize, false);
        window.removeEventListener('vrdisplaypresentchange', this.handleVRDisplayPresentChange);
        this.renderer.dispose();
    }
}