	THREE.Photosphere = function (domEl, image, options) {
	options = options || {};

	var camera, controls, scene, renderer, sphere, element, textMesh;
	var clock = new THREE.Clock();
	var debugDiv = document.getElementById('debug');
	let reqAnimationFrame;

	setupViewport();

	init().then(()=> {
		update_new(clock.getDelta());
		animate_new();
	});

	// POKUŠATI slijedeći source: http://vr.chromeexperiments.com/, koji je trivijalno jednostavan, pa ga prilagoditi
	// ... stvar prilagodim tako da ne prikazuje sferu

	function init () {

		setupWebVR();

		makeRenderer();
		makeScene();

		let promise = attachControls(camera).then(() => {
			makeSphere();

			makeLight(scene);
	
			// kreiram grupu u ću rotirati
			var pivot = new THREE.Object3D();
			
			camera.add( pivot );
	
			// podešavam poziciju grupe u odnosu na ishodište
			pivot.position.x = 0;
			pivot.position.y = -5;
			pivot.position.z = -30;
	
//			// kreiram tekst i smještam ga u koordinatama pivota (unutar njega)
//			var textMesh = makeText('Sphere', {x:-10, y:0, z:-10});
//			pivot.add( textMesh );
	
			// rotiram pivot
			animateObj(pivot);
	
			window.addEventListener('resize', resize_new, false);
			setTimeout(resize_new, 1);
		});

		return(promise);
	}

	function makeRenderer() {
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(domEl.offsetWidth, domEl.offsetHeight);
		element = renderer.domElement;

		renderer.setPixelRatio(Math.floor(window.devicePixelRatio));
				
		domEl.appendChild(element);

//preWebVR		// samo desktopi imaju devicePixelRatio===1
//preWebVR		if(window.devicePixelRatio !== 1) {
//preWebVR			effect = new THREE.StereoEffect(renderer);
//preWebVR		}

		// Apply VR stereo rendering to renderer.
		effect = new THREE.VREffect(renderer);
		effect.setSize(domEl.offsetWidth, domEl.offsetHeight, false);
	}


	function makeScene() {
//preWebVR		let fieldOfView = options.view || 90,
//preWebVR			aspectRatio = 1, // domEl.offsetWidth / domEl.offsetHeight,
//preWebVR			near = 1,
//preWebVR			far = 1000;
//preWebVR
//preWebVR		// http://threejs.org/docs/#Reference/Cameras/PerspectiveCamera
//preWebVR		camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, near, far);
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

//		camera.position.set(0.1, options.y || 0, 0);
	
		let pos = {
			x: 0,
			y: 10, // kamera je na visini od 10 nečega
			z: 0
		};
		camera.position.set(pos.x, pos.y, pos.z);

		scene = new THREE.Scene();
		scene.add(camera);

		return(camera);
	}

	function attachControls(camera) {

		// The polyfill provides this in the event this browser
		// does not support WebVR 1.1
		return(
			navigator.getVRDisplays().then(function (vrDisplays) {

				// If we have a native display, or we have a CardboardVRDisplay
				// from the polyfill, use it
				if (vrDisplays.length) {

					vrDisplay = vrDisplays[0];
					// Apply VR headset positional data to camera.
					controls = new THREE.VRControls(camera);

					// register a function which kicks off the render loop.
					reqAnimationFrame = animate => vrDisplay.requestAnimationFrame(animate);
					
				}
				// Otherwise, we're on a desktop environment with no native
				// displays, so provide controls for a monoscopic desktop view
				else {
					controls = new THREE.OrbitControls(camera, element);
					controls.noPan = true;
					controls.noZoom = true;
			
					controls.rotateUp(-Math.PI/2); // rotiram kameru da gleda u horizont

	//				controls = new THREE.OrbitControls(camera);
	//				controls.target.set(0, 0, -1);
	//				// Disable the "Enter VR" button
	//				var enterVRButton = document.querySelector('#vr');
	//				enterVRButton.disabled = true;
	//				// Kick off the render loop.
	//				requestAnimationFrame(animate);

					// register a function which kicks off the render loop.
					reqAnimationFrame = animate => requestAnimationFrame(animate);
				}
			})
		);

//		controls.rotateLeft(Math.PI / 2);

		// ne znam točno kaj ovdje radim ... ono kaj znam je da ako je to uključeno kamera gleda u određenom smjeru
//		controls.target.set(
//			camera.position.x+0.1,
//			camera.position.y,
//			camera.position.z
//		);
//
////		controls.autoRotate = true;
////		controls.autoRotateSpeed = options.speed || 0.5;
////		controls.addEventListener('change', render_original);   <---- ovo je loše - bolje se vezati za CLOCK

//pre-webVR		function setOrientationControls(e) {
//pre-webVR		  if (!e.alpha) {
//pre-webVR			return;
//pre-webVR		  }
//pre-webVR  
//pre-webVR		  controls = new THREE.DeviceOrientationControls(camera, true);
//pre-webVR		  controls.connect();
//pre-webVR		  controls.update();
//pre-webVR  
//pre-webVR		  element.addEventListener('click', fullscreen_new, false);
//pre-webVR  
//pre-webVR		  window.removeEventListener('deviceorientation', setOrientationControls, true);
//pre-webVR		}
//pre-webVR
//pre-webVR		window.addEventListener('deviceorientation', setOrientationControls, true);
	}

	function makeGround () {
		var texture = THREE.ImageUtils.loadTexture(
			'textures/patterns/checker.png'
		);

		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat = new THREE.Vector2(50, 50);
		texture.anisotropy = renderer.getMaxAnisotropy();

		var material = new THREE.MeshPhongMaterial({
			color: 0xffffff,
			specular: 0xffffff,
			shininess: 20,
			shading: THREE.FlatShading,
			map: texture
		});

		var geometry = new THREE.PlaneGeometry(1000, 1000);

		var mesh = new THREE.Mesh(geometry, material);
		mesh.rotation.x = -Math.PI / 2;
		scene.add(mesh);
	}

	function makeSphere() {

		var speherRadius = 100,
			sphere_H_segments = 64,
			sphere_V_segments = 64;

		var texture = THREE.ImageUtils.loadTexture('./textures/PANO_20150214_153009.jpg');
		texture.anisotropy = renderer.getMaxAnisotropy();
//		texture.minFilter = THREE.LinearMipMapLinearFilter;
//		texture.minFilter = THREE.LinearMipMapLinearFilter;
//		texture.minFilter = THREE.NearestFilter;

		sphere = new THREE.Mesh(
			new THREE.SphereGeometry(speherRadius, sphere_H_segments, sphere_V_segments),
			new THREE.MeshBasicMaterial({
				map: texture,
				// color: 0xff0000,
				shading: THREE.FlatShading
			})
		);

		sphere.scale.x = -1;
		scene.add(sphere);
	}

	function makeHotspot() {

		var speherRadius = 100,
			sphere_H_segments = 64,
			sphere_V_segments = 64;

		var texture = THREE.ImageUtils.loadTexture('./textures/PANO_20150214_153009.jpg');
		texture.anisotropy = renderer.getMaxAnisotropy();

		sphere = new THREE.Mesh(
			new THREE.SphereGeometry(speherRadius, sphere_H_segments, sphere_V_segments),
			new THREE.MeshBasicMaterial({
				map: texture,
				shading: THREE.FlatShading
			})
		);

		sphere.scale.x = -1;
		scene.add(sphere);
	}


	function makeText(text, pos, rot) {

		pos = pos ? pos : { x:0, y:0, z:0 };
		rot = rot ? rot : { x:0, y:0, z:0 };

		var texture = THREE.ImageUtils.loadTexture(
			'textures/patterns/checker.png'
		);

		var textGeometry = new THREE.TextGeometry(text, {
			size: 2,
			height: 1
		});

		textMesh = new THREE.Mesh(textGeometry, new THREE.MeshPhongMaterial({
			color: 0x3794cf,
			specular: 0xffffff,
			shininess: 40,
			shading: THREE.SmoothShading
		}));

		textMesh.position.x = pos.x;
		textMesh.position.y = pos.y;
		textMesh.position.z = pos.z;
		
		textMesh.rotation.z = rot.x;
		textMesh.rotation.x = rot.y; // -Math.PI/2;
		textMesh.rotation.y = rot.z;

		return(textMesh);
	}

	function makeLight(targetScene) {
		var light = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
		targetScene.add(light);
	}

	//----------------------------------------------------------------------
	function resize_new() {

		var width = domEl.offsetWidth;
		var height = domEl.offsetHeight;

		// 1080 x 1920
//		var win = $(window);

//		debugLog(width+'-'+height);

		if(camera) {
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
		}

		renderer.setSize(width, height);

		if(effect && effect !== renderer) {
			effect.setSize(width, height);
		}
	}

	function update_new(dt) {
		resize_new();
		if(controls) {
			controls.update(dt);
		}
	}

	function render_new(dt) {
		if(effect && camera) {
			effect.render(scene, camera);
		}
	}

	function animate_new(dt) {
		TWEEN.update();
		reqAnimationFrame(animate_new);

		if(controls) {
			controls.update(dt);
		}

//		update_new(clock.getDelta());
		render_new(clock.getDelta());
	}

//	function onFullscreen() {
//		window.setTimeout(function() {
//			setupViewport();
//		}, 0);
//	}

	function setupViewport() {

		console.log(`setupViewport(${window.devicePixelRatio})`);

		var //nativeW = window.devicePixelRatio * window.screen.availWidth,
			scale = 1/window.devicePixelRatio;

		var $viewport = $('head meta[name="viewport"]');
		$viewport.attr('content', 'initial-scale='+scale+'; maximum-scale='+scale+'; user-scalable=0;');
	}

//	//----------------------------------------------------------------------
//	function render_original() {
//		effect.render(scene, camera);
//	}
//
//	function animate_original() {
//		requestAnimationFrame(animate_original);
//		controls.update();
//	}
//
//	function resize_original () {
//		camera.aspect = domEl.offsetWidth / domEl.offsetHeight;
//		camera.updateProjectionMatrix();
//		effect.setSize(domEl.offsetWidth, domEl.offsetHeight);
//		if(renderer !== effect) {
//			renderer.setSize(domEl.offsetWidth, domEl.offsetHeight);
//		}
//
//		render_original();
//	}
//
//	// http://stackoverflow.com/questions/21548247/clean-up-threejs-webgl-contexts
//	function remove_original() {
//		scene.remove(sphere);
//		while (domEl.firstChild) {
//			domEl.removeChild(domEl.firstChild);
//		}
//	}

	function debugLog(text) {
		debugDiv.innerHTML = text;
	}

	function animateObj(mesh) {
		TWEEN.removeAll();

		var rotation = { angle: 0 };

		var updateValue = function() {
			mesh.rotation.y = rotation.angle;
		};

		var tweenHead = new TWEEN.Tween(rotation)
							.to({angle:2*Math.PI}, 2000)
							.onUpdate(updateValue);

		var tweenBack = new TWEEN.Tween(rotation)
							.to({angle:0}, 0)
							.onUpdate(updateValue);

		tweenHead.chain(tweenBack);
		tweenBack.chain(tweenHead);

		tweenHead.start();
	}

	function setupWebVR() {

		// Get config from URL
		var config = (function() {
			var config = {
//				DEBUG: true,
				DPDB_URL: "./js/lib/dpdb.json"
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

		new WebVRPolyfill(config);
	}

	window.addEventListener('resize', onResize);

	window.addEventListener('vrdisplaypresentchange', 	() => {
		console.log('onVRDisplayPresentChange');
		onResize();
		buttons.hidden = vrDisplay.isPresenting;
	  });

	window.addEventListener('vrdisplayconnect', ev => {
		console.log('onVRDisplayConnect', (ev.display || (ev.detail && ev.detail.display)));
	  });

	// Button click handlers.
	document.querySelector('button#fullscreen').addEventListener('click', function() {
	  const el = renderer.domElement;
		if (el.requestFullscreen) {
		  el.requestFullscreen();
		} else if (el.mozRequestFullScreen) {
		  el.mozRequestFullScreen();
		} else if (el.webkitRequestFullscreen) {
		  el.webkitRequestFullscreen();
		} else if (el.msRequestFullscreen) {
		  el.msRequestFullscreen();
		}
	});
	document.querySelector('button#vr').addEventListener('click', function() {
	  vrDisplay.requestPresent([{source: renderer.domElement}]);
	});

	function onResize() {

//		window.setTimeout(() => {
//			setupViewport();
//		}, 2000);

		// The delay ensures the browser has a chance to layout
		// the page and update the clientWidth/clientHeight.
		// This problem particularly crops up under iOS.
		if (!onResize.resizeDelay) {
		  onResize.resizeDelay = setTimeout(function () {
			onResize.resizeDelay = null;
			console.log('Resizing to %s x %s.', element.clientWidth, element.clientHeight);
			effect.setSize(element.clientWidth, element.clientHeight, false);
			camera.aspect = element.clientWidth / element.clientHeight;
			camera.updateProjectionMatrix();
		  }, 250);
		}
	  }

//	return({
//		resize: resize_original,
//		remove: remove_original
//	});
};
