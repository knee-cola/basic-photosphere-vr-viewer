import { StereoEffectDistortionViewer } from './components/StereoEffectDistortionViewer';
// import { WebVRViewer } from './components/WebVRViewer';
// import { StereoCameraViewer } from './components/StereoCameraViewer';

const _buttons = [];
let _viewer;

const enterHomescreen = () => {
    _makeButton("Enter VR", () => {
        _clearButtons();
        _enterVR();
    });
}

const _enterVR = () => {
    _viewer = new StereoEffectDistortionViewer(textureUrlGet(), () => {
        _viewer = null;
        enterHomescreen();
    });
}

const _makeButton = (title, evHandler) => {
    const newButton = document.createElement('BUTTON');
    newButton.innerHTML = title;
    newButton.addEventListener('click', evHandler);
    document.body.appendChild(newButton);

    _buttons.push(newButton);
}

const _clearButtons = () => {
    _buttons.splice(0, _buttons.length).map(oneButtom => document.body.removeChild(oneButtom));
}

const textureUrlGet = () => {
    // PANO_20140421_163314.jpg --- Tuzla statues
    // PANO_20140421_162454.jpg --- Tuzla center
    // PANO_20140421_152929.jpg --- Tuzla wide square
    // PANO_20150214_153009_HD.jpg --- (HD) old house Susak

    return('./textures/PANO_20140421_163314.jpg');
}

enterHomescreen();