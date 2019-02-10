
import { Vector3, Euler, Quaternion, Math } from "three";

export class PitchYawRollHelper {

    constructor() {
        // Phone's orientation is represented by two vectors:
        // "front" is pointing in the same direction as phone's
        // main camera and is used to determine pitch and yaw
        // rotation
        this.phoneFront = new Vector3(1, 0, 0);
        // "top" is pointing in the same direction
        // as top of the VR viewer and is used to
        // determine the "roll" rotation
        this.phoneTop = new Vector3(0, 1, 0);

        // "world" are vectors which represent
        // the origin 
        this.worldFront = new Vector3(1, 0, 0);
        this.worldTop = new Vector3(0, 1, 0);

        this.euler = new Euler();

		this.pitchYawQuaternion = new Quaternion();
        this.rollQuaternion = new Quaternion();
        this.quaternion = new Quaternion();
    }

    reset() {
        // before applying any rotation
        // reset the vertices to their
        // initial position
        this.phoneFront.set(0,1,0);
        this.phoneTop.set(1,0,0);
    }

    /**
     * Calculates quaternion which does *pitch* and *yaw* rotation of the object
     */
    calcPitchYawQuaternion() {

        // phone's top vector follows the phone rotation
        // > after this it will point in the same direction
        //   as mobile phone's front side (phone's main phone)
        this.phoneFront.applyEuler(this.euler);

        // Calculate the quaternion as rotation
        // which reverses the pitch and yaw rotation
        // of the vector
        this.pitchYawQuaternion.setFromUnitVectors(this.phoneFront, this.worldFront);
    }

    /**
     * Calculates quaternion which does *roll* rotation of the object
     */
    calcRollQuaternion() {
        // phone's top vector follows the phone rotation
        // > after this it will point in the same direction
        //   as phone's top
        this.phoneTop.applyEuler(this.euler);

        // use `pitchYawQuaternion` to reverse *pitch* and *yaw*
        // rotation of the top vector done by Euler,
        // so the only rotation which will be left if *roll*
        this.phoneTop.applyQuaternion(this.pitchYawQuaternion);

        // calculate *roll* quaternion as a rotation needed
        // to bring the topVertice back to the original position
        this.rollQuaternion.setFromUnitVectors(this.phoneTop, this.worldTop);
    }

    calculate({alpha, beta, gamma}) {

        // convert phone orientation angles to Euler
        this.euler.set( Math.degToRad(beta), - Math.degToRad(alpha), - Math.degToRad(gamma), 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us

        this.reset();
        this.calcPitchYawQuaternion();
        this.calcRollQuaternion();

        // final result is the combination of the two quaternions
        this.quaternion.multiplyQuaternions(this.rollQuaternion, this.pitchYawQuaternion);

        return(this.quaternion);
    }
}