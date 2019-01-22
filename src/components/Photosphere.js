import { Mesh, ImageUtils, SphereGeometry, MeshBasicMaterial, BackSide} from 'three';

const _sphere_radius = 100,
      _sphere_H_segments = 64,
      _sphere_V_segments = 64;

export class Photosphere {

    constructor(scene, renderer, textureFileUrl) {
        this.scene = scene;
        this.renderer = renderer;
		this.textureFileUrl = textureFileUrl;
		
		this.makeSphere();
    }

	makeSphere() {

		// instantiate a loader
		const loader = new THREE.TextureLoader();

		// load a resource
		loader.load(this.textureFileUrl,
			// onLoad callback
			loadedTexture => {
				loadedTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

				this.sphereMesh = new Mesh(
					new SphereGeometry(_sphere_radius, _sphere_H_segments, _sphere_V_segments),
					new MeshBasicMaterial({
						map: loadedTexture,
						// color: 0xff0000,
						flatShading: true,
						// draw texture on inner side of the sphere
						side: BackSide
					})
				);
			this.scene.add(this.sphereMesh);
		});
	}
}