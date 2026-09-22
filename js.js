// focs
const bulbColors = ['red','yellow','blue','green','purple','orange'];

function createBulbs(container, count) {
  for (let i = 0; i < count; i++) {
    const b = document.createElement('div');
    const c = bulbColors[i % bulbColors.length];
    b.className = `bulb ${c} on`;
    b.style.setProperty('--dur', (0.6 + Math.random() * 1.2) + 's');
    b.style.setProperty('--delay', (Math.random() * 2) + 's');
    container.appendChild(b);
  }
}

createBulbs(document.getElementById('bulbTop'), 18);
createBulbs(document.getElementById('bulbBottom'), 18);
createBulbs(document.getElementById('bulbLeft'), 10);
createBulbs(document.getElementById('bulbRight'), 10);

// sonido
let currentMusic = null;
let musicMuted = false;
let musicInterval = null;
let musicStartTime = 0;

// estado
let playerRed = '';
let playerPurple = '';
let redReady = false;
let purpleReady = false;
let currentPlayer = 'red';
let scoreRed = 0;
let scorePurple = 0;
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 33;
let lockBoard = false;
let timerInterval = null;
let timeLeft = 30;
const TIMER_MAX = 30;

const symbols = [
  '🌸','🌻','🌹','🌺','🌷','💎','⭐','🌙','☀️','⚡',
  '🎵','🎀','🦋','🐱','🐶','🌈','❄️','🔥','🌊','🍀',
  '🎂','🎪','🎭','🎨','🎸','🏀','⚽','🎯','🍕','🚀',
  '👑','💎','🎭'
];

// nodos
const muteBtn = document.getElementById('muteBtn');
const startScreen = document.getElementById('startScreen');
const playBtn = document.getElementById('playBtn');
const transitionOverlay = document.getElementById('transitionOverlay');
const gameScreen = document.getElementById('gameScreen');
const board = document.getElementById('board');
const timerBar = document.getElementById('timerBar');
const currentPlayerName = document.getElementById('currentPlayerName');
const playerBg = document.getElementById('playerBg');
const victoryScreen = document.getElementById('victoryScreen');
const victoryContent = document.getElementById('victoryContent');
const victoryTitle = document.getElementById('victoryTitle');
const victorySubtitle = document.getElementById('victorySubtitle');
const replayBtn = document.getElementById('replayBtn');
const flowerContainer = document.getElementById('flowerContainer');
const halfLeft = document.getElementById('halfLeft');
const halfRight = document.getElementById('halfRight');

// playlist
const playlist = [
  { name: 'Headbangeeeeerrrrr!!!!', band: 'BABYMETAL', src: 'headbang.mp3' },
  { name: 'Made in Abyss OST', band: 'Kevin Penkin', src: 'madeinabyss.mp3' },
  { name: 'Song 3', band: 'Artist 3', src: 'song3.mp3' },
  { name: 'Song 4', band: 'Artist 4', src: 'song4.mp3' },
  { name: 'Song 5', band: 'Artist 5', src: 'song5.mp3' },
  { name: 'Song 6', band: 'Artist 6', src: 'song6.mp3' },
  { name: 'Song 7', band: 'Artist 7', src: 'song7.mp3' },
  { name: 'Song 8', band: 'Artist 8', src: 'song8.mp3' },
  { name: 'Song 9', band: 'Artist 9', src: 'song9.mp3' },
  { name: 'Song 10', band: 'Artist 10', src: 'song10.mp3' },
];

let playlistIndex = 0;
let playlistAudios = [];
let playlistPlaying = true;

playlist.forEach((track, i) => {
  const a = new Audio();
  a.src = track.src;
  a.loop = false;
  a.volume = 0.4;
  playlistAudios.push(a);
});

playlistAudios.forEach((a, i) => {
  a.addEventListener('ended', () => {
    if (playlistPlaying) nextTrackFn();
  });
});

function playPlaylistTrack(index) {
  playlistAudios.forEach(a => { a.pause(); a.currentTime = 0; });
  playlistIndex = index;
  const track = playlist[playlistIndex];
  const audio = playlistAudios[playlistIndex];
  audio.muted = musicMuted;
  audio.play().catch(()=>{});
  currentMusic = audio;
  updateMusicWidget(track.name, track.band);
}

