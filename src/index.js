import { ThreeViewer } from './components/ThreeViewer';
import { WebVRViewer } from './components/WebVRViewer';
import {WakeLockPolyfill} from './components/WakeLockPolyfill';

const VR_MODE_WEBVR = "VR_MODE_WEBVR";
const VR_MODE_THREE = "VR_MODE_THREE";

let _button_startThreeVR, _button_startWebVR;
let _wakeLock;
let _viewer;
let _vrMode;

const enterHomescreen = () => {
    _button_startThreeVR = _makeButton("START VR", VR_MODE_THREE);
    _button_startWebVR = _makeButton("INIT WebVR", VR_MODE_WEBVR);
}

const _makeButton = (title, vrMode) => {
    const newButton = document.createElement('BUTTON');
    newButton.innerHTML = title;
    document.body.appendChild(newButton);

    newButton.addEventListener('click', () => {
        _vrMode = vrMode;

        switch(_vrMode) {
            case VR_MODE_WEBVR:
                if(!_viewer) {
                    // Switch to the fullscreen, which is the last step of starting process,
                    // requires that it's initiated by user action, which will
                    // not the be the case due to the async nature of the initi process.
                    // Thant's why starting WebVR is a two-step process:
                    // (1) first we do the init (prepWebVr)
                    // (2) then user needs to initialte the start (_viewer.start)
                    prepWebVr();

                    document.body.removeChild(_button_startThreeVR);
                    _button_startThreeVR = null;

                    // the same button will be used to initiate the second step
                    _button_startWebVR.innerHTML = "SHOW WebVR";
                } else {
                    exitHomescreen();
                    _viewer.start();
                }
                break;
            case VR_MODE_THREE:
                exitHomescreen();
                enterVR();
                break;
        }
    });

    return(newButton);
}

const prepWebVr = () => {
    document.addEventListener(getFullscreenEventName(), handleFullscreenChange, false);
    _viewer = new WebVRViewer('../textures/PANO_20140421_163314.jpg', () => {
        exitVR();
        enterHomescreen();
    });
}

const exitHomescreen = () => {
    if(_button_startThreeVR) {
        document.body.removeChild(_button_startThreeVR);
    }
    document.body.removeChild(_button_startWebVR);
    _button_startWebVR = _button_startThreeVR = null;
};

const enterVR = () => {

    // monitor fullscreen change
    document.addEventListener(getFullscreenEventName(), handleFullscreenChange, false);

    // PANO_20140421_163314.jpg --- Tuzla statues
    // PANO_20140421_162454.jpg --- Tuzla center
    // PANO_20140421_152929.jpg --- Tuzla wide square
    // PANO_20150214_153009_HD.jpg --- (HD) old house Susak

    switch(_vrMode) {
        case VR_MODE_WEBVR:
            // WebVR itself does the following:
            // * locks orientation
            // * goest to fullscreen
            // * activates WakeLock
            
            break;
        case VR_MODE_THREE:
            
            enterFullscreen().then(() => {
                _wakeLock = new WakeLockPolyfill()
                _wakeLock.enable();
                lockOrientation();

                window.setTimeout(() => {
                    _viewer = new ThreeViewer('../textures/PANO_20140421_163314.jpg');
                },0);
            });

            break;
    }
};

const exitVR = () => {

    // don't care about fullscreen anymore
    document.removeEventListener(getFullscreenEventName(), handleFullscreenChange, false);

    if(_viewer) {
        if(_vrMode === VR_MODE_THREE) {
            // in WebVR mode orientation will be locked by polyfill
            unlockOrientation();
            // WakeLock will not be created in WebVR mode
            _wakeLock.disable();
        }

        _viewer.dispose();
        _viewer = _wakeLock = null;
    }
}

const enterFullscreen = () => {
    const fsElement = document.documentElement;
    const requestFullscreen = fsElement.requestFullscreen || fsElement.msRequestFullscreen || fsElement.mozRequestFullScreen || fsElement.webkitRequestFullscreen;

    return(requestFullscreen.call(fsElement));
};

const handleFullscreenChange = () => {
    // only react if the fullscreen has been deactivated
    if (!document.fullscreen) {
        exitVR();
        enterHomescreen();
    }
};

const getFullscreenEventName = () => {
    const fsElement = document.documentElement;

    if (fsElement.requestFullscreen) {
        return("fullscreenchange");
    } else if (fsElement.msRequestFullscreen) {
        return("msfullscreenchange");
    } else if (fsElement.mozRequestFullScreen) {
        return("mozfullscreenchange");
    } else if (fsElement.webkitRequestFullscreen) {
        return("webkitfullscreenchange");
    }
}

const lockOrientation = () => {
    if(screen.orientation && screen.orientation.lock) {
        screen.orientation.lock("landscape-primary");
    }
}

const unlockOrientation = () => {
    if(screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock;
    }
}

enterHomescreen();