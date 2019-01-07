function buildGraph(data) {
    const matrix = [];
    const size = data.length;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            matrix.push(0);
        }
    }

    function forbidden(i, j) {
        for (let f of data[i].forbidden) {
            if (f == j) {
                return true;
            }
        }
        return false;
    }

    for (let i = 0; i < size; i++) {
        for (let j = i + 1; j < size; j++) {
            if (!forbidden(i, j)) {
                matrix[i * size + j] = 1;
                matrix[j * size + i] = 1;
            }
        }
    }

    return { matrix, size };
}

function getAllPermutations(list) {
    const results = [];

    if (list.length == 0) {
        return results;
    }

    if (list.length == 1) {
        results.push(list);
        return results;
    }

    for (let i = 0; i < list.length; i++) {
        const first = list[i];
        const rest = list.slice(0, i).concat(list.slice(i + 1));
        const innerPermutations = getAllPermutations(rest);
        for (let j = 0; j < innerPermutations.length; j++) {
            innerPermutations[j].unshift(first);
            results.push(innerPermutations[j]);
        }
    }
    return results;
}

function isHamiltonian(graph, perm) {
    for (let i = 0; i < perm.length; i++) {
        if (!graph.matrix[perm[i] * graph.size + perm[(i + 1) % perm.length]]) {
            return false;
        }
    }
    return true;
}

function findHamiltonians(graph) {
    const vertices = [];
    for (let i = 0; i < graph.size; i++) {
        vertices.push(i);
    }

    const perms = getAllPermutations(vertices);
    const hamiltonians = [];

    for (let perm of perms) {
        if (isHamiltonian(graph, perm)) {
            hamiltonians.push(perm);
        }
    }

    return hamiltonians;
}

function getRandomHamiltonian(graph) {
    const hamiltonians = findHamiltonians(graph);

    if (hamiltonians.length === 0) {
        return [];
    }

    return hamiltonians[Math.floor(Math.random() * hamiltonians.length)];
}

exports.draw = function(data) {
    const graph = buildGraph(data);
    return getRandomHamiltonian(graph);
}