function nextTrackFn() {
  playPlaylistTrack((playlistIndex + 1) % playlist.length);
}

function prevTrackFn() {
  playPlaylistTrack((playlistIndex - 1 + playlist.length) % playlist.length);
}

function stopPlaylist() {
  playlistAudios.forEach(a => { a.pause(); a.currentTime = 0; });
  playlistPlaying = false;
  document.getElementById('musicWidget').classList.remove('in-game');
}

// controles playlist
document.getElementById('nextTrack').addEventListener('click', nextTrackFn);
document.getElementById('prevTrack').addEventListener('click', prevTrackFn);

document.getElementById('playPauseTrack').addEventListener('click', () => {
  playlistPlaying = !playlistPlaying;
  const btn = document.getElementById('playPauseTrack');
  if (playlistPlaying) {
    btn.textContent = '⏸';
    if (currentMusic) currentMusic.play().catch(()=>{});
  } else {
    btn.textContent = '▶';
    if (currentMusic) currentMusic.pause();
  }
});

// inputs + focus
const nameRedInput = document.getElementById('nameRed');
const namePurpleInput = document.getElementById('namePurple');

nameRedInput.addEventListener('focus', () => {
  halfLeft.classList.remove('dimmed');
  halfLeft.classList.add('vivid');
  halfRight.classList.add('dimmed');
  halfRight.classList.remove('vivid');
  // rojo = track 1
  if (currentMusic !== playlistAudios[1]) {
    playlistAudios.forEach(a => { a.pause(); a.currentTime = 0; });
    playlistIndex = 1;
    const audio = playlistAudios[1];
    audio.muted = musicMuted;
    audio.play().catch(()=>{});
    currentMusic = audio;
    updateMusicWidget(playlist[1].name, playlist[1].band);
  }
});

nameRedInput.addEventListener('blur', () => {
  halfLeft.classList.remove('vivid');
  halfRight.classList.remove('dimmed');
});

namePurpleInput.addEventListener('focus', () => {
  halfRight.classList.remove('dimmed');
  halfRight.classList.add('vivid');
  halfLeft.classList.add('dimmed');
  halfLeft.classList.remove('vivid');
  // morado = track 0
  if (currentMusic !== playlistAudios[0]) {
    playlistAudios.forEach(a => { a.pause(); a.currentTime = 0; });
    playlistIndex = 0;
    const audio = playlistAudios[0];
    audio.muted = musicMuted;
    audio.play().catch(()=>{});
    currentMusic = audio;
    updateMusicWidget(playlist[0].name, playlist[0].band);
  }
});

namePurpleInput.addEventListener('blur', () => {
  halfRight.classList.remove('vivid');
  halfLeft.classList.remove('dimmed');
});

// enter = registrar
nameRedInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('btnRegRed').click();
});

namePurpleInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('btnRegPurple').click();
});

// volumen
const volSlider = document.getElementById('volSlider');
const volIcon = document.querySelector('.vol-icon');

volSlider.addEventListener('input', () => {
  const v = volSlider.value / 100;
  playlistAudios.forEach(a => { a.volume = v; });
  if (v === 0) {
    volIcon.textContent = '🔇';
    musicMuted = true;
  } else if (v < 0.5) {
    volIcon.textContent = '🔉';
    musicMuted = false;
  } else {
    volIcon.textContent = '🔊';
    musicMuted = false;
  }
  playlistAudios.forEach(a => { a.muted = false; });
});

muteBtn.addEventListener('click', (e) => {
  if (e.target === volSlider) return;
  musicMuted = !musicMuted;
  if (musicMuted) {
    volIcon.textContent = '🔇';
    playlistAudios.forEach(a => { a.muted = true; });
  } else {
    volIcon.textContent = '🔊';
    playlistAudios.forEach(a => { a.muted = false; });
  }
});

