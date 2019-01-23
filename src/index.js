import { PhotosphereViewer } from './components/PhotosphereViewer';
import * as NoSleep from 'nosleep.js';

const button = document.createElement('BUTTON');
button.innerHTML = "START VR";
document.body.appendChild(button);

button.style.fontSize = '3em';
button.style.padding = '1em';
button.style.display = 'block';
button.style.margin = '3em auto 3em auto';


const noSleep = new NoSleep();

button.addEventListener('click', () => {

    const fsElement = document.documentElement;
    let eventName;

    if (fsElement.requestFullscreen) {
        eventName = "fullscreenchange";
        fsElement.requestFullscreen();
    } else if (fsElement.msRequestFullscreen) {
        eventName = "msfullscreenchange";
        fsElement.msRequestFullscreen();
    } else if (fsElement.mozRequestFullScreen) {
        eventName = "mozfullscreenchange";
        fsElement.mozRequestFullScreen();
    } else if (fsElement.webkitRequestFullscreen) {
        eventName = "webkitfullscreenchange";
        fsElement.webkitRequestFullscreen();
    }

    document.addEventListener(eventName, () => {
        noSleep.enable();

        // screen orientation can be locked only in fullscreen mode
        if(screen.orientation && screen.orientation.lock) {
            screen.orientation.lock("landscape-primary");
        } else if(screen.mozLockOrientation && screen.mozLockOrientation.lock) {
            screen.mozLockOrientation.lock("landscape-primary");
        }
    
        window.setTimeout(() => {
            new PhotosphereViewer('./textures/R0010823_20161001114020.JPG');
        }, 0);
    });

    document.body.removeChild(button);
});