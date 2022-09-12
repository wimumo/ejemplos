/*
Adaptado para WIMUMO de: 

“UTeachCSP—Theremin” 
by UTeachCS
http://openprocessing.org/sketch/742067
License CreativeCommons Attribution ShareAlike
https://creativecommons.org/licenses/by-sa/3.0

Adaptado para funcionar con muestras enviadas desde WIMUMO
Requiere wimumo-desktop-app funcionando (expone servidor de websockets)
*/

var osc;

var analyzer;
var numSamples = 1024;

// Array of amplitude values (-1 to +1) over time.
var samples = [];
var currentSource = "sine";

var mute = false;

/* 
 * WIMUMO
*/
var host = 'localhost:80';
var socket; // the websocket
var sensor1 = 0; // the sensor value
var sensor2 = 0; // the sensor value
var filtro1;
var filtro2;


function setup() {
  var cnv = createCanvas(numSamples, 500);
  noFill();
  stroke(240);

  analyzer = new p5.FFT(0, numSamples);

  // set up various inputs. We'll toggle them when key "T" is pressed.
  osc = new p5.Oscillator();
  osc.amp(0.5);
  osc.freq(10);
  osc.setType('sine');
  
  analyzer.setInput(osc);
  
  // Filtros wimumo
  filtro1 = new Filtro(30);
  filtro2 = new Filtro(30);
  // Conexión con wimumo-desktop-app
  socket = new WebSocket('ws://' + host);
  socket.onmessage = readMessage;
  
}

function draw() {
  background(30, 30, 30, 220);
  
  // get a buffer of 1024 samples over time.
  samples = analyzer.waveform();
  var bufLen = samples.length;

  // draw snapshot of the samples
  strokeWeight(4);
  beginShape();
  for (var i = 0; i < bufLen; i++){
    var x = map(i, 0, bufLen, 0, width);
    var y = map(samples[i], -1, 1, -height/2, height/2);
    vertex(x, y + height/2);
  }
  endShape();

  // map the oscillator frequency to mouse position
  // Adaptado a mensajes wimumo
  var w1 = sensor1;
  var w2 = sensor2;
  
  var minf = 0;  
  var maxf = 2000;
  
  var mina = 100;
  var maxa = 500;
    
  var freq = map(w1, minf, maxf, 150, 3000, true);
  osc.freq(freq, 0.01);
  var amp = map(w2, mina, maxa, 0, 1, true);
  if (mute == true) {
    osc.amp(0.0);
  } else {
    osc.amp(amp, 0.01);
  }

  labelStuff(freq, amp);

}

function mouseClicked (){
  if (mute == true) {
    mute = false;
     osc.start();
  } else {
     mute = true;
    
  }
}

// draw text
function labelStuff(freq, amp) {
  var textX = 20;
  var textY = 20;
  var legendX = 25;
  var legendY = 60;
  strokeWeight(1);
  text('Frequency: ' + freq, textX, textY);
  text('Amplitude: ' + amp, textX, textY + 20);
  textSize(12);
  text('volume',(legendX)-20,(legendY+60)+15);
  text('pitch',(legendX+70)+5,legendY+5);
  
  text('Click left mouse button to mute.', numSamples - 180, textY);
  if (mute == true) {
    stroke(255, 0, 0);
    text('Currently Muted.', numSamples - 100, 40);
    stroke(200);
  } else {
    stroke(0);
    text('Currently Muted.', numSamples - 100, 40);
    stroke(200);
  }
  

  
  beginShape();
  strokeWeight(2);
  stroke(200);

  line(legendX,legendY,(legendX+70),legendY);
  line((legendX+70)+20*cos(60),legendY-20*sin(60),(legendX+70),legendY);
  line((legendX+70)+20*cos(60),legendY+20*sin(60),(legendX+70),legendY);

  line(legendX,legendY,legendX,(legendY+60));  
  line(legendX+20*sin(60),(legendY+60)+20*cos(60),legendX,(legendY+60));
  line(legendX-20*sin(60),(legendY+60)+20*cos(60),legendX,(legendY+60));
  endShape();
}

// Lee y mapea mensajes de wimumo
function readMessage(event) {
  var msg = event.data; // read data from the onmessage event
  nums = msg.split(',');
  if(nums[0]=="1"){
    sensor1 = Number(nums[1]);
    sensor1 = filtro1.nuevaMuestra(sensor1);
    print(sensor1);
  }
  else if(nums[0]=="2"){
    sensor2 = Number(nums[1]);
    sensor2 = filtro2.nuevaMuestra(sensor2);
    print(sensor2);
  }

  
}