// widget musica
function updateMusicWidget(song, band) {
  document.getElementById('songName').textContent = song;
  document.getElementById('bandName').textContent = band;
  musicStartTime = Date.now();
  if (musicInterval) clearInterval(musicInterval);
  musicInterval = setInterval(() => {
    if (musicMuted || !currentMusic) return;
    const elapsed = Math.floor((Date.now() - musicStartTime) / 1000);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    document.getElementById('musicTime').textContent = `${m}:${s.toString().padStart(2,'0')}`;
  }, 1000);
}

function stopMusicWidget() {
  if (musicInterval) clearInterval(musicInterval);
  document.getElementById('songName').textContent = 'Sin musica';
  document.getElementById('bandName').textContent = '--';
  document.getElementById('musicTime').textContent = '0:00';
}

// registro jugadores
document.getElementById('btnRegRed').addEventListener('click', () => {
  const val = document.getElementById('nameRed').value.trim();
  if (val) {
    playerRed = val;
    redReady = true;
    document.getElementById('statusRed').textContent = `✓ ${val} listo`;
    document.getElementById('statusRed').className = 'player-status ready';
    if (!currentMusic) {
      playlistIndex = 1;
      const audio = playlistAudios[1];
      audio.muted = musicMuted;
      audio.play().catch(()=>{});
      currentMusic = audio;
      updateMusicWidget(playlist[1].name, playlist[1].band);
    }
    checkReady();
  }
});

document.getElementById('btnRegPurple').addEventListener('click', () => {
  const val = document.getElementById('namePurple').value.trim();
  if (val) {
    playerPurple = val;
    purpleReady = true;
    document.getElementById('statusPurple').textContent = `✓ ${val} listo`;
    document.getElementById('statusPurple').className = 'player-status ready';
    playlistAudios.forEach(a => { a.pause(); a.currentTime = 0; });
    playlistIndex = 0;
    const audio = playlistAudios[0];
    audio.muted = musicMuted;
    audio.play().catch(()=>{});
    currentMusic = audio;
    updateMusicWidget(playlist[0].name, playlist[0].band);
    checkReady();
  }
});

// click status = re-editar
document.getElementById('statusRed').addEventListener('click', () => {
  if (redReady) {
    redReady = false;
    document.getElementById('statusRed').textContent = '';
    document.getElementById('statusRed').className = 'player-status';
    document.getElementById('nameRed').value = playerRed;
    document.getElementById('nameRed').focus();
    updatePlayBtn();
  }
});

document.getElementById('statusPurple').addEventListener('click', () => {
  if (purpleReady) {
    purpleReady = false;
    document.getElementById('statusPurple').textContent = '';
    document.getElementById('statusPurple').className = 'player-status';
    document.getElementById('namePurple').value = playerPurple;
    document.getElementById('namePurple').focus();
    updatePlayBtn();
  }
});

nameRedInput.addEventListener('input', () => {
  if (redReady) {
    redReady = false;
    document.getElementById('statusRed').textContent = '';
    document.getElementById('statusRed').className = 'player-status';
    updatePlayBtn();
  }
});

namePurpleInput.addEventListener('input', () => {
  if (purpleReady) {
    purpleReady = false;
    document.getElementById('statusPurple').textContent = '';
    document.getElementById('statusPurple').className = 'player-status';
    updatePlayBtn();
  }
});

function updatePlayBtn() {
  playBtn.className = (redReady && purpleReady) ? 'active' : 'inactive';
}

function checkReady() { updatePlayBtn(); }

// jugar
playBtn.addEventListener('click', () => {
  if (!redReady || !purpleReady) return;
  startTransition();
});

// transicion diagonal
function startTransition() {
  const emojis = ['🎮','🎵','⭐','🃏','💡','🎯','🎲','💫'];
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('div');
    el.className = 'falling-element';
    el.textContent = emojis[i % emojis.length];
    el.style.left = Math.random() * 100 + '%';
    el.style.top = '-50px';
    el.style.animationDelay = (Math.random() * 0.5) + 's';
    el.style.animationDuration = (1.5 + Math.random()) + 's';
    transitionOverlay.appendChild(el);
  }

  transitionOverlay.style.display = 'block';
  const paper = transitionOverlay.querySelector('.paper');
  paper.classList.add('show');

  setTimeout(() => {
    startScreen.style.display = 'none';
    initGame();
    gameScreen.style.display = 'flex';
  }, 800);

  setTimeout(() => {
    paper.classList.remove('show');
    transitionOverlay.style.display = 'none';
    transitionOverlay.querySelectorAll('.falling-element').forEach(e => e.remove());
  }, 3200);
}

