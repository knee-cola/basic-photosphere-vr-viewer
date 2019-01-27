# What's this?
This is a simple photosphere VR viewer for smartphones.

It's an experiment which involves:
* rendering of a photosphere
* headtracking
* stereoscopic rendering
* using native pixel density (preventing browser from doing downscaling)
* preventing smartphone from going to sleep (WakeLock API)
* locking screen orientation
* using fullscreen mode
* using game controller (Gamepad API)

# Demo
Demo is available at: [https://knee-cola.github.io/basic-photosphere-vr-viewer/](https://knee-cola.github.io/basic-photosphere-vr-viewer/)

This viewer is intended to be used with a Google Cardboard compatible viewer.

Make sure to open it in your smartphone (Chrome or Firefox should we fine).

**Note:** the viewer works fine on Samsung Galaxy S5 or similar sized displays.
It might not work so great on larger screens due to the greater distance between center points of each image (due to larger screen). This will hopefully be fixed some day (see *Future roadmap* chapter) 

# Future roadmap
Currently I have managed to (in `StereoEffectDistortionViewer.js`):
* put the camera outside the sphere
* partially implemented head tracking by rotating the sphere
* added deformation to the sphere (linked sphere rotation)

There are problems I haven't been able to solve:
* sphere rotates in the wrong direction around the Y axis
    * inversion methods I have tried result in incorrect rotation when looking up
* I have yet to determine correct params for deformation: deformation scale, camera distance, FOV



## Basic functionality
* fix exit VR on smartphones (FOV)
    * use BT controller to fine-tune display parameters (eyeSep, FOV etc...)
* fix headset lense distortion

## Implementing settings
* display VR settings menu
    * use BT controller for navigation
* test screen for setting up distortion (square grid)
* test screen for setting up eye separation (cross on white background)
* persisting settings in browser (local storage?)