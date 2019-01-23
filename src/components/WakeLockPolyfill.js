import * as NoSleep from 'nosleep.js';

/**
 * Stops smartphone from going to sleep
 */
export class WakeLockPolyfill {
    enable() {
        // https://developers.google.com/web/updates/2018/12/wakelock
        if ('getWakeLock' in navigator) {
            navigator.getWakeLock('screen').then((wakeLockObj) => {
                this.wakeLockObj = wakeLockObj;
                this.wakeLockRequest = wakeLockObj.createRequest();
                alert('using wakeLock !!!');
            }).catch((err) => {
              return console.error('Could not obtain wake lock', err);
            });
        } else {
            this.noSleep = new NoSleep();
            this.noSleep.enable();
        }
    }

    disable() {
        if(this.wakeLockObj) {
            this.wakeLockObj.cancel();
            this.wakeLockObj = null;
        } else {
            this.noSleep.disable();
            this.noSleep = null;
        }
    }
}