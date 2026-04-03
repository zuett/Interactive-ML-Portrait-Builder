/************************************************************
 INTERACTIVE ML5 + P5.JS PORTRAIT TOOL
 -----------------------------------------------------------
 
 Read the README.txt File for instructions and additional information
************************************************************/

/* =========================
   GLOBAL VARIABLES
   ========================= */

// ---- Machine learning models ----
let handPoseModel;
let bodyPoseModel;
let faceMeshModel;
let bodySegmentationModel;

// ---- Webcam ----
let video;

// ---- Detection results ----
let hands = [];
let poses = [];
let faces = [];
let segmentation = null;

// ---- Body pose skeleton connections ----
let bodyConnections;

// ---- Face mesh settings ----
let faceMeshOptions = {
  maxFaces: 1,
  refineLandmarks: false,
  flipHorizontal: false,
};

// ---- Body segmentation settings ----
let bodySegmentationOptions = {
  maskType: "parts",
};

// ---- Image used as face texture ----
let faceTextureImage;

// ---- Toggle switches for each drawing mode ----
let showFaceMesh = false;
let showBodyPose = false;
let showHandPose = false;
let showSegmentation = false;
let showFaceTexture = false;

// ---- Track which features are selected for export ----
let selectedFeatures = {
  faceMesh: false,
  bodyPose: false,
  handPose: false,
  segmentation: false,
  faceTexture: false,
};

/* =========================
   PRELOAD
   ========================= */
function preload() {
  handPoseModel = ml5.handPose();
  bodyPoseModel = ml5.bodyPose();
  faceMeshModel = ml5.faceMesh(faceMeshOptions);
  bodySegmentationModel = ml5.bodySegmentation(
    "BodyPix",
    bodySegmentationOptions
  );

  faceTextureImage = loadImage("clouds.png");
}

/* =========================
   SETUP
   ========================= */
function setup() {
  createCanvas(640, 480, WEBGL);

  // Start webcam
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // UI panel background
  createUIPanel();

  // Toggle switches
  createFeatureSwitch("Face Mesh", 20, 20, "faceMesh", (val) => {
    showFaceMesh = val;
  });

  createFeatureSwitch("Body Pose", 20, 55, "bodyPose", (val) => {
    showBodyPose = val;
  });

  createFeatureSwitch("Hand Pose", 20, 90, "handPose", (val) => {
    showHandPose = val;
  });

  createFeatureSwitch("Segmentation", 20, 125, "segmentation", (val) => {
    showSegmentation = val;
  });

  createFeatureSwitch("Face Texture", 20, 160, "faceTexture", (val) => {
    showFaceTexture = val;
  });

  // Export button
  createExportButton("Export ZIP Project", 20, 190);

  // Start all detections
  handPoseModel.detectStart(video, gotHands);
  bodyPoseModel.detectStart(video, gotPoses);
  faceMeshModel.detectStart(video, gotFaces);
  bodySegmentationModel.detectStart(video, gotSegmentation);

  bodyConnections = bodyPoseModel.getSkeleton();
}

/* =========================
   DRAW LOOP
   ========================= */
function draw() {
  translate(-width / 2, -height / 2);

  image(video, 0, 0, width, height);

  if (showSegmentation && segmentation) {
    image(segmentation.mask, 0, 0, width, height);
  }

  if (showHandPose) {
    drawHands();
  }

  if (showBodyPose) {
    drawBodyPose();
  }

  if (showFaceMesh) {
    drawFaceMesh();
  }

  if (showFaceTexture) {
    drawFaceTextureMapped();
  }
}

/* =========================
   DRAWING FUNCTIONS
   ========================= */

function drawHands() {
  fill(255, 0, 0);
  noStroke();

  for (let hand of hands) {
    for (let point of hand.keypoints) {
      circle(point.x, point.y, 10);
    }
  }
}

function drawBodyPose() {
  fill(255, 120, 120);
  noStroke();

  for (let pose of poses) {
    for (let point of pose.keypoints) {
      if (point.confidence > 0.1) {
        circle(point.x, point.y, 10);
      }
    }
  }

  stroke(255, 120, 120);
  strokeWeight(2);

  for (let pose of poses) {
    for (let connection of bodyConnections) {
      let pointAIndex = connection[0];
      let pointBIndex = connection[1];

      let pointA = pose.keypoints[pointAIndex];
      let pointB = pose.keypoints[pointBIndex];

      if (pointA.confidence > 0.1 && pointB.confidence > 0.1) {
        line(pointA.x, pointA.y, pointB.x, pointB.y);
      }
    }
  }
}