// init tablero
function initGame() {
  board.innerHTML = '';
  matchedPairs = 0;
  scoreRed = 0;
  scorePurple = 0;
  flippedCards = [];
  lockBoard = false;
  document.getElementById('scoreRed').textContent = '0';
  document.getElementById('scorePurple').textContent = '0';
  document.getElementById('labelRed').textContent = playerRed;
  document.getElementById('labelPurple').textContent = playerPurple;

  let cardSymbols = [];
  for (let i = 0; i < 33; i++) {
    cardSymbols.push(symbols[i], symbols[i]);
  }

  for (let i = cardSymbols.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardSymbols[i], cardSymbols[j]] = [cardSymbols[j], cardSymbols[i]];
  }

  totalPairs = 33;
  document.getElementById('musicWidget').classList.add('in-game');

  const rowLabels = document.getElementById('rowLabels');
  rowLabels.innerHTML = '';
  for (let r = 1; r <= 6; r++) {
    const num = document.createElement('span');
    num.textContent = r;
    rowLabels.appendChild(num);
  }

  const colLabels = document.getElementById('colLabels');
  colLabels.innerHTML = '';
  for (let c = 1; c <= 11; c++) {
    const span = document.createElement('span');
    span.textContent = c;
    colLabels.appendChild(span);
  }

  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 11; c++) {
      const idx = r * 11 + c;
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.symbol = cardSymbols[idx];
      card.dataset.row = r + 1;
      card.dataset.col = c + 1;
      card.innerHTML = `
        <div class="card-inner">
          <div class="card-front"></div>
          <div class="card-back">${cardSymbols[idx]}</div>
        </div>
      `;
      card.addEventListener('click', () => flipCard(card));
      board.appendChild(card);
    }
  }

  currentPlayer = 'red';
  updatePlayerDisplay();
  startTimer();
}

// voltear
function flipCard(card) {
  if (lockBoard) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  flippedCards.push(card);
  if (flippedCards.length === 2) {
    lockBoard = true;
    checkMatch();
  }
}

function checkMatch() {
  const [card1, card2] = flippedCards;
  const match = card1.dataset.symbol === card2.dataset.symbol;

  if (match) {
    card1.classList.add('matched');
    card2.classList.add('matched');
    matchedPairs++;
    if (currentPlayer === 'red') {
      scoreRed++;
      document.getElementById('scoreRed').textContent = scoreRed;
    } else {
      scorePurple++;
      document.getElementById('scorePurple').textContent = scorePurple;
    }
    flippedCards = [];
    lockBoard = false;
    if (matchedPairs >= totalPairs) endGame();
  } else {
    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      flippedCards = [];
      lockBoard = false;
      switchPlayer();
    }, 900);
  }
}

// timer barra
function startTimer() {
  timeLeft = TIMER_MAX;
  timerBar.style.width = '100%';
  if (timerInterval) clearInterval(timerInterval);
  const startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const pct = Math.max(0, ((TIMER_MAX - elapsed) / TIMER_MAX) * 100);
    timerBar.style.width = pct + '%';
    if (elapsed >= TIMER_MAX) {
      clearInterval(timerInterval);
      switchPlayer();
    }
  }, 50);
}

function resetTimer() {
  clearInterval(timerInterval);
  startTimer();
}

// turno
function switchPlayer() {
  currentPlayer = currentPlayer === 'red' ? 'purple' : 'red';
  updatePlayerDisplay();
  resetTimer();
}

function updatePlayerDisplay() {
  const name = currentPlayer === 'red' ? playerRed : playerPurple;
  currentPlayerName.textContent = `Turno de: ${name}`;
  if (currentPlayer === 'red') {
    playerBg.style.background = 'linear-gradient(135deg, #c0392b, #e74c3c)';
    currentPlayerName.style.color = '#e74c3c';
  } else {
    playerBg.style.background = 'linear-gradient(135deg, #7b2d8e, #9b59b6)';
    currentPlayerName.style.color = '#9b59b6';
  }
}

