const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const difficultySelect = document.getElementById('difficulty');
const funnyAdviceEl = document.getElementById('funnyAdvice');

let board = Array(9).fill('');
let gameOver = false;
let currentPlayer = 'X';
let mode = 'ai';

let scores = {
  X: parseInt(localStorage.getItem('scoreX')) || 0,
  O: parseInt(localStorage.getItem('scoreO')) || 0
};

// 🎭 Funny Quotes
const drawQuotes = [
  "It's a draw! 🤝 Try harder next time, genius brains!",
  "Great minds think alike... too much!",
  "Draw again? Are you secretly twins?",
  "Nobody wins... but everyone gets snacks 🍿",
  "Even the board is confused!"
];

const winQuotes = [
  "Victory! You're the Tic-Tac-Champion! 🏆",
  "You crushed it! 🧠💥",
  "That was smooth as butter on hot toast! 🍞",
  "You're smarter than the AI — tell your friends! 🤓",
  "Winning is your new hobby now!"
];

const loseQuotes = [
  "Oops, you lost! Maybe let your cat play next round? 🐱",
  "The AI wins again... dun dun dunnn!",
  "Don’t worry, even Einstein lost to Tic-Tac-Toe once. (Not really!)",
  "Better luck next tap, champ! 👣",
  "Plot twist: The AI trained on your moves 🧠"
];

function showFunnyAdvice(type) {
  let list = type === 'draw' ? drawQuotes : type === 'win' ? winQuotes : loseQuotes;
  funnyAdviceEl.textContent = list[Math.floor(Math.random() * list.length)];
}

function render() {
  boardEl.innerHTML = '';
  board.forEach((cell, idx) => {
    const cellEl = document.createElement('div');
    cellEl.className = 'cell';
    cellEl.textContent = cell;
    cellEl.addEventListener('click', () => handleMove(idx));
    boardEl.appendChild(cellEl);
  });
  updateScores();
}

function handleMove(idx) {
  if (board[idx] || gameOver) return;
  board[idx] = currentPlayer === 'X' ? '❌' : '⭕';
  render();

  if (checkWinner(currentPlayer)) {
    statusEl.textContent = `${currentPlayer === 'X' ? '❌' : '⭕'} wins!`;
    gameOver = true;
    updateScore(currentPlayer);
    showFunnyAdvice(currentPlayer === 'X' ? 'win' : 'lose');
    return;
  }

  if (board.every(cell => cell)) {
    statusEl.textContent = "It's a draw! 🤝";
    gameOver = true;
    showFunnyAdvice('draw');
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

  if (mode === 'ai' && currentPlayer === 'O') {
    setTimeout(aiMove, 500);
  } else {
    statusEl.textContent = `${currentPlayer === 'X' ? 'Your' : 'Friend'} Turn (${currentPlayer === 'X' ? '❌' : '⭕'})`;
    funnyAdviceEl.textContent = '';
  }
}

function aiMove() {
  let bestMove;
  const level = difficultySelect.value;

  if (level === 'easy') {
    const empty = board.map((v, i) => v === '' ? i : -1).filter(v => v !== -1);
    bestMove = empty[Math.floor(Math.random() * empty.length)];
  } else if (level === 'medium' && Math.random() < 0.5) {
    const empty = board.map((v, i) => v === '' ? i : -1).filter(v => v !== -1);
    bestMove = empty[Math.floor(Math.random() * empty.length)];
  } else {
    let best = -Infinity;
    board.forEach((_, idx) => {
      if (board[idx] === '') {
        board[idx] = '⭕';
        let score = minimax(board, 0, false, -Infinity, Infinity);
        board[idx] = '';
        if (score > best) {
          best = score;
          bestMove = idx;
        }
      }
    });
  }

  handleMove(bestMove);
}

function minimax(newBoard, depth, isMax, alpha, beta) {
  if (checkWinner('O')) return 10 - depth;
  if (checkWinner('X')) return depth - 10;
  if (newBoard.every(cell => cell !== '')) return 0;

  if (isMax) {
    let best = -Infinity;
    newBoard.forEach((cell, idx) => {
      if (cell === '') {
        newBoard[idx] = '⭕';
        best = Math.max(best, minimax(newBoard, depth + 1, false, alpha, beta));
        newBoard[idx] = '';
        alpha = Math.max(alpha, best);
        if (beta <= alpha) return best;
      }
    });
    return best;
  } else {
    let best = Infinity;
    newBoard.forEach((cell, idx) => {
      if (cell === '') {
        newBoard[idx] = '❌';
        best = Math.min(best, minimax(newBoard, depth + 1, true, alpha, beta));
        newBoard[idx] = '';
        beta = Math.min(beta, best);
        if (beta <= alpha) return best;
      }
    });
    return best;
  }
}

function checkWinner(playerSymbol) {
  const symbol = playerSymbol === 'X' ? '❌' : '⭕';
  const combos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return combos.some(combo => combo.every(i => board[i] === symbol));
}

function setMode(newMode) {
  mode = newMode;
  currentPlayer = 'X';
  board = Array(9).fill('');
  gameOver = false;
  funnyAdviceEl.textContent = '';
  statusEl.textContent = mode === 'ai' ? 'Your Turn (❌)' : 'Player X Turn (❌)';
  render();
}

function updateScore(player) {
  scores[player]++;
  localStorage.setItem(`score${player}`, scores[player]);
  updateScores();
}

function updateScores() {
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
}

resetBtn.onclick = () => setMode(mode);

render();
