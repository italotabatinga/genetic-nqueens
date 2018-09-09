// NQueents Genetic Algorithm

var nQueens;

var cnv;
var N;
function setup() {
  nQueens = new GenNQueens(50, 50, 0.1);
  N = nQueens.N;
  cnv = createCanvas(500,500);
  cnv.position((windowWidth - width) / 2, (windowHeight - height) / 2);

  // frameRate(10);
}

function windowResized() {
  cnv.position((windowWidth - width) / 2, (windowHeight - height) / 2);
}

function measureTime() {
  frameRate(0);
  nQueens = new GenNQueens(50,50, 0.1);
  let start = performance.now();
  let i = 0;
  while(!nQueens.foundSolution) {
    nQueens.offspring();
    if (i++ == 1000) {
      nQueens.debug_sort_population();
      i = 0;
    }
  }
  let end = performance.now();
  console.log(nQueens.solution, end-start);
  frameRate(60);
}

function draw_chromosome(chromosome) {
  let offset = width / (2 * N);
  chromosome.forEach((i, j) => {
    ellipse(offset + j * width / N, offset + i * width / N, offset*2);
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

function draw() {
  background(0);

  fill(255);
  let odd = false;
  for(let i = 0; i < height; i += height / N) {
    odd = !odd;
    for(let j =  odd ? width / N : 0; j < width; j += 2 * width / N) {
      rect(i, j, height/N, width/N);
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
  fill(0);
  text(Math.round(frameRate()), 0,height);
}