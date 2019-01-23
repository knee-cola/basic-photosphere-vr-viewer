import { PhotosphereViewer } from './components/PhotosphereViewer';
import {WakeLockPolyfill} from './components/WakeLockPolyfill';

let _button;
let _wakeLock;
let _viewer;

const enterHomescreen = () => {
    _button = document.createElement('BUTTON');
    _button.innerHTML = "START VR";
    document.body.appendChild(_button);
    
    _button.style.fontSize = '2em';
    _button.style.padding = '1em';
    _button.style.display = 'block';
    _button.style.margin = '2em auto 2em auto';
    
    _button.addEventListener('click', () => {
        exitHomescreen();
        enterVR();
    });
}

const exitHomescreen = () => {
    document.body.removeChild(_button);
    _button = null;
};

const enterVR = () => {

    enterFullscreen().then(() => {
        _wakeLock = new WakeLockPolyfill()
        _wakeLock.enable();

        // screen orientation can be locked only in fullscreen mode
        lockOrientation();

        window.history.pushState({}, null, window.location.pathname+"vr/");

        window.onpopstate = (event) => {
            exitVR();
            enterHomescreen();
        };
    
        window.setTimeout(() => {
            _viewer = new PhotosphereViewer('../textures/R0010823_20161001114020.JPG');
        }, 0);
    });
};

const exitVR = () => {
    if(_viewer) {
        exitFullscreen();
        unlockOrientation();

        _viewer.dispose();
        _wakeLock.disable();

        _viewer = _wakeLock = window.onpopstate = null;
    }
}

const enterFullscreen = () => {
    const fsElement = document.documentElement;
    const requestFullscreen = fsElement.requestFullscreen || fsElement.msRequestFullscreen || fsElement.mozRequestFullScreen || fsElement.webkitRequestFullscreen;

    return(requestFullscreen.call(fsElement).then(() => {
        // after the fullscreen is activated
        // register listener which will detect
        // when fullscreen exit event -> it will
        document.addEventListener(getFullscreenEventName(), handleFullscreenExit, false);
    }));
};

const exitFullscreen = () => {
    // make sure that the event handler IS not registered
    // > we don't want it to be called when VR is exited manually
    document.removeEventListener(getFullscreenEventName(), handleFullscreenExit, false);

    // check if fullscreen is active
    // before trying to exit it
    if (document.fullscreen) { document.exitFullscreen() };
}

const handleFullscreenExit = () => {
    // only react if the fullscreen has been deactivated
    if (!document.fullscreen) {
        exitVR();
        // return to previous URL (the root one)
        window.history.back();
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