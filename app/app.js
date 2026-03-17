document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const turnIndicator = document.getElementById('turn-indicator');
    const message = document.getElementById('message');
    const resetBtn = document.getElementById('reset-btn');
    const aiToggle = document.getElementById('ai-toggle');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');
    const dateDisplay = document.getElementById('date-display');
    const healthStatus = document.getElementById('health-status');

    let currentPlayer = 'X'; // Player1 is X, Player2 is O
    let gameState = ["", "", "", "", "", "", "", "", ""];
    let gameActive = true;
    const player1Name = 'Player1';
    const player2Name = 'Player2';

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    // --- Core Game Logic ---

    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (gameState[clickedIndex] !== "" || !gameActive) return;

        makeMove(clickedIndex);

        if (gameActive && aiToggle.checked && currentPlayer === 'O') {
            setTimeout(makeAiMove, 500);
        }
    }

    function makeMove(index) {
        gameState[index] = currentPlayer;
        const cell = cells[index];
        cell.innerText = currentPlayer;
        cell.classList.add('taken');
        cell.style.color = currentPlayer === 'X' ? '#bb86fc' : '#03dac6';

        checkResult();
    }

    function checkResult() {
        let roundWon = false;
        let winningLine = null;

        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                roundWon = true;
                winningLine = condition;
                break;
            }
        }

        if (roundWon) {
            let winner;
            if (currentPlayer === 'X') {
                winner = player1Name;
            } else {
                winner = aiToggle.checked ? 'Machine' : player2Name;
            }
            
            message.innerText = `${winner} wins`;
            message.style.color = '#03dac6';
            gameActive = false;
            saveMatchResult(winner);
            updateHealthStatus('Finished', 'healthy');
            triggerConfetti();
            
            // Auto-reset after 5 seconds
            setTimeout(resetGame, 5000);
            return;
        }

        if (!gameState.includes("")) {
            message.innerText = "It's a Draw!";
            gameActive = false;
            saveMatchResult('Draw');
            
            // Auto-reset after 5 seconds
            setTimeout(resetGame, 5000);
            return;
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateTurnIndicator();
    }

    function triggerConfetti() {
        const colors = ['#bb86fc', '#03dac6', '#cf6679', '#ffd700', '#ffffff'];
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.opacity = Math.random();
            confetti.style.transform = `scale(${Math.random()})`;
            document.body.appendChild(confetti);

            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }

    function updateTurnIndicator() {
        let name;
        if (currentPlayer === 'X') {
            name = player1Name;
        } else {
            name = aiToggle.checked ? 'Machine' : player2Name;
        }
        turnIndicator.innerText = `Turn: ${name} (${currentPlayer})`;
    }

    // --- AI Logic ---

    function makeAiMove() {
        if (!gameActive) return;

        // Simple AI: Find empty cells and pick one randomly
        const emptyIndices = gameState
            .map((val, idx) => val === "" ? idx : null)
            .filter(val => val !== null);

        if (emptyIndices.length > 0) {
            const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            makeMove(randomIndex);
        }
    }

    // --- Match History ---

    function saveMatchResult(winner) {
        const history = JSON.parse(localStorage.getItem('ttt_history') || '[]');
        const result = {
            date: new Date().toLocaleString(),
            winner: winner,
            mode: aiToggle.checked ? 'vs AI' : 'vs Player'
        };
        history.unshift(result);
        localStorage.setItem('ttt_history', JSON.stringify(history.slice(0, 10))); // Keep last 10
        renderHistory();
    }

    function renderHistory() {
        const history = JSON.parse(localStorage.getItem('ttt_history') || '[]');
        historyList.innerHTML = history.map(item =>
            `<li>${item.date}: <strong>${item.winner}</strong> (${item.mode})</li>`
        ).join('');
    }

    // --- Utility Functions ---

    function resetGame() {
        currentPlayer = 'X';
        gameState = ["", "", "", "", "", "", "", "", ""];
        gameActive = true;
        message.innerText = "";
        updateTurnIndicator();
        cells.forEach(cell => {
            cell.innerText = "";
            cell.classList.remove('taken');
            cell.style.color = 'inherit';
        });
        updateHealthStatus('Running', 'healthy');
    }

    function updateDateTime() {
        const now = new Date();
        dateDisplay.innerText = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function updateHealthStatus(status, className) {
        healthStatus.innerText = `Health: ${status}`;
        healthStatus.className = className;
    }

    // --- Event Listeners ---

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetBtn.addEventListener('click', resetGame);
    clearHistoryBtn.addEventListener('click', () => {
        localStorage.removeItem('ttt_history');
        renderHistory();
    });

    // --- Initialization ---
    updateDateTime();
    setInterval(updateDateTime, 1000);
    renderHistory();
    updateTurnIndicator();
    updateHealthStatus('Running', 'healthy');
});
