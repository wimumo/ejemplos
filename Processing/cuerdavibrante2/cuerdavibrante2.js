/*
Adaptado para WIMUMO de: 

“Motion Catalog” 
by peter friend
http://openprocessing.org/sketch/1481948
License CreativeCommons Attribution ShareAlike
https://creativecommons.org/licenses/by-sa/3.0

Adaptado para funcionar con muestras enviadas desde WIMUMO
Requiere wimumo-desktop-app funcionando (expone servidor de websockets)
*/

// Title: Motion Catalog
// Author: FAL
// Date: 3. Oct. 2017
// Made with p5.js v0.5.14 (plugin: p5.sound.js v0.3.5)

/* VARIABLES AUDIO */
var soundEnabled = true;
var myOscillator;
var playingSound;
var previousSoundTimeStamp;
var env;
let t1 = 0.1; // attack time in seconds
let l1 = 0.7; // attack level 0.0 to 1.0
let t2 = 0.3; // decay time in seconds
let l2 = 0.1; // decay level  0.0 to 1.0
var predisparo = false;
var sonar = false;
let noise, filterlp;

var myElementSet;

var frameCountPerCicle = 60;
var currentCicleFrameCount;
var
  currentCicleProgressRatio,
  currentCicleQuadEaseInRatio,
  currentCicleQuadEaseOutRatio,
  currentCicleQuartEaseInRatio,
  currentCicleQuartEaseOutRatio;

var backgroundColor;

/*
 * WIMUMO
 */

var host = 'localhost:80';
var socket; // the websocket

var sensor1 = 0; // the sensor value
var sensor2 = 0; // the sensor value
var mod1=1;
var filtro1;
var filtro2;


function setup() {
  createCanvas(640, 640);
  backgroundColor = color(240);


  filtro1 = new Filtro(20);
  filtro2 = new Filtro(20);


  myOscillator = new p5.Oscillator();
  myOscillator.setType('sine');
  myOscillator.freq(220);
  myOscillator.amp(0);
  myOscillator.start();
  env = new p5.Envelope(t1, l1, t2, l2);
  
  filterlp = new p5.BandPass();
  filterlp.freq(400);
  noise = new p5.Noise();
   noise.disconnect();
  noise.connect(filterlp);
  noise.start();
  
  ellipseMode(CENTER);
  rectMode(CENTER);

  myElementSet = new ElementSet(1, 150);

  myElementSet.push(drawOrbit);
  myElementSet.push(drawString);

  socket = new WebSocket('ws://' + host);
  // socket connection listener:
  //socket.onopen = sendIntro;
  // socket message listener:
  socket.onmessage = readMessage;
}

function draw() {
  background(backgroundColor);
  updateCurrentCicleProgress();

  myElementSet.display();

  /*
  if (soundEnabled) {
   if (frameCount % frameCountPerCicle == 0){
   playSound();
   }
   if (playingSound && millis() - previousSoundTimeStamp > 20) {
   myOscillator.amp(0, 0.1);
   playingSound = false;
   }
   }
   */
}

function updateCurrentCicleProgress() {
  currentCicleFrameCount = frameCount % frameCountPerCicle;
  currentCicleProgressRatio = currentCicleFrameCount / frameCountPerCicle;
  currentCicleQuadEaseInRatio = currentCicleProgressRatio * currentCicleProgressRatio;
  currentCicleQuadEaseOutRatio = -sq(currentCicleProgressRatio - 1) + 1;
  currentCicleQuartEaseInRatio = pow(currentCicleProgressRatio, 4);
  currentCicleQuartEaseOutRatio = -pow(currentCicleProgressRatio - 1, 4) + 1;
}

function mouseClicked() {
  if (soundEnabled) {
    myOscillator.stop();
  } else {
    myOscillator.start();
  }
  soundEnabled = !soundEnabled;
}

function playSound() {
  //myOscillator.amp(1, 0.02);
  env.play(myOscillator);
  // myOscillator.amp(0, 0.1, 0.02);  // Did not work in OpenProcessing, therefore used millis() as an alternative
  previousSoundTimeStamp = millis();
  playingSound = true;
}



