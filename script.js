const fs = require('fs');

// Função para ler o arquivo de entrada
function readFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    const problems = data.trim().split('\n').map(line => {
        const values = line.split(';').map(Number);
        const numCities = values[0];
        const distances = Array.from({ length: numCities }, () => Array(numCities).fill(0));
        let index = 1;
        for (let i = 0; i < numCities; i++) {
            for (let j = i + 1; j < numCities; j++) {
                distances[i][j] = values[index];
                distances[j][i] = values[index];
                index++;
            }
        }
        return distances;
    });
    return problems;
}

// Função para calcular a distância total de uma rota
function routeDistance(route, distanceMatrix) {
    return route.reduce((acc, curr, i) => acc + distanceMatrix[curr - 1][route[(i + 1) % route.length] - 1], 0);
}

// Função para gerar uma população inicial
function initialPopulation(size, numCities) {
    const population = [];

    for (let i = 0; i < size; i++) {
        const route = [...Array(numCities).keys()].map(n => n + 1); // Cidades de 1 a numCities
        population.push(shuffle(route));
    }

    return population;
}

// Função para embaralhar um array (Fisher-Yates Shuffle)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Função para selecionar os melhores indivíduos
function selection(population, distanceMatrix) {
    const scores = population.map(route => ({
        route,
        distance: routeDistance(route, distanceMatrix)
    }));
    scores.sort((a, b) => a.distance - b.distance);
    return scores.slice(0, Math.floor(scores.length / 2)).map(score => score.route);
}

// Função para fazer crossover entre dois pais
function crossover(parent1, parent2) {
    const size = parent1.length;
    const [start, end] = [Math.floor(Math.random() * size), Math.floor(Math.random() * size)].sort((a, b) => a - b);
    const child = Array(size).fill(null);
    for (let i = start; i < end; i++) {
        child[i] = parent1[i];
    }
    let pointer = 0;
    for (let gene of parent2) {
        if (!child.includes(gene)) {
            while (child[pointer] !== null) pointer++;
            child[pointer] = gene;
        }
    }
    return child;
}

// Função para aplicar mutação em uma rota
function mutate(route, mutationRate = 0.01) {
    if (Math.random() < mutationRate) {
        const [i, j] = [Math.floor(Math.random() * route.length), Math.floor(Math.random() * route.length)];
        [route[i], route[j]] = [route[j], route[i]];
    }
}

// Função principal do Algoritmo Genético
function geneticAlgorithm(distanceMatrix, populationSize = 100, generations = 500, mutationRate = 0.01) {
    let population = initialPopulation(populationSize, distanceMatrix.length);
    for (let generation = 0; generation < generations; generation++) {
        population = selection(population, distanceMatrix);
        const nextPopulation = [];
        while (nextPopulation.length < populationSize) {
            const [parent1, parent2] = [randomChoice(population), randomChoice(population)];
            const child = crossover(parent1, parent2);
            mutate(child, mutationRate);
            nextPopulation.push(child);
        }
        population = nextPopulation;
    }



    const bestRoute = population.reduce((best, curr) => (routeDistance(curr, distanceMatrix) < routeDistance(best, distanceMatrix) ? curr : best), population[0]);
    return { bestRoute, bestDistance: routeDistance(bestRoute, distanceMatrix) };
}

// Função auxiliar para escolher um elemento aleatório de um array
function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Função para resolver todos os problemas no arquivo
function solveProblems(filePath) {
    const problems = readFile(filePath);

    const solutions = geneticAlgorithm(problems[0]);
    return solutions;
}

// Exemplo de uso
const filePath = 'dados.txt'; // Substitua pelo caminho do seu arquivo de entrada
const solutions = solveProblems(filePath);
console.log(`Melhor rota = ${solutions.bestRoute}, Distância total = ${solutions.bestDistance}`);
