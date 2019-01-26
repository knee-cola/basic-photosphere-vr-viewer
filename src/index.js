import { StereoEffectViewer } from './components/StereoEffectViewer';
import { WebVRViewer } from './components/WebVRViewer';
import { StereoCameraViewer } from './components/StereoCameraViewer';

const _buttons = [];
let _viewer;

const enterHomescreen = () => {

    _makeButton("USE StereoCamera", () => {
        _clearButtons();

        _makeButton('START VR', () => {
            _clearButtons();

            _viewer = new StereoCameraViewer(textureUrlGet(), () => {
                _viewer = null;
                enterHomescreen();
            });
        });
    });
    _makeButton("USE StereoEffect", () => {
        _clearButtons();
        _makeButton('START VR', () => {
            _clearButtons();

            _viewer = new StereoEffectViewer(textureUrlGet(), () => {
                _viewer = null;
                enterHomescreen();
            });
        });
    });
    _makeButton("USE WebVR", () => {
        _clearButtons();

        // Switch to the fullscreen, which is the last step of starting process,
        // requires that it's initiated by user action, which will
        // not the be the case due to the async nature of the initi process.
        // Thant's why starting WebVR is a two-step process:
        // (1) first we do the init (prepWebVr)
        // (2) then user needs to initialte the start (_viewer.start)
        _viewer = new WebVRViewer(textureUrlGet(), () => {
            _viewer = null;
            enterHomescreen();
        });

        _makeButton('START VR', () => {
            _clearButtons();
            _viewer.start();
        });
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