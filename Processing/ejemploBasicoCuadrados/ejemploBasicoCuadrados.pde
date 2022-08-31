/**
 * oscP5parsing by andreas schlegel
 * example shows how to parse incoming osc messages "by hand".
 * it is recommended to take a look at oscP5plug for an
 * alternative and more convenient way to parse messages.
 * oscP5 website at http://www.sojamo.de/oscP5
 */

import oscP5.*;

OscP5 oscP5;
float w1=0;
float w2=0
;
String nombre_wimumo = "/wimumo024"; // Cambiar según su WIMUMO

void setup() {

  size(800, 800);
  frameRate(25);
  
  /* Comienza oscP5, recibicendo transmisiones en el puerto 12000
   Configurar este mismo puerto en WIMUMO!*/
  oscP5 = new OscP5(this, 4560);
  
  // para dibujar
  rectMode(CENTER);
}


void draw() {
  background(0);

  
  fill(255,0,0);
  rect(width/4, height/2, w1, w1);
  
  fill(255, 216, 51);
  rect(width*3/4, height/2, w2, w2);
  //fill(r2);
  //rect(width/2 - r2/2, height/2, r2, r2);
}

void oscEvent(OscMessage theOscMessage) {

  /* check if theOscMessage has the address pattern we are looking for. */
  //println(theOscMessage);
  if (theOscMessage.checkAddrPattern(nombre_wimumo+"/env/ch1")==true) {
    w1 = theOscMessage.get(0).intValue();
    println(w1);
  }
  
  if (theOscMessage.checkAddrPattern(nombre_wimumo+"/env/ch2")==true) {
    w2 = theOscMessage.get(0).intValue();
    println(w2);
  }
}