// fin
function endGame() {
  clearInterval(timerInterval);
  playlistAudios.forEach(a => { a.pause(); a.currentTime = 0; });
  document.getElementById('musicWidget').classList.remove('in-game');
  document.getElementById('playPauseTrack').textContent = '⏸';
  playlistPlaying = true;

  setTimeout(() => {
    gameScreen.style.display = 'none';
    const winner = scoreRed > scorePurple ? 'red' : scorePurple > scoreRed ? 'purple' : 'tie';

    if (winner === 'tie') {
      victoryScreen.style.display = 'block';
      victoryScreen.className = '';
      victoryScreen.style.background = 'linear-gradient(135deg, #2c3e50, #34495e)';
      victoryTitle.textContent = 'EMPATE!';
      victorySubtitle.textContent = '¡Ambos son geniales!';
    } else if (winner === 'red') {
      victoryScreen.style.display = 'block';
      victoryScreen.className = 'red-win';
      victoryTitle.textContent = `${playerRed} GANA!`;
      victorySubtitle.textContent = '¡El rojo domina la memoria!';
    } else {
      victoryScreen.style.display = 'block';
      victoryScreen.className = 'purple-win';
      victoryTitle.textContent = `${playerPurple} GANA!`;
      victorySubtitle.textContent = '¡La flor amarilla es para ti!';

      setTimeout(() => {
        victoryContent.classList.add('slide-down');
        showFlower();
      }, 10000);
    }
  }, 600);
}

// flor amarilla svg
function showFlower() {
  flowerContainer.innerHTML = `
    <svg width="399" height="399" viewBox="0 0 220 220">
      <line x1="110" y1="140" x2="110" y2="210" stroke="#27ae60" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="90" cy="180" rx="18" ry="10" fill="#27ae60" transform="rotate(-30 90 180)"/>
      <ellipse cx="130" cy="170" rx="16" ry="9" fill="#2ecc71" transform="rotate(25 130 170)"/>
      <g transform="translate(110,100)">
        <ellipse cx="0" cy="-40" rx="22" ry="38" fill="#f1c40f" opacity="0.95"/>
        <ellipse cx="38" cy="-12" rx="22" ry="38" fill="#f1c40f" opacity="0.95" transform="rotate(72)"/>
        <ellipse cx="24" cy="32" rx="22" ry="38" fill="#f1c40f" opacity="0.95" transform="rotate(144)"/>
        <ellipse cx="-24" cy="32" rx="22" ry="38" fill="#f1c40f" opacity="0.95" transform="rotate(216)"/>
        <ellipse cx="-38" cy="-12" rx="22" ry="38" fill="#f1c40f" opacity="0.95" transform="rotate(288)"/>
        <ellipse cx="0" cy="-28" rx="14" ry="26" fill="#f39c12" opacity="0.8"/>
        <ellipse cx="27" cy="-8" rx="14" ry="26" fill="#f39c12" opacity="0.8" transform="rotate(72)"/>
        <ellipse cx="17" cy="22" rx="14" ry="26" fill="#f39c12" opacity="0.8" transform="rotate(144)"/>
        <ellipse cx="-17" cy="22" rx="14" ry="26" fill="#f39c12" opacity="0.8" transform="rotate(216)"/>
        <ellipse cx="-27" cy="-8" rx="14" ry="26" fill="#f39c12" opacity="0.8" transform="rotate(288)"/>
        <circle cx="0" cy="0" r="18" fill="#8B4513"/>
        <circle cx="0" cy="0" r="12" fill="#A0522D"/>
        <circle cx="-4" cy="-4" r="3" fill="#8B4513" opacity="0.5"/>
        <circle cx="4" cy="3" r="2" fill="#8B4513" opacity="0.5"/>
        <circle cx="-2" cy="5" r="2.5" fill="#8B4513" opacity="0.5"/>
      </g>
    </svg>
  `;
  flowerContainer.classList.add('show');
  startBgFlowers();
  startFlowerParticles();
  setTimeout(startDroppingDrawings, 5000);
}

