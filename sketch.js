// NQueents Genetic Algorithm

var nQueens;
var N;

// Canvas Variables
var cnv;
var x;
var y;
var boardw;
var boardh;

// N-Queens interface
var inputN;
var inputPop;
var inputMut;
var simButton;
var timeButton;

function setup() {
  nQueens = new GenNQueens(50, 20, 0.5);
  N = nQueens.N;
  cnv = createCanvas(500,600);
  boardh = 500;
  boardw = 500;

  x = (windowWidth - width) / 2;
  y = (windowHeight - height) / 2;
  cnv.position(x, y);

  inputN = createInput('50');
  inputN.style('width', '100px');
  inputN.position(x, y-inputN.height);
  inputPop = createInput('20');
  inputPop.style('width', '100px');
  inputPop.position(x + inputN.width, y - inputPop.height);
  inputMut = createInput('0.5');
  inputMut.style('width', '100px');
  inputMut.position(x + inputN.width+inputPop.width, y - inputMut.height);
  
  simButton = createButton('Run Simulation!')
  simButton.position(x+width-simButton.width, y-simButton.height);
  simButton.mousePressed(runSim);
  // frameRate(0);
}

function windowResized() {
  x = (windowWidth - width) / 2;
  y = (windowHeight - height) / 2;
  cnv.position(x, y);
  inputN.position(x, y-inputN.height);
  inputPop.position(x + inputN.width, y - inputPop.height);
  inputMut.position(x + inputN.width+inputPop.width, y - inputMut.height);
  simButton.position(x+width-simButton.width, y-simButton.height);
}

function runSim(Nlocal, poplocal, mutlocal) {
  nQueens = new GenNQueens(inputN.value(), inputPop.value(), inputMut.value());
  N = nQueens.N;
}

function measureTime(Nlocal, pop, mut) {
  frameRate(0);
  nQueens = new GenNQueens(Nlocal,pop, mut);
  N = nQueens.N;
  let start = performance.now();
  let i = 0;
  while(!nQueens.foundSolution) {
    nQueens.offspring();
    if (i++ == 1000) {
      nQueens.sort_population();
      console.log(nQueens.fitness(nQueens.generation[0]));
      // nQueens.debug_sort_population();
      i = 0;
    }
  }
  let end = performance.now();
  console.log(nQueens.solution, end-start);
  frameRate(60);
}

function draw_chromosome(chromosome) {
  let offset = boardw / (2 * N);
  chromosome.forEach((i, j) => {
    ellipse(offset + j * boardw / N, offset + i * boardw / N, offset*2);
  });
}

function draw_pop() {
  let num_chromosomes = Math.min(50, nQueens.pop);
  let step = Math.floor(nQueens.pop / num_chromosomes);
  
  noStroke();
  fill(255,0,0,255 * 10 / num_chromosomes);
  for(let i = 0; i < nQueens.pop; i += step) {
    draw_chromosome(nQueens.generation[i]);
  }
}

function drawHistogram() {
  fill(255);
  textAlign(CENTER);
  text('Fitness Histogram',boardw/2, boardh+10);

  let step = boardw / nQueens.N;
  let bar_height;
  rectMode(CORNERS);
  nQueens.histogram.forEach((value, index) => {
    bar_height = map(value, 0, nQueens.pop, 0, height-boardh-10);
    rect(step * index, height, step*(index+1), height-bar_height);
  });
  rectMode(CORNER);
}

function draw() {
  background(0);

  fill(255);
  let odd = false;
  for(let i = 0; i < boardh; i += boardh / N) {
    odd = !odd;
    for(let j =  odd ? boardw / N : 0; j < boardw; j += 2 * boardw / N) {
      rect(i, j, boardh/N, boardw/N);
    }
  }
  if(!nQueens.foundSolution){
    draw_pop();
    nQueens.offspring();
  } else {
    fill(0,255,0);
    draw_chromosome(nQueens.solution);
  }

  // stroke(0);
  drawHistogram();
  fill(255);
  textAlign(RIGHT);
  text("Epochs: " + nQueens.epochs, boardw,boardh+10)
  textAlign(LEFT);
  text("FPS "+Math.round(frameRate()), 0,boardh+10);
}