function drawFaceMesh() {
  fill(255, 0, 0);
  noStroke();

  for (let face of faces) {
    for (let point of face.keypoints) {
      circle(point.x, point.y, 5);
    }
  }
}

function drawFaceTextureMapped() {
  for (let face of faces) {
    noStroke();
    noLights();

    textureMode(IMAGE);
    texture(faceTextureImage);

    beginShape(TRIANGLES);

    for (let i = 0; i < TRIANGULATION.length - 2; i += 3) {
      let indexA = TRIANGULATION[i];
      let indexB = TRIANGULATION[i + 1];
      let indexC = TRIANGULATION[i + 2];

      let facePointA = pointToVector(face.keypoints[indexA]);
      let facePointB = pointToVector(face.keypoints[indexB]);
      let facePointC = pointToVector(face.keypoints[indexC]);

      let faceCenter = createVector(
        face.faceOval.centerX,
        face.faceOval.centerY
      );

      let imageCenter = createVector(
        faceTextureImage.width / 2,
        faceTextureImage.height / 2
      );

      let relativeA = p5.Vector.sub(facePointA, faceCenter);
      let relativeB = p5.Vector.sub(facePointB, faceCenter);
      let relativeC = p5.Vector.sub(facePointC, faceCenter);

      let faceWidth = face.faceOval.width;
      let faceHeight = face.faceOval.height;

      relativeA.div(faceWidth, faceHeight);
      relativeB.div(faceWidth, faceHeight);
      relativeC.div(faceWidth, faceHeight);

      relativeA.mult(faceTextureImage.width, faceTextureImage.height);
      relativeB.mult(faceTextureImage.width, faceTextureImage.height);
      relativeC.mult(faceTextureImage.width, faceTextureImage.height);

      let texturePointA = p5.Vector.add(imageCenter, relativeA);
      let texturePointB = p5.Vector.add(imageCenter, relativeB);
      let texturePointC = p5.Vector.add(imageCenter, relativeC);

      vertex(facePointA.x, facePointA.y, texturePointA.x, texturePointA.y);
      vertex(facePointB.x, facePointB.y, texturePointB.x, texturePointB.y);
      vertex(facePointC.x, facePointC.y, texturePointC.x, texturePointC.y);
    }

    endShape();
  }
}

/* =========================
   UI FUNCTIONS
   ========================= */

function createUIPanel() {
  let panel = createDiv();
  panel.position(10, 10);
  panel.size(220, 260);
  panel.style("background", "rgba(0, 0, 0, 0.45)");
  panel.style("backdrop-filter", "blur(12px)");
  panel.style("border-radius", "18px");
  panel.style("padding", "12px");
  panel.style("box-sizing", "border-box");
  panel.style("border", "1px solid rgba(255,255,255,0.12)");
  panel.style("pointer-events", "none");

  let title = createDiv("Portrait Builder");
  title.position(25, 12);
  title.style("color", "white");
  title.style("font-family", "monospace");
  title.style("font-size", "18px");
  title.style("font-weight", "bold");
}

function createFeatureSwitch(labelText, x, y, featureKey, variableSetter) {
  let container = createDiv();
  container.position(x, y + 25);
  container.style("display", "flex");
  container.style("align-items", "center");
  container.style("justify-content", "space-between");
  container.style("gap", "12px");
  container.style("width", "180px");
  container.style("font-family", "monospace");
  container.style("color", "#ffffff");
  container.style("z-index", "10");

  let label = createSpan(labelText);
  label.parent(container);

  let switchLabel = createElement("label");
  switchLabel.class("switch");
  switchLabel.parent(container);

  let checkbox = createElement("input");
  checkbox.attribute("type", "checkbox");
  checkbox.parent(switchLabel);

  let slider = createElement("span");
  slider.class("slider");
  slider.parent(switchLabel);

  checkbox.changed(() => {
    let isOn = checkbox.elt.checked;

    selectedFeatures[featureKey] = isOn;
    variableSetter(isOn);
  });
}

function createExportButton(labelText, x, y) {
  let btn = createButton(labelText);
  btn.position(x, y + 35);
  btn.style("font-family", "monospace");
  btn.style("font-size", "14px");
  btn.style("padding", "10px 14px");
  btn.style("border-radius", "12px");
  btn.style("border", "none");
  btn.style("background", "#ffffff");
  btn.style("color", "#111");
  btn.style("cursor", "pointer");
  btn.style("z-index", "10");

  btn.mousePressed(exportSelectedProjectZip);
}

/* =========================
   HELPER FUNCTIONS
   ========================= */

function pointToVector(point) {
  return createVector(point.x, point.y);
}

function gotHands(results) {
  hands = results;
}

function gotPoses(results) {
  poses = results;
}

