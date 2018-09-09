class GenNQueens {
  constructor(N, pop, mut_prob) {
    this.generation= new Array(pop);
    this.N = N;
    this.pop = pop;
    this.mut_prob = mut_prob;
  
    this.solution = undefined;
    this.foundSolution = false;

    this.init_population();
    // this.sort_population();
  }

  init_population() {
    for(let i = 0; i < this.pop; i++) {
      this.generation[i] = Array.from({length: this.N}, () => Math.floor(Math.random() * this.N));
    }
  }

  sort_population() {
    this.generation.sort((chromo1, chromo2) => {
      return this.fitness(chromo1) - this.fitness(chromo2);
    })
  }

  fitness(chromosome) {
    let t1 = 0;
    let t2 = 0;
    let t3 = 0;
    let size = chromosome.length;
    let f1 = new Array(size);
    let f2 = new Array(size);
    let f3 = new Array(size);

    for(let i = 0; i < size; i++) {
      f1[i] = chromosome[i] - i;
      f2[i] = (1+size) - chromosome[i] - i;
      f3[i] = chromosome[i];
    }

    f1.sort()
    f2.sort()
    f3.sort()

    for(let i = 1; i < size; i++) {
      if(f1[i] == f1[i-1])
        t1 += 1;
      if(f2[i] == f2[i-1])
        t2 += 1;
      if(f3[i] == f3[i-1])
        t3 += 1;
    }
    return t1+t2+t3;
  }

  crossover(parent1, parent2) {
    let inf = Math.floor(Math.random() * this.N);
    let sup = Math.floor(Math.random() * this.N);
    if (inf > sup) {
      let temp = inf;
      inf = sup;
      sup = inf;
    }

    let child1 = new Array(this.N);
    let child2 = new Array(this.N);

    for(let i = 0; i < this.N; i++) {
      if(i < inf || i > sup) {
        child1[i] = parent1[i]; 
        child2[i] = parent2[i]; 
      } else {
        child2[i] = parent1[i]; 
        child1[i] = parent2[i]; 
      }
    }
    this.mutate(child1);
    this.mutate(child2);
    return new Array(child1, child2);
  }

  offspring() {
    // Survival array to select parents based on its fitness
    // Store N-fitness(number)  index of each parent to simulate
    // probability
    let survival = new Array();
    
    let old_gen = this.generation;
    this.generation = new Array();

    old_gen.forEach((chromosome, index) => {
      let fit = this.fitness(chromosome);
      if (fit == 0) {
        this.foundSolution = true;
        this.solution = chromosome;
      }
      let num_repetitions = this.N - fit > 0 ? this.N - fit : 0;
      survival = survival.concat(new Array(num_repetitions).fill(index));
    });

    let num_iter = ceil(this.pop / 2);
    for(let i = 0; i < num_iter; i++) {
      let parent1 = old_gen[survival[Math.floor(Math.random() * survival.length)]];
      let parent2 = old_gen[survival[Math.floor(Math.random() * survival.length)]];
    
      this.generation = this.generation.concat(this.crossover(parent1, parent2));
    }
    if(this.generation.length > this.pop) {
      this.generation.pop();
    }
  }

  mutate(chromosome) {
    if (Math.random() > this.mut_prob)
      return;
    let unique = new Array();
    let values = new Array();
    let repeated_indexes = new Array();
    for(let i = 0; i < this.N; i++) {
      unique.push(i);
      values.push(i);
    }

    for(let i = 0; i < this.N; i++) {
      let includes = unique.indexOf(chromosome[i]);
      if(includes > 0) {
        unique.splice(includes,1);
      }
    }

    if(unique.length >= 0) {
      for(let i = 0; i < this.N; i++) {
        let includes = values.indexOf(chromosome[i]);
        if(includes> 0) {
          values.splice(includes,1);
        } else {
          chromosome[i] = unique[0];
          unique.shift();
          if(unique.length == 0)
            break;
        }
      }
    }
    let index1 = Math.floor(Math.random() * this.N);
    let index2 = Math.floor(Math.random() * this.N);

    let temp = chromosome[index1];
    chromosome[index1] = chromosome[index2];
    chromosome[index2] = temp;



    // let chromo_copy = chromosome.slice();
    // chromo_copy.sort();
    
    // let repeated_value = -1;
    // for(let i = 0; i < this.N-1; i++) {
    //   if(chromo_copy[i] == chromo_copy[i+1]) {
    //     repeated_value = chromo_copy[i];
    //     break;
    //   }
    // }
    // if (repeated_value > 0) {
    //   for(let i = 0; i < this.N; i++) {
    //     if(chromosome[i] == repeated_value) {
    //       chromosome[i] = Math.floor(Math.random() * this.N);
    //     }
    //   }
    // }
  }

  debug_sort_population() {
    // for(let i = 0; i < this.pop; i++) {
    //   console.log(this.fitness(this.generation[i]));
    // }
    this.generation.forEach(chromo => {
      console.log(this.fitness(chromo));
    })
  }

  debug_genetics() {
    for(let i = 0; i < 250; i++) {
      this.offspring();
    }
  }
}