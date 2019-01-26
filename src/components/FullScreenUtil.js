import { WakeLockPolyfill } from './WakeLockPolyfill';

export class FullScreenUtil {

    constructor() {
        this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
    }

    /**
     * Registers event handler for fullscreen exit event
     * @param {Function} onFsExit event handler
     */
    onExitFullscreen(onFsExit) {
        this.onFsExit = onFsExit;
    }

    enterFullscreen() {
        const fsElement = document.documentElement;
        let requestFullscreen, eventName;

        if (fsElement.requestFullscreen) {
            eventName = "fullscreenchange";
            requestFullscreen = fsElement.requestFullscreen;
        } else if (fsElement.msRequestFullscreen) {
            eventName = "msfullscreenchange";
            requestFullscreen = fsElement.msRequestFullscreen;
        } else if (fsElement.mozRequestFullScreen) {
            eventName = "mozfullscreenchange";
            requestFullscreen = fsElement.mozRequestFullScreen;
        } else if (fsElement.webkitRequestFullscreen) {
            eventName = "webkitfullscreenchange";
            requestFullscreen = fsElement.webkitRequestFullscreen;
        }
    
        document.addEventListener(eventName, this.handleFullscreenChange, false);

        return(requestFullscreen.call(fsElement).then(() => {
            this.lockOrientation();
            this.wakeLock = new WakeLockPolyfill();
            this.wakeLock.enable();
        }));
    }

    lockOrientation() {
        if(screen.orientation && screen.orientation.lock) {
            screen.orientation.lock("landscape-primary");
        }
    }
    
    unlockOrientation() {
        if(screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock;
        }
    }

    handleFullscreenChange() {
        // only react if the fullscreen has been deactivated
        if (!document.fullscreen) {

            this.wakeLock.disable();
            this.wakeLock = null;
            this.unlockOrientation();

            if(this.onFsExit) {
                this.onFsExit();
            }
        }
    }
}