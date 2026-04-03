# Interactive ML Portrait Builder

An interactive creative coding system built with **p5.js** and **ml5.js** that transforms your webcam into a real-time generative portrait engine.

This project is not a single artwork, but a modular system where multiple machine learning models act as visual layers you can combine, toggle, and export.

P%JS link: https://editor.p5js.org/zuett/full/JprT6Q4Ms

---

## Live Features

* Face Mesh → facial landmark visualization
* Body Pose → skeletal tracking
* Hand Pose → hand keypoint tracking
* Body Segmentation → background separation
* Face Texture Mapping → dynamic image projection onto face

Each feature can be turned on/off to create unique visual compositions.

---

## How It Works

The system uses real-time webcam input and runs multiple ML models in parallel.

From your code:



Key architecture:

* `preload()` → loads ML models and assets
* `setup()` → initializes webcam + UI + detection
* `draw()` → renders layered outputs dynamically
* Toggle system → controls visual layers
* Export system → generates custom projects

---

## Getting Started

### Option 1: Run locally

1. Clone the repo:

```bash
git clone https://github.com/zuett/interactive-ml-portrait-builder.git
```

2. Open `index.html` in browser
3. Allow webcam access

---

### Option 2: Use p5.js editor

1. Go to https://editor.p5js.org
2. Create new sketch
3. Upload all files
4. Run

---

## Controls

| Feature      | Description            |
| ------------ | ---------------------- |
| Face Mesh    | Shows facial landmarks |
| Body Pose    | Displays body skeleton |
| Hand Pose    | Tracks hand points     |
| Segmentation | Isolates body          |
| Face Texture | Maps image to face     |

---

## Export System

This is one of the most unique parts of your project.

You dynamically generate a **custom project** based on selected features.

### Workflow:

1. Enable features
2. Click **Export ZIP Project**
3. Download customized version

### Internally:

* `generateExportSketchJS()` builds new code
* `resolveFeatureDependencies()` ensures correct model usage
* Assets included only when required

This makes your tool both:

* a creative system
* a code generator

---

## Project Structure

```
project/
│── index.html
│── sketch.js
│── triangles.js (optional)
│── clouds.png (optional)
```

---

## Key Technical Highlights

### Real-time ML pipeline

Multiple models run simultaneously:

* `ml5.faceMesh()`
* `ml5.bodyPose()`
* `ml5.handPose()`
* `ml5.bodySegmentation()`

### Layered rendering system

The `draw()` loop stacks outputs:

* video → segmentation → pose → face → texture

### Procedural export system

Generates minimal code based on selected features.

---

## Concept

Each ML model acts as a layer:

* Face → identity
* Body → structure
* Hands → interaction
* Segmentation → abstraction
* Texture → transformation

You are not using the system — you are composing with it.

---

## Built With

* p5.js
* ml5.js
* MediaPipe (via ml5)

---

## Credits

* Pierre Mikhiel
* Jack B. Du
* ml5.js community
* MediaPipe triangulation data

---

## Ideas to Explore

* Replace `clouds.png` with your own textures
* Build minimal compositions with one model
* Combine segmentation + texture for abstract visuals
* Record generative outputs

---
## Developer Tip

You can use AI-assisted tools (e.g., ChatGPT) to:
- understand specific functions
- debug issues
- explore modifications to the system

This can be especially helpful when working with real-time ML pipelines or WebGL rendering.
---

## Future Improvements

* Performance optimization
* UI refinement
* Model selection presets
* Recording/exporting animations

---

Enjoy experimenting.
