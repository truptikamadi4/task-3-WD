const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const scoreResetBtn = document.getElementById('scoreResetBtn');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreDEl = document.getElementById('scoreD');
const scoreOLabel = document.getElementById('scoreOLabel');
const modeBtns = document.querySelectorAll('.mode-btn');

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

let board = Array(9).fill(null);
let current = 'X';
let gameOver = false;
let mode = 'pvp'; // 'pvp' or 'pvc'
let scores = { X: 0, O: 0, D: 0 };

function buildBoard() {
  boardEl.innerHTML = '';
  board.forEach((val, i) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.addEventListener('click', () => handleCellClick(i));
    boardEl.appendChild(cell);
  });
}

function render() {
  const cells = boardEl.querySelectorAll('.cell');
  cells.forEach((cell, i) => {
    cell.textContent = board[i] || '';
    cell.classList.toggle('x', board[i] === 'X');
    cell.classList.toggle('o', board[i] === 'O');
    cell.classList.toggle('filled', !!board[i]);
  });
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDEl.textContent = scores.D;
  scoreOLabel.textContent = mode === 'pvc' ? 'Computer wins' : 'O wins';
}

function setStatus(html) {
  statusEl.innerHTML = html;
}

function updateStatusForTurn() {
  if (mode === 'pvc' && current === 'O') {
    setStatus(`Computer's turn (<span class="o">O</span>)`);
  } else {
    const cls = current === 'X' ? 'x' : 'o';
    const label = mode === 'pvc' && current === 'O' ? 'Computer' : `Player ${current}`;
    setStatus(`<span class="${cls}">${label}</span>'s turn`);
  }
}

function checkWinner(b) {
  for (const line of WIN_LINES) {
    const [a, b1, c] = line;
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
      return { winner: b[a], line };
    }
  }
  if (b.every(v => v)) return { winner: 'draw', line: null };
  return null;
}

function highlightWin(line) {
  const cells = boardEl.querySelectorAll('.cell');
  line.forEach(i => cells[i].classList.add('win'));
}

function handleCellClick(i) {
  if (gameOver || board[i]) return;
  if (mode === 'pvc' && current === 'O') return; // block clicks during computer's turn

  placeMark(i, current);

  const result = checkWinner(board);
  if (result) {
    finishGame(result);
    return;
  }

  current = current === 'X' ? 'O' : 'X';
  updateStatusForTurn();
  render();

  if (mode === 'pvc' && current === 'O' && !gameOver) {
    setTimeout(computerMove, 450);
  }
}

function placeMark(i, mark) {
  board[i] = mark;
  render();
}

function finishGame(result) {
  gameOver = true;
  if (result.winner === 'draw') {
    scores.D++;
    setStatus(`It's a <span class="o">draw</span>!`);
  } else {
    const cls = result.winner === 'X' ? 'x' : 'o';
    const label = mode === 'pvc' && result.winner === 'O' ? 'Computer' : `Player ${result.winner}`;
    scores[result.winner]++;
    setStatus(`<span class="${cls}">${label}</span> wins! 🎉`);
    highlightWin(result.line);
  }
  render();
}

// Simple unbeatable computer using minimax
function computerMove() {
  const bestMove = getBestMove(board);
  if (bestMove === -1) return;
  placeMark(bestMove, 'O');

  const result = checkWinner(board);
  if (result) {
    finishGame(result);
    return;
  }
  current = 'X';
  updateStatusForTurn();
  render();
}

function getBestMove(b) {
  let bestScore = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (!b[i]) {
      b[i] = 'O';
      const score = minimax(b, 0, false);
      b[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(b, depth, isMaximizing) {
  const result = checkWinner(b);
  if (result) {
    if (result.winner === 'O') return 10 - depth;
    if (result.winner === 'X') return depth - 10;
    return 0;
  }

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        b[i] = 'O';
        best = Math.max(best, minimax(b, depth + 1, false));
        b[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        b[i] = 'X';
        best = Math.min(best, minimax(b, depth + 1, true));
        b[i] = null;
      }
    }
    return best;
  }
}

function resetBoard() {
  board = Array(9).fill(null);
  current = 'X';
  gameOver = false;
  const cells = boardEl.querySelectorAll('.cell');
  cells.forEach(c => c.classList.remove('win'));
  updateStatusForTurn();
  render();
}

function resetScores() {
  scores = { X: 0, O: 0, D: 0 };
  render();
}

modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    modeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
    resetBoard();
  });
});

resetBtn.addEventListener('click', resetBoard);
scoreResetBtn.addEventListener('click', resetScores);

buildBoard();
updateStatusForTurn();
render();