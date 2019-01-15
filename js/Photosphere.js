THREE.Photosphere = function (domEl, image, options) {
	options = options || {};

	var camera, controls, scene, renderer, sphere, element, textMesh;
	var clock = new THREE.Clock();
	var debugDiv = document.getElementById('debug');

	setupViewport();
	init();
	update_new(clock.getDelta());
	animate_new();

	// POKUŠATI slijedeći source: http://vr.chromeexperiments.com/, koji je trivijalno jednostavan, pa ga prilagoditi
	// ... stvar prilagodim tako da ne prikazuje sferu

	function init () {

		makeRenderer();
		makeScene();
		attachControls(camera);

		makeSphere();

		makeLight(scene);

		// kreiram grupu u ću rotirati
		var pivot = new THREE.Object3D();
		
		camera.add( pivot );

		// podešavam poziciju grupe u odnosu na ishodište
		pivot.position.x = 0;
		pivot.position.y = -5;
		pivot.position.z = -30;

		// kreiram tekst i smještam ga u koordinatama pivota (unutar njega)
		var textMesh = makeText('Sandica', {x:-10, y:0, z:-10});
		pivot.add( textMesh );

		// rotiram pivot
		animateObj(pivot);

		window.addEventListener('resize', resize_new, false);
		setTimeout(resize_new, 1);
	}

	function makeRenderer() {
		effect = renderer = new THREE.WebGLRenderer();
		renderer.setSize(domEl.offsetWidth, domEl.offsetHeight);
		element = renderer.domElement;
		
		domEl.appendChild(element);

		// smao desktopi imaju devicePixelRatio===1
		if(window.devicePixelRatio !== 1) {
			effect = new THREE.StereoEffect(renderer);
		}
	}


	function makeScene() {
		scene = new THREE.Scene();

		let fieldOfView = options.view || 90,
			aspectRatio = 1, // domEl.offsetWidth / domEl.offsetHeight,
			near = 1,
			far = 1000;

		// http://threejs.org/docs/#Reference/Cameras/PerspectiveCamera
		camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, near, far);
//		camera.position.set(0.1, options.y || 0, 0);
	
		let pos = {
			x: 0,
			y: 10, // kamera je na visini od 10 nečega
			z: 0
		};
		camera.position.set(pos.x, pos.y, pos.z);
		scene.add(camera);
	}

	function attachControls(target) {

		controls = new THREE.OrbitControls(target, element);
		controls.noPan = true;
		controls.noZoom = true;

		controls.rotateUp(-Math.PI/2); // rotiram kameru da gleda u horizont
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

		function setOrientationControls(e) {
		  if (!e.alpha) {
			return;
		  }
  
		  controls = new THREE.DeviceOrientationControls(camera, true);
		  controls.connect();
		  controls.update();
  
		  element.addEventListener('click', fullscreen_new, false);
  
		  window.removeEventListener('deviceorientation', setOrientationControls, true);
		}

		window.addEventListener('deviceorientation', setOrientationControls, true);
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

		var texture = THREE.ImageUtils.loadTexture('/textures/paklenica.jpg');
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

		var texture = THREE.ImageUtils.loadTexture('/textures/paklenica.jpg');
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

		debugLog(width+'-'+height);

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
		requestAnimationFrame(animate_new);

		if(controls) {
			controls.update(dt);
		}

//		update_new(clock.getDelta());
		render_new(clock.getDelta());
	}


	var fsEvAttached = false;

	function fullscreen_new() {

		if (domEl.requestFullscreen) {
			if(!fsEvAttached) { document.addEventListener("fullscreenchange", onFullscreen, false); }
			domEl.requestFullscreen();
		} else if (domEl.msRequestFullscreen) {
			if(!fsEvAttached) { document.addEventListener("msfullscreenchange", onFullscreen, false); }
			domEl.msRequestFullscreen();
		} else if (domEl.mozRequestFullScreen) {
			if(!fsEvAttached) { document.addEventListener("mozfullscreenchange", onFullscreen, false); }
			domEl.mozRequestFullScreen();
		} else if (domEl.webkitRequestFullscreen) {
			if(!fsEvAttached) { document.addEventListener("webkitfullscreenchange", onFullscreen, false); }
			domEl.webkitRequestFullscreen();
		}

		fsEvAttached = true;
	}

	function onFullscreen() {

		window.setTimeout(function() {
			var $viewport = $('head meta[name="viewport"]');
		}, 1000);
	}

	function setupViewport() {
		var nativeW = window.devicePixelRatio * window.screen.availWidth,
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

	return;

//	return({
//		resize: resize_original,
//		remove: remove_original
//	});
};