// dibujos apareciendo (flores primero, luego el resto)
function startDroppingDrawings() {
  const flowers = ['draw3.jpeg','draw8.jpeg','draw13.jpeg'];
  const unique = ['draw1.jpeg','draw2.jpeg','draw4.jpeg','draw5.jpeg','draw6.jpeg','draw7.jpeg','draw9.jpeg','draw10.jpeg','draw11.jpeg','draw12.jpeg'];
  const queue = [...flowers, ...flowers, ...flowers, ...unique];
  const placed = [];
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const cx = vw / 2;
  const cy = vh / 2;
  const safeR = 160;

  function tooClose(x, y, w, h) {
    if (Math.abs(x + w/2 - cx) < safeR && Math.abs(y + h/2 - cy) < safeR) return true;
    for (const p of placed) {
      if (x < p.x + p.w + 12 && x + w + 12 > p.x && y < p.y + p.h + 12 && y + h + 12 > p.y) return true;
    }
    return false;
  }

  function findPos(w, h) {
    for (let t = 0; t < 100; t++) {
      const x = 20 + Math.random() * (vw - w - 40);
      const y = 20 + Math.random() * (vh - h - 40);
      if (!tooClose(x, y, w, h)) return { x, y };
    }
    return { x: 20 + Math.random() * (vw - w - 40), y: 20 + Math.random() * (vh - h - 40) };
  }

  let i = 0;
  function appearNext() {
    if (i >= queue.length) return;
    const src = queue[i];
    const isFlower = flowers.some(f => src.includes(f));
    const img = document.createElement('img');
    img.className = 'falling-drawing';
    img.src = src;
    const w = isFlower ? (60 + Math.random() * 50) : (140 + Math.random() * 80);
    const h = w * (isFlower ? 0.9 : 0.75);
    const pos = findPos(w, h);
    img.style.left = pos.x + 'px';
    img.style.top = pos.y + 'px';
    img.style.width = w + 'px';
    img.style.opacity = '0';
    img.style.transition = 'opacity 1s ease';
    img.onerror = () => { img.style.display = 'none'; };
    document.body.appendChild(img);
    requestAnimationFrame(() => { img.style.opacity = '0.85'; });
    placed.push({ x: pos.x, y: pos.y, w, h });
    i++;
    setTimeout(appearNext, 700 + Math.random() * 500);
  }
  appearNext();
}

// flores fondo victoria
function startBgFlowers() {
  const container = document.getElementById('bgFlowers');
  container.innerHTML = '';
  let count = 0;
  const maxFlowers = 40;

  function addFlower() {
    if (count >= maxFlowers) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const size = 44 + Math.random() * 73;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const rot = Math.random() * 360;
    const type = Math.floor(Math.random() * 3);

    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 50 50');
    svg.classList.add('bg-flower');
    svg.style.left = x + '%';
    svg.style.top = y + '%';
    svg.style.transform = `rotate(${rot}deg)`;

    let petals = '';
    const colors = ['#f1c40f', '#f39c12', '#e6b800', '#ffdd57'];
    const c1 = colors[Math.floor(Math.random() * colors.length)];
    const c2 = colors[Math.floor(Math.random() * colors.length)];

    if (type === 0) {
      // 5 petalos
      for (let i = 0; i < 5; i++) {
        const a = (i * 72) * Math.PI / 180;
        const px = 25 + Math.cos(a) * 12;
        const py = 25 + Math.sin(a) * 12;
        petals += `<ellipse cx="${px}" cy="${py}" rx="8" ry="14" fill="${c1}" opacity="0.85" transform="rotate(${i*72} ${px} ${py})"/>`;
      }
      petals += `<circle cx="25" cy="25" r="6" fill="#8B4513"/>`;
    } else if (type === 1) {
      // 6 petalos
      for (let i = 0; i < 6; i++) {
        const a = (i * 60) * Math.PI / 180;
        const px = 25 + Math.cos(a) * 10;
        const py = 25 + Math.sin(a) * 10;
        petals += `<ellipse cx="${px}" cy="${py}" rx="6" ry="12" fill="${c2}" opacity="0.8" transform="rotate(${i*60} ${px} ${py})"/>`;
      }
      petals += `<circle cx="25" cy="25" r="5" fill="#A0522D"/>`;
    } else {
      // girasol
      for (let i = 0; i < 8; i++) {
        const a = (i * 45) * Math.PI / 180;
        const px = 25 + Math.cos(a) * 11;
        const py = 25 + Math.sin(a) * 11;
        petals += `<ellipse cx="${px}" cy="${py}" rx="5" ry="10" fill="${c1}" opacity="0.9" transform="rotate(${i*45} ${px} ${py})"/>`;
      }
      petals += `<circle cx="25" cy="25" r="8" fill="#5D4037"/>`;
      petals += `<circle cx="25" cy="25" r="5" fill="#6D4C41"/>`;
    }

    svg.innerHTML = petals;
    container.appendChild(svg);
    requestAnimationFrame(() => { svg.classList.add('show'); });
    count++;
    setTimeout(addFlower, 200 + Math.random() * 300);
  }
  addFlower();
}

