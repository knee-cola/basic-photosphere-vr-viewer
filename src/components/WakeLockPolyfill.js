import * as NoSleep from 'nosleep.js';

/**
 * Stops smartphone from going to sleep
 */
export class WakeLockPolyfill {
    enable() {
        // https://developers.google.com/web/updates/2018/12/wakelock
        // NOTE: Wake Lock API is only available when served over HTTPS
        if ('getWakeLock' in navigator) {
            navigator.getWakeLock('screen').then((wakeLockObj) => {
                this.wakeLockRequest = wakeLockObj.createRequest();
            }).catch((err) => {
              return console.error('Could not obtain wake lock', err);
            });
        } else {
            this.noSleep = new NoSleep();
            this.noSleep.enable();
        }
    }

    disable() {
        if(this.wakeLockRequest) {
            this.wakeLockRequest.cancel();
            this.wakeLockRequest = null;
        } else {
            this.noSleep.disable();
            this.noSleep = null;
        }
    }
}