function gotFaces(results) {
  faces = results;
}

function gotSegmentation(result) {
  segmentation = result;
}

/* =========================
   EXPORT SYSTEM
   ========================= */

async function exportSelectedProjectZip() {
  try {
    let exportConfig = resolveFeatureDependencies(selectedFeatures);

    let zip = new JSZip();

    // Build exported files
    const exportedIndex = generateExportIndexHTML(exportConfig);
    const exportedSketch = generateExportSketchJS(exportConfig);

    zip.file("index.html", exportedIndex);
    zip.file("sketch.js", exportedSketch);

    // Face texture needs triangles.js
    if (exportConfig.needsTrianglesFile) {
      const trianglesText = await fetch("triangles.js").then((res) => res.text());
      zip.file("triangles.js", trianglesText);
    }

    // Face texture needs the image file
    if (exportConfig.needsCloudsImage) {
      const imageBlob = await fetch("clouds.png").then((res) => res.blob());
      zip.file("clouds.png", imageBlob);
    }

    const content = await zip.generateAsync({ type: "blob" });

    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(content);
    downloadLink.download = "custom-ml-portrait-project.zip";
    downloadLink.click();

    URL.revokeObjectURL(downloadLink.href);
  } catch (error) {
    console.error("Export failed:", error);
    alert("Something went wrong while exporting the ZIP.");
  }
}

function resolveFeatureDependencies(features) {
  let config = {
    includeFaceMeshDraw: features.faceMesh,
    includeBodyPose: features.bodyPose,
    includeHandPose: features.handPose,
    includeSegmentation: features.segmentation,
    includeFaceTexture: features.faceTexture,

    // Needed internally
    includeFaceModel: features.faceMesh || features.faceTexture,
    needsTrianglesFile: features.faceTexture,
    needsCloudsImage: features.faceTexture,
  };

  return config;
}

function generateExportIndexHTML(config) {
  let extraScriptTag = config.needsTrianglesFile
    ? `\n    <script src="triangles.js"></script>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Custom ML Portrait Project</title>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js"></script>
    <script src="https://unpkg.com/ml5@1/dist/ml5.min.js"></script>

    <style>
      body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        background: #111;
      }
    </style>
  </head>

  <body>${extraScriptTag}
    <script src="sketch.js"></script>
  </body>
</html>`;
}

