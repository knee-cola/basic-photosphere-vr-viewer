import {  Scene, PerspectiveCamera, WebGLRenderer } from 'three';

var scene = new Scene();
var camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

/*
	<script src="./js/lib/three/CanvasRenderer.js"></script>
	<script src="./js/lib/three/StereoEffect.js"></script>
	<script src="./js/lib/three/DeviceOrientationControls.js"></script>
	<script src="./js/lib/three/Projector.js"></script>
	<script src="./js/lib/three/OrbitControls.js"></script>	
	<script src="./js/lib/three/helvetiker_regular.typeface.js"></script>
	<script src="./js/lib/three/Tween.js"></script>
	<script src="./js/lib/jquery.js"></script>
	<script src="./js/Photosphere.js"></script>

*/