function stopBgFlowers() {
  document.getElementById('bgFlowers').innerHTML = '';
}

// particulas flores (parpadeo)
function startFlowerParticles() {
  const container = document.getElementById('flowerParticles');
  container.innerHTML = '';
  const count = 25;

  for (let i = 0; i < count; i++) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const size = 17 + Math.random() * 29;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const rot = Math.random() * 360;
    const type = Math.floor(Math.random() * 3);
    const dur = 2 + Math.random() * 4;
    const delay = Math.random() * 5;

    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 50 50');
    svg.classList.add('flower-particle');
    svg.style.left = x + '%';
    svg.style.top = y + '%';
    svg.style.setProperty('--blink-dur', dur + 's');
    svg.style.setProperty('--blink-delay', delay + 's');
    svg.style.setProperty('--rot', rot + 'deg');

    const colors = ['#f1c40f', '#f39c12', '#ffdd57', '#e6b800'];
    const c = colors[Math.floor(Math.random() * colors.length)];
    let petals = '';

    if (type === 0) {
      for (let j = 0; j < 5; j++) {
        const a = (j * 72) * Math.PI / 180;
        const px = 25 + Math.cos(a) * 12;
        const py = 25 + Math.sin(a) * 12;
        petals += `<ellipse cx="${px}" cy="${py}" rx="7" ry="13" fill="${c}" opacity="0.8" transform="rotate(${j*72} ${px} ${py})"/>`;
      }
      petals += `<circle cx="25" cy="25" r="5" fill="#8B4513"/>`;
    } else if (type === 1) {
      for (let j = 0; j < 6; j++) {
        const a = (j * 60) * Math.PI / 180;
        const px = 25 + Math.cos(a) * 10;
        const py = 25 + Math.sin(a) * 10;
        petals += `<ellipse cx="${px}" cy="${py}" rx="5" ry="11" fill="${c}" opacity="0.75" transform="rotate(${j*60} ${px} ${py})"/>`;
      }
      petals += `<circle cx="25" cy="25" r="4" fill="#A0522D"/>`;
    } else {
      for (let j = 0; j < 8; j++) {
        const a = (j * 45) * Math.PI / 180;
        const px = 25 + Math.cos(a) * 10;
        const py = 25 + Math.sin(a) * 10;
        petals += `<ellipse cx="${px}" cy="${py}" rx="4" ry="9" fill="${c}" opacity="0.85" transform="rotate(${j*45} ${px} ${py})"/>`;
      }
      petals += `<circle cx="25" cy="25" r="6" fill="#5D4037"/>`;
    }

    svg.innerHTML = petals;
    container.appendChild(svg);
  }
}

function stopFlowerParticles() {
  document.getElementById('flowerParticles').innerHTML = '';
}

// skip test
document.getElementById('skipBtn').addEventListener('click', () => {
  clearInterval(timerInterval);
  stopFlowerParticles();
  stopBgFlowers();
  document.querySelectorAll('.falling-drawing').forEach(e => e.remove());
  scoreRed = 2;
  scorePurple = 30;
  document.getElementById('scoreRed').textContent = scoreRed;
  document.getElementById('scorePurple').textContent = scorePurple;
  endGame();
});

// re-jugar (deshabilitado)
replayBtn.addEventListener('click', () => {});

document.getElementById('albumCover').innerHTML = '🎵';
