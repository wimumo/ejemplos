/*
Adaptado para WIMUMO de: 

“Magical trail shader” 
by Jason Labbe
http://openprocessing.org/sketch/835887
License CreativeCommons Attribution ShareAlike
https://creativecommons.org/licenses/by-sa/3.0

Adaptado para funcionar con muestras enviadas desde WIMUMO
Requiere wimumo-desktop-app funcionando (expone servidor de websockets)
*/

// If you get an error about max uniforms then you can decrease these 2 values :(
const MAX_PARTICLE_COUNT = 70;
const MAX_TRAIL_COUNT = 30;

var colorScheme = ["#E69F66", "#DF843A", "#D8690F", "#B1560D", "#8A430A"];
var shaded = true;
var theShader;
var shaderTexture;
var trail = [];
var particles = [];

/* 
 * WIMUMO
*/

var host = 'localhost:80';
var socket; // the websocket

var psensor1 = 0; // the sensor value
var psensor2 = 0; // the sensor value
var sensor1 = 0; // the sensor value
var sensor2 = 0; // the sensor value

var filtro1;
var filtro2;


function preload() {
  theShader = new p5.Shader(this.renderer, vertShader, fragShader);
}

function setup() {
  pixelDensity(1);
  
  filtro1 = new Filtro(30);
  filtro2 = new Filtro(30);
  
  let canvas = createCanvas(
    min(windowWidth, windowHeight), 
    min(windowWidth, windowHeight), 
    WEBGL);
  

  
  canvas.canvas.oncontextmenu = () => false;  // Removes right-click menu.
  noCursor();

  shaderTexture = createGraphics(width, height, WEBGL);
  shaderTexture.noStroke();
  
     socket = new WebSocket('ws://' + host);
  // socket connection listener:
  //socket.onopen = sendIntro;
  // socket message listener:
  socket.onmessage = readMessage;
}

function draw() {
  background(0);
  noStroke();
  
  // Trim end of trail.
  //trail.push([mouseX, mouseY]);
  trail.push([sensor1, sensor2]);
  
  let removeCount = 1;
  if (mouseIsPressed && mouseButton == CENTER) {
    removeCount++;
  }
  
  for (let i = 0; i < removeCount; i++) {
    if (trail.length == 0) {
      break;
    }
    
    if (mouseIsPressed || trail.length > MAX_TRAIL_COUNT) {
      trail.splice(0, 1);
    }
  }
  
  // Spawn particles.
  if (trail.length > 1 && particles.length < MAX_PARTICLE_COUNT) {
    let mouse = new p5.Vector(sensor1, sensor2);
    mouse.sub(psensor1, psensor2);
    if (mouse.mag() > 10) {
      mouse.normalize();
      particles.push(new Particle(psensor1, psensor2, mouse.x, mouse.y));
    }
  }
  
  translate(-width / 2, -height / 2);
  
  // Move and kill particles.
  for (let i = particles.length - 1; i > -1; i--) {
    particles[i].move();
    if (particles[i].vel.mag() < 0.1) {
      particles.splice(i, 1);
    }
  }
  
  if (shaded) {
    // Display shader.
    shaderTexture.shader(theShader);
    
    let data = serializeSketch();

    theShader.setUniform("resolution", [width, height]);
    theShader.setUniform("trailCount", trail.length);
    theShader.setUniform("trail", data.trails);
    theShader.setUniform("particleCount", particles.length);
    theShader.setUniform("particles", data.particles);
    theShader.setUniform("colors", data.colors);

    shaderTexture.rect(0, 0, width, height);
    texture(shaderTexture);
    
    rect(0, 0, width, height);
  } else {
    // Display points.
    stroke(255, 200, 0);
    for (let i = 0; i < particles.length; i++) {
      point(particles[i].pos.x, particles[i].pos.y);
    }
    
    stroke(0, 255, 255);
    for (let i = 0; i < trail.length; i++) {
      point(trail[i][0], trail[i][1]);
    }
  }
  
  psensor1 = sensor1;
  psensor2 = sensor2;
}


function mousePressed() {
  if (mouseButton == RIGHT) {
    shaded = !shaded;
  }
  /*
  let fs = fullscreen();
    fullscreen(!fs);
   resizeCanvas(windowWidth, windowHeight);
   shaderTexture = createGraphics(width, height, WEBGL);
  shaderTexture.noStroke();
  */
}

function serializeSketch() {
  data = {"trails": [], "particles": [], "colors": []};
  
  for (let i = 0; i < trail.length; i++) {
    data.trails.push(
      map(trail[i][0], 0, width, 0.0, 1.0),
      map(trail[i][1], 0, height, 1.0, 0.0));
  }
  
  for (let i = 0; i < particles.length; i++) {
    data.particles.push(
      map(particles[i].pos.x, 0, width, 0.0, 1.0), 
      map(particles[i].pos.y, 0, height, 1.0, 0.0),
      particles[i].mass * particles[i].vel.mag() / 100)

    let itsColor = colorScheme[particles[i].colorIndex];
    data.colors.push(red(itsColor), green(itsColor), blue(itsColor));
  }
  
  return data;
}

function readMessage(event) {
  var msg = event.data; // read data from the onmessage event
  nums = msg.split(',');
  if(nums[0]=="1"){
    sensor1 = Number(nums[1]);
    sensor1 = filtro1.nuevaMuestra(sensor1);
    print(sensor1);
  }
   if(nums[0]=="2"){
    sensor2 = Number(nums[1]);
    sensor2 = filtro2.nuevaMuestra(sensor2);
    print(sensor2);
  }

  
}
