class GenNQueens {
  constructor(N, pop, mut_prob) {
    this.generation= new Array(pop);
    this.bad_repository = new Array(Math.floor(Math.sqrt(N)));
    this.N = N;
    this.pop = pop;
    this.mut_prob = mut_prob;
  
    this.solution = undefined;
    this.foundSolution = false;
    this.handleLocalMinimum = 0;

    this.epochs = 0;
    this.histogram = new Array(N);
    this.init_population();
    // this.sort_population();
  }

  init_population() {
    // Initiate epoch 0
    for(let i = 0; i < this.pop; i++) {
      this.generation[i] = shuffle(Array.from({length: this.N}, (val, index) => index));
    }

    //Define bad repository
    this.sort_population();
    for(let i = 0; i < this.bad_repository.length; i++) {
      this.bad_repository[i] = shuffle(Array.from({length: this.N}, (val, index) => index));
    }
  }

  sort_population() {
    this.generation.sort((chromo1, chromo2) => {
      let diff = this.fitness(chromo1) - this.fitness(chromo2);

      return diff >= 0 ? 1 : -1;
    })
  }

  // Fisher-Yates Shuffle
  // https://bost.ocks.org/mike/shuffle/

  shuffle(array) {
    var m = array.length, t, i;
  
    // While there remain elements to shuffle…
    while (m) {
  
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);
  
      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
  
    return array;
  }

  fitness(chromosome) {
    let t1 = 0;
    let t2 = 0;

    let size = chromosome.length;
    let f1 = new Array(size);
    let f2 = new Array(size);

    for(let i = 0; i < size; i++) {
      f1[i] = chromosome[i] - i;
      f2[i] = (1+size) - chromosome[i] - i;
    }

    f1.sort()
    f2.sort()

    for(let i = 1; i < size; i++) {
      if(f1[i] == f1[i-1])
        t1 += 1;
      if(f2[i] == f2[i-1])
        t2 += 1;
    }
    return t1+t2;
  }

  crossover(parent1, parent2) {
    let inf = Math.floor(Math.random() * this.N);
    let sup = Math.floor(Math.random() * this.N);
    if (inf > sup) {
      let temp = inf;
      inf = sup;
      sup = temp;
    }

    let child1 = new Array(this.N);
    let child2 = new Array(this.N);

    let idx_p1 = 0;
    let idx_p2 = 0;

    for(let i = 0; i < this.N; i++) {
      if(i < inf || i > sup) {
        while(parent1.slice(inf,sup+1).includes(parent2[idx_p2])) {
          idx_p2++;
        }
        child1[i] = parent2[idx_p2]; 
        idx_p2++;
        while(parent2.slice(inf,sup+1).includes(parent1[idx_p1])) {
          idx_p1++;
        }
        child2[i] = parent1[idx_p1]; 
        idx_p1++;
      } else {
        child1[i] = parent1[i]; 
        child2[i] = parent2[i]; 
      }
    }
    if (Math.random() < (this.mut_prob)) {
      this.mutate(child1); // Mutation
      if (Math.random() < (this.mut_prob / 2)) // Double Mutation
        this.mutate(child1);
    }
    if (Math.random() < (this.mut_prob)) {
      this.mutate(child2); // Mutation
      if (Math.random() < (this.mut_prob / 2)) // Double Mutation
        this.mutate(child2);
    } 
    return new Array(child1, child2);
  }

  offspring() {
    // Survival array to select parents based on its fitness
    // Store N-fitness(number)  index of each parent to simulate
    // probability
    this.epochs++;
    this.histogram.fill(0);
    let survival = new Array();
    
    let old_gen = this.generation.slice();

    // Build survival
    old_gen.forEach((chromosome, index) => {
      let fit = this.fitness(chromosome);
      if (fit == 0) {
        this.foundSolution = true;
        this.solution = chromosome;
      }
      this.histogram[fit]++;
      let num_repetitions = 2*this.N - fit;//Math.pow(this.N - fit,2);

      survival = survival.concat(new Array(num_repetitions).fill(index));
    });

    // Add children from crossovering parents
    let num_iter = Math.floor(this.pop / 2);
    for(let i = 0; i < num_iter; i++) {
      let parent1 = old_gen[survival[Math.floor(Math.random() * survival.length)]];
      let parent2 = old_gen[survival[Math.floor(Math.random() * survival.length)]];
      // let parent1 = old_gen[2*i];
      // let parent2 = old_gen[2*i+1];
      

      this.generation = this.generation.concat(this.crossover(parent1, parent2));
    }
    
    // Add bad repository crossover
    let bad_parent1 = this.bad_repository[Math.floor(Math.random() * this.bad_repository.length)];
    let bad_parent2 = this.bad_repository[Math.floor(Math.random() * this.bad_repository.length)];
    this.generation = this.generation.concat(this.crossover(bad_parent1, bad_parent2));
    
    let bad_parent = this.bad_repository[Math.floor(Math.random() * this.bad_repository.length)];
    let good_parent = old_gen[survival[Math.floor(Math.random() * survival.length)]];
    // let good_parent = old_gen[Math.floor(Math.random() * this.pop)];
    this.generation = this.generation.concat(this.crossover(good_parent, bad_parent));

    // Natural Selection, pick the N best
    this.sort_population();
    this.generation = this.generation.slice(0,this.pop);
    // this.generation = this.generation.slice(0,this.pop-Math.floor(this.pop/10)).concat(this.generation.slice(this.generation.length-Math.floor(this.pop/10),this.generation.length));
    // console.log(this.generation.length)

    // Handle Local Minimum
    let fit = this.fitness(this.generation[0]);
    if (this.histogram[fit] == this.pop) {
      this.handleLocalMinimum++;
    }
    // if(this.handleLocalMinimum == 200) {
    //   this.handleLocalMinimum = 0;
    //   for(let i = 0/*Math.floor(this.pop / 2)*/; i < this.pop; i++) {
    //     this.generation[i] = shuffle(this.generation[i]);
    //   }
    // }
  }

  mutate(chromosome) {
    let rollback_chromo = chromosome.slice();
    let index1 = Math.floor(Math.random() * this.N);
    let index2 = Math.floor(Math.random() * this.N);

    let temp = chromosome[index1];
    chromosome[index1] = chromosome[index2];
    chromosome[index2] = temp;
    if(this.fitness(chromosome) > this.fitness(rollback_chromo)){
      chromosome[index1] = rollback_chromo[index1];
      chromosome[index2] = rollback_chromo[index2];
    }
  }

  debug_sort_population() {
    // for(let i = 0; i < this.pop; i++) {
    //   console.log(this.fitness(this.generation[i]));
    // }
    this.sort_population()
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