document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const restartButton = document.getElementById('restart-button');
    const totalMinesElement = document.getElementById('total-mines');
    const flagsPlacedElement = document.getElementById('flags-placed');
    const timerElement = document.getElementById('timer');

    let totalMines = 0;
    let flagsPlaced = 0;
    let cellsOpened = 0;
    let totalCells = 0;
    let timer;
    let seconds = 0;

    function createBoard(width, height, boardData, mines) {
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${width}, 40px)`;
        gameBoard.style.gridTemplateRows = `repeat(${height}, 40px)`;

        totalCells = width * height;
        totalMines = mines;
        cellsOpened = 0;
        flagsPlaced = 0;
        seconds = 0;

        totalMinesElement.textContent = totalMines;
        flagsPlacedElement.textContent = flagsPlaced;
        timerElement.textContent = seconds;

        clearInterval(timer);
        timer = setInterval(() => {
            seconds++;
            timerElement.textContent = seconds;
        }, 1000);

        boardData.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellElement = document.createElement('div');
                cellElement.classList.add('cell');
                cellElement.dataset.row = rowIndex;
                cellElement.dataset.col = colIndex;
                if (cell === 'x') {
                    cellElement.dataset.mine = true;
                } else {
                    cellElement.dataset.number = cell;
                }
                cellElement.addEventListener('click', handleCellClick);
                cellElement.addEventListener('contextmenu', handleRightClick);
                gameBoard.appendChild(cellElement);
            });
        });
    }

    function handleCellClick(event) {
        const cell = event.target;
        if (cell.classList.contains('open') || cell.classList.contains('flag')) {
            return;
        }
        if (cell.dataset.mine) {
            cell.classList.add('mine');
            cell.innerHTML = '<i class="fas fa-bomb"></i>';
            Swal.fire({
                title: 'Game Over!',
                text: 'You clicked on a mine!',
                icon: 'error',
                confirmButtonText: 'OK'
            }).then(() => {
                // startGame();
            });
            revealBoard();
            clearInterval(timer);
        } else {
            revealCell(cell);
            checkWinCondition();
        }
    }

    function handleRightClick(event) {
        event.preventDefault();
        const cell = event.target;
        if (cell.classList.contains('open')) {
            return;
        }
        if (cell.classList.contains('flag')) {
            cell.classList.remove('flag');
            cell.innerHTML = '';
            flagsPlaced--;
        } else if (flagsPlaced < totalMines) {
            cell.classList.add('flag');
            cell.innerHTML = '<i class="fa-solid fa-flag"></i>';
            flagsPlaced++;
        }
        flagsPlacedElement.textContent = flagsPlaced;
        checkWinCondition();
    }

    function revealCell(cell) {
        if (cell.classList.contains('open')) {
            return;
        }
        cell.classList.add('open');
        cellsOpened++;
        const cellNumber = cell.dataset.number;
        if (cellNumber !== 'o') {
            cell.innerHTML = `<span>${cellNumber}</span>`;
        } else {
            cell.innerHTML = '';
        }

        if (cell.dataset.number === 'o') {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            revealAdjacentCells(row, col);
        }
    }

    function revealAdjacentCells(row, col) {
        const adjacentCells = [
            [row - 1, col - 1],
            [row - 1, col],
            [row - 1, col + 1],
            [row, col - 1],
            [row, col + 1],
            [row + 1, col - 1],
            [row + 1, col],
            [row + 1, col + 1]
        ];

        adjacentCells.forEach(([r, c]) => {
            const cell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
            if (cell && !cell.classList.contains('open') && !cell.classList.contains('flag')) {
                revealCell(cell);
            }
        });
    }

    function revealBoard() {
        document.querySelectorAll('.cell').forEach(cell => {
            if (cell.dataset.mine) {
                cell.classList.add('mine');
                cell.innerHTML = '<i class="fas fa-bomb"></i>';
            } else {
                cell.classList.add('open');
                const cellNumber = cell.dataset.number;
                cell.innerHTML = cellNumber !== 'o' ? `<span>${cellNumber}</span>` : '';
            }
        });
    }

    function checkWinCondition() {
        if (cellsOpened === totalCells - totalMines) {
            Swal.fire({
                title: 'You Win!',
                text: 'Congratulations, you opened all safe cells!',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                // startGame();
            });
            clearInterval(timer);
        }
        if (flagsPlaced === totalMines) {
            let allMinesFlagged = true;
            document.querySelectorAll('.cell.flag').forEach(cell => {
                if (!cell.dataset.mine) {
                    allMinesFlagged = false;
                }
            });
            if (allMinesFlagged) {
                Swal.fire({
                    title: 'You Win!',
                    text: 'Congratulations, you flagged all the mines!',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // startGame();
                });
                clearInterval(timer);
            }
        }
    }

    async function startGame() {
        const response = await fetch('https://shadify.dev/api/minesweeper/generator?start=1-1&width=15&height=15&mines=25');
        const data = await response.json();
        createBoard(data.width, data.height, data.board, data.mines);
    }

    restartButton.addEventListener('click', startGame);

    startGame();
});