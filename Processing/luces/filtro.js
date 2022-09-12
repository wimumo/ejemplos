/*
Filtro de suavizado para las muestras
*/

class Filtro {

  constructor(N) {
    this.mem = [];
    for (let i=0; i<N; i++) {
      this.mem.push(0.0);
    }
    this.tam = N;
    this.idx = 0;
    this.y = 0.0;
    this.acc = 0.0;
  }


  nuevaMuestra(muestra)
  {
    this.acc -= this.mem[this.idx];
    this.mem[this.idx] = muestra;
    this.acc += this.mem[this.idx];
    this.idx = (this.idx + 1) % this.tam;
    this.y = this.acc / this.tam;

    return this.y;
  }
}
