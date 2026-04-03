# Interactive ML Portrait Builder

This project is an interactive creative coding tool built with p5.js and ml5.js. It uses your webcam and real-time machine learning models to generate layered visual portraits that respond to your face, body, and hands.

Instead of a single fixed output, this tool lets you experiment by turning different visual systems on and off, combining them in different ways to create unique compositions.


## What this project does

The sketch captures live video from your webcam and applies multiple computer vision models:

- Face Mesh → detects facial landmarks and draws points
- Body Pose → detects body joints and draws a skeleton
- Hand Pose → tracks hand keypoints
- Body Segmentation → separates your body from the background
- Face Texture → maps an image onto your face using a mesh

Each of these can be toggled on or off using the interface.


## How to use the tool

1. Open the sketch in a browser (or the p5.js editor).
2. Allow webcam access when prompted.
3. Use the toggle switches on the left to activate different features.
4. Move your face, hands, or body and observe how the visuals respond in real time.
5. Combine multiple features to create layered effects.

---

## Exporting your own project

The tool allows you to export a custom version of the sketch based on the features you selected.

### Steps:
1. Turn on the features you want using the switches.
2. Click **"Export ZIP Project"**.
3. A ZIP file will download to your computer.

---

## What’s inside the exported ZIP

Depending on your selections, the ZIP will include:

- `index.html` → the main webpage
- `sketch.js` → your custom generated code
- `triangles.js` → required for face texture mapping (only included if needed)
- `clouds.png` → the texture image (only included if needed)

---

## Running the exported project

To use your exported project:

### Option 1 (recommended)
- Upload the files into a new project on the p5.js editor

### Option 2
- Unzip the folder
- Open `index.html` in a browser

Make sure all files stay in the same folder.

---

## Important notes

- Face Texture requires Face Mesh internally, so it will always include face tracking even if the dots are not drawn.
- Webcam access must be enabled for the sketch to work.
- Performance may vary depending on your device.

---

## Project structure

-project/
-index.html
-sketch.js
-triangles.js (optional)
-clouds.png (optional)


---

## Concept

This project is designed as a creative system rather than a single artwork.

Each model acts like a visual layer:
- Face → identity
- Body → structure
- Hands → interaction
- Segmentation → abstraction
- Texture → transformation

By combining them, you are building your own generative portrait system.

---

## Built with

- p5.js
- ml5.js (handPose, bodyPose, faceMesh, BodyPix)

---

## Credits

- Pierre Mikhiel & Jack B.Du
- Face mesh triangulation data adapted from MediaPipe (Google)
- ml5.js community examples


---

## Ideas to explore

- Try using different images instead of `clouds.png`
- Use only one model at a time for minimal compositions
- Combine segmentation + texture for abstract silhouettes
- Record your screen to capture dynamic outputs

---

Enjoy experimenting!!