function generateExportSketchJS(config) {
  let globals = `
/************************************************************
 CUSTOM EXPORTED ML5 + P5.JS PROJECT
 This project was generated from the Portrait Builder.
 It includes only the features selected during export.
************************************************************/

let video;
`;

  let preloadLines = [];
  let setupLines = [];
  let drawLines = [];
  let functionBlocks = [];

  // Shared webcam setup
  setupLines.push(`
createCanvas(640, 480, WEBGL);

video = createCapture(VIDEO);
video.size(640, 480);
video.hide();
`);

  drawLines.push(`
translate(-width / 2, -height / 2);
image(video, 0, 0, width, height);
`);

  // Face model (needed for face mesh OR face texture)
  if (config.includeFaceModel) {
    globals += `
let faceMeshModel;
let faces = [];

let faceMeshOptions = {
  maxFaces: 1,
  refineLandmarks: false,
  flipHorizontal: false,
};
`;

    preloadLines.push(`
faceMeshModel = ml5.faceMesh(faceMeshOptions);
`);

    setupLines.push(`
faceMeshModel.detectStart(video, gotFaces);
`);

    functionBlocks.push(`
function gotFaces(results) {
  faces = results;
}
`);
  }

  // Face mesh drawing
  if (config.includeFaceMeshDraw) {
    drawLines.push(`
drawFaceMesh();
`);

    functionBlocks.push(`
function drawFaceMesh() {
  fill(255, 0, 0);
  noStroke();

  for (let face of faces) {
    for (let point of face.keypoints) {
      circle(point.x, point.y, 5);
    }
  }
}
`);
  }

  // Body pose
  if (config.includeBodyPose) {
    globals += `
let bodyPoseModel;
let poses = [];
let bodyConnections;
`;

    preloadLines.push(`
bodyPoseModel = ml5.bodyPose();
`);

    setupLines.push(`
bodyPoseModel.detectStart(video, gotPoses);
bodyConnections = bodyPoseModel.getSkeleton();
`);

    drawLines.push(`
drawBodyPose();
`);

    functionBlocks.push(`
function gotPoses(results) {
  poses = results;
}

function drawBodyPose() {
  fill(255, 120, 120);
  noStroke();

  for (let pose of poses) {
    for (let point of pose.keypoints) {
      if (point.confidence > 0.1) {
        circle(point.x, point.y, 10);
      }
    }
  }

  stroke(255, 120, 120);
  strokeWeight(2);

  for (let pose of poses) {
    for (let connection of bodyConnections) {
      let pointAIndex = connection[0];
      let pointBIndex = connection[1];

      let pointA = pose.keypoints[pointAIndex];
      let pointB = pose.keypoints[pointBIndex];

      if (pointA.confidence > 0.1 && pointB.confidence > 0.1) {
        line(pointA.x, pointA.y, pointB.x, pointB.y);
      }
    }
  }
}
`);
  }

  // Hand pose
  if (config.includeHandPose) {
    globals += `
let handPoseModel;
let hands = [];
`;

    preloadLines.push(`
handPoseModel = ml5.handPose();
`);

    setupLines.push(`
handPoseModel.detectStart(video, gotHands);
`);

    drawLines.push(`
drawHands();
`);

    functionBlocks.push(`
function gotHands(results) {
  hands = results;
}

function drawHands() {
  fill(255, 0, 0);
  noStroke();

  for (let hand of hands) {
    for (let point of hand.keypoints) {
      circle(point.x, point.y, 10);
    }
  }
}
`);
  }

  // Segmentation
  if (config.includeSegmentation) {
    globals += `
let bodySegmentationModel;
let segmentation = null;

let bodySegmentationOptions = {
  maskType: "parts",
};
`;

    preloadLines.push(`
bodySegmentationModel = ml5.bodySegmentation("BodyPix", bodySegmentationOptions);
`);

    setupLines.push(`
bodySegmentationModel.detectStart(video, gotSegmentation);
`);

    drawLines.push(`
if (segmentation) {
  image(segmentation.mask, 0, 0, width, height);
}
`);

    functionBlocks.push(`
function gotSegmentation(result) {
  segmentation = result;
}
`);
  }

  // Face texture
  if (config.includeFaceTexture) {
    globals += `
let faceTextureImage;
`;

    preloadLines.push(`
faceTextureImage = loadImage("clouds.png");
`);

    drawLines.push(`
drawFaceTextureMapped();
`);

    functionBlocks.push(`
function pointToVector(point) {
  return createVector(point.x, point.y);
}

function drawFaceTextureMapped() {
  for (let face of faces) {
    noStroke();
    noLights();

    textureMode(IMAGE);
    texture(faceTextureImage);

    beginShape(TRIANGLES);

    for (let i = 0; i < TRIANGULATION.length - 2; i += 3) {
      let indexA = TRIANGULATION[i];
      let indexB = TRIANGULATION[i + 1];
      let indexC = TRIANGULATION[i + 2];

      let facePointA = pointToVector(face.keypoints[indexA]);
      let facePointB = pointToVector(face.keypoints[indexB]);
      let facePointC = pointToVector(face.keypoints[indexC]);

      let faceCenter = createVector(
        face.faceOval.centerX,
        face.faceOval.centerY
      );

      let imageCenter = createVector(
        faceTextureImage.width / 2,
        faceTextureImage.height / 2
      );

      let relativeA = p5.Vector.sub(facePointA, faceCenter);
      let relativeB = p5.Vector.sub(facePointB, faceCenter);
      let relativeC = p5.Vector.sub(facePointC, faceCenter);

      let faceWidth = face.faceOval.width;
      let faceHeight = face.faceOval.height;

      relativeA.div(faceWidth, faceHeight);
      relativeB.div(faceWidth, faceHeight);
      relativeC.div(faceWidth, faceHeight);

      relativeA.mult(faceTextureImage.width, faceTextureImage.height);
      relativeB.mult(faceTextureImage.width, faceTextureImage.height);
      relativeC.mult(faceTextureImage.width, faceTextureImage.height);

      let texturePointA = p5.Vector.add(imageCenter, relativeA);
      let texturePointB = p5.Vector.add(imageCenter, relativeB);
      let texturePointC = p5.Vector.add(imageCenter, relativeC);

      vertex(facePointA.x, facePointA.y, texturePointA.x, texturePointA.y);
      vertex(facePointB.x, facePointB.y, texturePointB.x, texturePointB.y);
      vertex(facePointC.x, facePointC.y, texturePointC.x, texturePointC.y);
    }

    endShape();
  }
}
`);
  }

  let preloadBlock = `function preload() {${preloadLines.join("\n")}\n}\n`;
  let setupBlock = `function setup() {${setupLines.join("\n")}\n}\n`;
  let drawBlock = `function draw() {${drawLines.join("\n")}\n}\n`;

  return `${globals}

${preloadBlock}

${setupBlock}

${drawBlock}

${functionBlocks.join("\n")}
`;
}