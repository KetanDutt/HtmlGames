const apiUrl = 'https://shadify.dev/api/sudoku';

async function generateSudoku() {
    const response = await fetch(`${apiUrl}/generator?fill=30`);
    const data = await response.json();
    const grid = document.getElementById('sudoku-grid');
    grid.innerHTML = '';

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('input');
            cell.type = 'number';
            cell.min = 1;
            cell.max = 9;
            cell.value = data.task[i][j] !== 0 ? data.task[i][j] : '';
            cell.disabled = data.task[i][j] !== 0;
            cell.classList.add('grid-cell');
            grid.appendChild(cell);
        }
    }
}

async function checkSudoku() {
    const grid = document.getElementById('sudoku-grid');
    const inputs = grid.querySelectorAll('input');
    const task = [];

    for (let i = 0; i < 9; i++) {
        task.push([]);
        for (let j = 0; j < 9; j++) {
            const cell = inputs[i * 9 + j];
            task[i].push(cell.value ? parseInt(cell.value) : 0);
        }
    }

    const response = await fetch(`${apiUrl}/verifier`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ task })
    });
    const result = await response.json();

    const message = document.getElementById('message');
    if (result.isValid) {
        message.textContent = 'Sudoku is valid!';
        message.style.color = 'green';
    } else {
        message.textContent = `Sudoku is invalid at ${result.position}`;
        message.style.color = 'red';
    }
}

// Initial Sudoku generation
generateSudoku();