var ElementSet = function(elementXCount, elementDisplaySize) {
  var elementArray = [];
  var positionInterval = width / (elementXCount + 1);
  var xIndex = 0;
  var yIndex = 0;

  this.push = function(displayFunction) {
    elementArray.push(new Element(
      (xIndex + 1) * positionInterval,
      (yIndex + 1) * positionInterval/1.5,
      displayFunction
      ));
    xIndex++;
    if (xIndex >= elementXCount) {
      xIndex = 0;
      yIndex++;
    }
  };

  this.display = function() {
    for (var elementIndex = 0, elementNumber = elementArray.length; elementIndex < elementNumber; elementIndex++) {
      elementArray[elementIndex].display(elementDisplaySize);
    }
  };
};

var Element = function(x, y, displayFunction) {
  this.xPosition = x;
  this.yPosition = y;
  this.display = displayFunction;
};


var disparo = false;
var primer_ciclo = true;
var ciclos = 0;
var angle = -3.14159/2;
function drawOrbit(size) {

  if (disparo==true) {
    //angle = -HALF_PI + TWO_PI * currentCicleQuartEaseOutRatio;
    angle += TWO_PI/20;
    ciclos++;
    if (ciclos >= 20) {
      disparo = false;
      ciclos = 0;
    }
  }

  var particleSize = size * 0.2;
  var radius = size * 0.5;
  stroke(0);
  strokeWeight(1);
  noFill();
  ellipse(this.xPosition, this.yPosition, size, size);
  noStroke();
  fill(0);
  ellipse(this.xPosition + radius * cos(angle), this.yPosition + radius * sin(angle), particleSize, particleSize);
}


function drawString(size) {
  var diameter = size * 0.15;
  //var amplitude = size * 0.5 * (1 - currentCicleProgressRatio);
  var amplitude = size * 0.5 * mod1;
  var halfLength = size * 0.7;
  var yDisplacement = amplitude;
  if (currentCicleFrameCount % 2 == 0) {
    yDisplacement = -yDisplacement;
  }

  stroke(0);
  strokeWeight(1);
  noFill();
  for (var i = 0; i < 3; i++) {
    if (i >= 1) {
      yDisplacement = amplitude * random(-1, 1);
    }
    bezier(
      this.xPosition - halfLength, this.yPosition,
      this.xPosition, this.yPosition + yDisplacement,
      this.xPosition, this.yPosition + yDisplacement,
      this.xPosition + halfLength, this.yPosition
      );
  }
  noStroke();
  fill(0);
  ellipse(this.xPosition - halfLength, this.yPosition, diameter, diameter);
  ellipse(this.xPosition + halfLength, this.yPosition, diameter, diameter);
}


function readMessage(event) {
  var msg = event.data; // read data from the onmessage event
  nums = msg.split(',');
  if (nums[0]=="1") {
    sensor1 = Number(nums[1]);
    sensor1 = filtro1.nuevaMuestra(sensor1);
    var max = 3000;
    if (sensor1>max) {
      sensor1 = max;
    }
    mod1 =  map(sensor1, 0, max, 0.0, 3.0);
    
    if(soundEnabled == true){
    noise.amp(mod1*5, 0.2);
    }
    else{
      noise.amp(0, 0.2);
    }
    //print(sensor1);
  }
  if (nums[0]=="2") {
    sensor2 = Number(nums[1]);
    //sensor2 = filtro2.nuevaMuestra(sensor2);
    print(sensor2);
    var umbral_dis = 700;
    var umbral_pre = 300;

    if (sensor2>umbral_dis && predisparo == true) {
      predisparo = false;
      disparo = true;
      sonar = true;
      primer_ciclo = true;
    }
    if (sensor2<umbral_pre) {
      predisparo = true;
    }

    if (soundEnabled) {
      if (sonar == true) {
        playSound();
        
        sonar = false;
      }
      if (playingSound && millis() - previousSoundTimeStamp > 20) {
        myOscillator.amp(0, 0.1);
        playingSound = false;
      }
    }
  }
}
