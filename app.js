// Sacred Geometry Generator
// Steve Hadley
// https://vectr.is/

// Objects
let circleElements = [];
let lineElements = [];

// Animation
let animate = false;
let speed = 0;
let timer = 0;
let frequency = 0;
let circleMaxDiameter;
let overshoot;

// Input
let inputs = [];
let inputContainer;
let axisSlider;
let radiusSlider;
let circleDiameterSlider;
let lineLengthSlider;
let lineOuterStepSlider;
let lineInnerStepSlider;
let strokeWeightSlider;
let speedSlider;
let frequencySlider;

function setup() {
  var canvas = createCanvas();
  canvas.parent('p5js-container');
  colorMode(RGB, 255, 255, 255, 1);

  // Initialize inputs
  initInputs();

  // Calculate canvas size in order to adapt to screen size
  calculateCanvasSize();
  
  noFill();
  stroke(255);
  strokeWeight(3);

  var circleElement = new CircleElement();
  if(animate){
    circleElement.diameter = 0;
  }
  circleElements.push(circleElement);

  var lineElement = new LineElement();
  lineElements.push(lineElement);
}

function draw(){
  // Main loop
  background(0);
  translate(width / 2, height / 2);

  // Animate
  if(animate){
    // Every x seconds
    if(millis() >= frequency + timer){
      // Spawn new circle
      var circleElement = new CircleElement();
      circleElement.diameter = 0;
      circleElements.push(circleElement);
      timer = millis();
    }
    // Animate current circles
    for (let i = 0; i < circleElements.length; i++) {
      circleElements[i].expand();
      // Remove dead circles
      if(circleElements[i].diameter >= circleMaxDiameter){
        circleElements.splice(i, 1);
      }
    }
  }

  // Display
  Display();
}

function Display(){
  circleElements.forEach(circleElement => {
    circleElement.display();
  });
  lineElements.forEach(lineElement => {
    lineElement.display();
  });
}

// Save image
function Export() {
  var d = new Date();
  saveCanvas('Export' + d.getDate() + d.getMonth() + d.getFullYear() + d.getHours() + d.getMinutes() + d.getSeconds(), 'jpg');
}

function GetValue(input){
  return parseInt(input.value);
}

function initInputs(){
  inputContainer = document.getElementById('controls');
  axisSlider = inputContainer.querySelector('#axisSlider');
  radiusSlider = inputContainer.querySelector('#radiusSlider');
  circleDiameterSlider = inputContainer.querySelector('#circleDiameterSlider');
  lineLengthSlider = inputContainer.querySelector('#lineLengthSlider');
  lineOuterStepSlider = inputContainer.querySelector('#lineStepSlider');
  lineInnerStepSlider = inputContainer.querySelector('#lineGapSlider');
  strokeWeightSlider = inputContainer.querySelector('#strokeWeightSlider');
  speedSlider = inputContainer.querySelector('#speedSlider');
  frequencySlider = inputContainer.querySelector('#frequencySlider');

  axisSlider.value = 6;
  circleDiameterSlider.value = 100;
  lineOuterStepSlider.value = 30;
  lineInnerStepSlider.value = 30;
  strokeWeightSlider.value = 2;

  if(windowWidth <= 1280){
    lineLengthSlider.value = 130;
    radiusSlider.value = 100;
    radiusSlider.max = 200;
    lineLengthSlider.max = 200;
    circleDiameterSlider.max = 300;
    overshoot = 150;
  } else {
    lineLengthSlider.value = 400;
    radiusSlider.value = 200;
    radiusSlider.max = 500;
    circleDiameterSlider.max = 500;
    overshoot = 250;
  }

  // Hook up inputs
  inputs = inputContainer.getElementsByTagName('input');
  updateInputs();
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    input.oninput = function(){
      processInput(input);
    }
  }

  let animationToggle = inputContainer.querySelector('#animationToggle');
  animationToggle.addEventListener('change', function() {
    animate = this.checked;
    var animationControls = inputContainer.querySelector('#animation-controls');
    if(animate){
      animationControls.style.display = "block";
    } else {
      animationControls.style.display = "none";
    }
  });

  animate = animationToggle.checked;

  circleMaxDiameter = parseInt(circleDiameterSlider.max) + overshoot;
  console.log(circleMaxDiameter);

  inputContainer.querySelector('#export-button').onclick = (function () {
    Export();
  })

  inputContainer.querySelector('#randomize-button').onclick = (function () {
    randomize();
  })
}

function randomize(){
  inputs.forEach(input => {
    input.value = parseInt(random(input.min, input.max));
  });
  updateInputs();
}

function updateInputs(){
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    processInput(input);
  }
}

function processInput(input){
  // Update outputs
  let output = inputContainer.querySelector('#' + input.id + 'Output');
  output.value = input.value;
  // Resize elements
  circleElements.forEach(element => {
    element.resize();
  }); 
  lineElements.forEach(element => {
    element.resize();
  });
  // Update stroke weight
  strokeWeight(GetValue(strokeWeightSlider));
  // Update speed
  speed = GetValue(speedSlider);
  frequency = (parseInt(frequencySlider.max) + 1 - GetValue(frequencySlider)) * 1000;
  console.log(frequency);
  timer = frequency;
}

function windowResized() {
  calculateCanvasSize();
}

function calculateCanvasSize(){
  if(windowWidth <= 1280){
    resizeCanvas(windowWidth, windowHeight / 2);
  } else {
    resizeCanvas(windowWidth, windowHeight - 100);
  }
}

class CircleElement{
  constructor(){
    this.resize();
  }
  resize(){
    this.axis = GetValue(axisSlider);
    this.step = TWO_PI / this.axis;
    this.diameter = GetValue(circleDiameterSlider);
    this.radius = GetValue(radiusSlider);
    this.alpha = 1;
  }
  expand(){
    this.diameter += speed;
  }
  reset(){
    this.diameter = 0;
  }
  display(){
    let alpha = 1.0 - (this.diameter / circleMaxDiameter);
    stroke(255, 255, 255, alpha);
    // Draw center circle
    circle(0, 0, this.diameter);
    // Angle to rotate by
    this.theta = 0;
    let pos = createVector();
    // Rotate as per axis count, incrementing the angle by the chosen step size
    for (let i = 0; i < this.axis; i++) {
      this.theta += this.step;
      // Polar to cartesian coordinate conversion
      pos.x = this.radius * cos(this.theta);
      pos.y = this.radius * sin(this.theta);
      // Draw circle
      circle(pos.x, pos.y, this.diameter);
    }
  }
}

class LineElement{
  constructor(){
    this.resize();
  }
  resize(){
    this.length = GetValue(lineLengthSlider);
    this.outerStep = GetValue(lineOuterStepSlider);
    this.innerStep = GetValue(lineInnerStepSlider);
  }
  display(){
    // Rotate by the chosen step
    for (let a = 0; a < 360; a += this.outerStep){
      push();
      rotate(radians(a));
      // Draw lines in a wave pattern with a variable dispersion
      for (let r = 0; r < 180; r += this.innerStep) {
        // Rad method of creating line lengths in a wave pattern, inspired by https://linktr.ee/thedotiswhite
        stroke(255, 255, 255, 1);
        line(sin(radians(r)) * this.length, cos(radians(r)) * this.length, sin(radians(-r)) * this.length, cos(radians(-r)) * this.length);
      }
      pop();  
    }
  }
}