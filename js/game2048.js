const cols = 4;
const maxHeight = 7;
const colors = { 2:'#f7d774', 4:'#f39a78', 8:'#8b8cf6', 16:'#5ab7e8', 32:'#42d3ae', 64:'#f36a91', 128:'#ffb74d', 256:'#ff8a65', 512:'#e879f9', 1024:'#ff5d78', 2048:'#ffd54f' };
let columns, score, bestScore = Number(localStorage.getItem('drop2048Best') || 0), currentCol, currentValue;
let history = [], started = false, won = false, gameOver = false, mergedCells = new Set(), touchStart = null, isDropping = false;

const board = document.getElementById('game-board');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best-score');
const undoBtn = document.getElementById('undo-btn');

function randomValue() { return Math.random() < .88 ? 2 : 4; }
function newFallingTile() { currentCol = Math.floor(cols / 2); currentValue = randomValue(); }
function beginState() { columns = Array.from({length:cols}, () => []); score = 0; history = []; won = false; gameOver = false; newFallingTile(); render(); }
function saveHistory() { history.push({ columns: columns.map(column => [...column]), score, currentCol, currentValue, won }); if (history.length > 30) history.shift(); }
function render() {
  board.innerHTML = ''; mergedCells = mergedCells || new Set();
  for (let row=maxHeight-1; row>=0; row--) for (let c=0; c<cols; c++) addCell(columns[c][row], mergedCells.has(`${c}-${row}`) ? 'just-merged' : '', c, row);
  if (!isDropping && !gameOver) addFallingTile();
  scoreEl.textContent = score; bestEl.textContent = bestScore; undoBtn.disabled = !history.length || gameOver;
}
function addCell(value, extra='', col, row) { const cell=document.createElement('div'); cell.className=`tile ${extra}`; cell.dataset.col=col; cell.dataset.row=row; if(value){ cell.textContent=value; cell.style.backgroundColor=colors[value] || '#fff'; } board.appendChild(cell); }
function addFallingTile() { const start=board.querySelector(`[data-col="${currentCol}"][data-row="${maxHeight-1}"]`); if(!start)return; const tile=document.createElement('div'); tile.className='falling-tile'; tile.id='falling-tile'; tile.textContent=currentValue; tile.style.backgroundColor=colors[currentValue]; tile.style.left=`${start.offsetLeft}px`; tile.style.top=`${start.offsetTop}px`; tile.style.width=`${start.clientWidth}px`; tile.style.height=`${start.clientHeight}px`; tile.setAttribute('aria-label', `Falling ${currentValue}`); board.appendChild(tile); }
function beep(type='drop') { try { const ctx=new (window.AudioContext||window.webkitAudioContext)(); const o=ctx.createOscillator(), gain=ctx.createGain(); o.type='sine'; o.frequency.value=type==='merge'?560:type==='win'?760:270; gain.gain.setValueAtTime(.035,ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.12); o.connect(gain).connect(ctx.destination); o.start(); o.stop(ctx.currentTime+(type==='win'?.28:.12)); } catch (_) {} }
function showStatus(type) { const modal=document.getElementById('status-modal'); const win=type==='win'; document.getElementById('status-icon').textContent=win?'🏆':'💥'; document.getElementById('status-title').textContent=win?'2048 achieved!':'Game over'; document.getElementById('status-message').textContent=win?'Amazing! You can keep playing for an even higher score.':`Final score: ${score}. Try another strategy!`; document.getElementById('modal-secondary').hidden=!win; modal.hidden=false; }
function isBoardFull() { return columns.every(column => column.length >= maxHeight); }
function dropTile() {
  if (!started || gameOver || isDropping) return;
  const column=columns[currentCol];
  if(column.length>=maxHeight){ board.classList.remove('board-shake'); void board.offsetWidth; board.classList.add('board-shake'); beep(); if(isBoardFull()){ gameOver=true; render(); showStatus('over'); } return; }
  const fallingTile=document.getElementById('falling-tile');
  const landingCell=board.querySelector(`[data-col="${currentCol}"][data-row="${maxHeight-column.length-1}"]`);
  if (!fallingTile || !landingCell) return commitDrop();
  isDropping=true;
  const dx=landingCell.offsetLeft-fallingTile.offsetLeft, dy=landingCell.offsetTop-fallingTile.offsetTop;
  requestAnimationFrame(()=>{ fallingTile.style.transform=`translate(${dx}px, ${dy}px)`; });
  setTimeout(()=>{ isDropping=false; commitDrop(); }, 430);
}
function commitDrop() {
  const column=columns[currentCol];
  saveHistory(); column.push(currentValue); mergedCells = new Set(); let didMerge=false;
  while(column.length>=2 && column.at(-1)===column.at(-2)) { const merged=column.at(-1)*2; column.pop(); column.pop(); column.push(merged); score+=merged; bestScore=Math.max(bestScore,score); localStorage.setItem('drop2048Best',bestScore); mergedCells.add(`${currentCol}-${column.length-1}`); didMerge=true; if(merged>=2048 && !won){ won=true; setTimeout(()=>showStatus('win'),240); beep('win'); } }
  beep(didMerge?'merge':'drop'); newFallingTile(); render();
  if(isBoardFull() && !won){ gameOver=true; render(); setTimeout(()=>showStatus('over'),250); }
}
function moveColumn(delta) { if(!started || gameOver) return; currentCol=(currentCol+delta+cols)%cols; render(); }
function undo() { if(!history.length || gameOver) return; const last=history.pop(); columns=last.columns; score=last.score; currentCol=last.currentCol; currentValue=last.currentValue; won=last.won; mergedCells=new Set(); render(); }
function restart() { beginState(); started=true; document.getElementById('start-modal').hidden=true; document.getElementById('status-modal').hidden=true; }

document.addEventListener('keydown', e => { if(['ArrowLeft','ArrowRight','ArrowDown',' '].includes(e.key)) e.preventDefault(); if(e.key==='ArrowLeft') moveColumn(-1); if(e.key==='ArrowRight') moveColumn(1); if(e.key==='ArrowDown'||e.key===' ') dropTile(); });
board.addEventListener('touchstart', e => { touchStart={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY}; }, {passive:true});
board.addEventListener('touchend', e => { if(!touchStart)return; const end=e.changedTouches[0], dx=end.clientX-touchStart.x, dy=end.clientY-touchStart.y; touchStart=null; if(Math.max(Math.abs(dx),Math.abs(dy))<18){ dropTile(); return; } if(Math.abs(dx)>Math.abs(dy)) moveColumn(dx>0?1:-1); else if(dy>0) dropTile(); }, {passive:true});
document.getElementById('drop-btn').addEventListener('click',dropTile); document.getElementById('undo-btn').addEventListener('click',undo); document.getElementById('restart-btn').addEventListener('click',restart); document.getElementById('start-btn').addEventListener('click',restart); document.getElementById('modal-restart').addEventListener('click',restart); document.getElementById('modal-secondary').addEventListener('click',()=>{ document.getElementById('status-modal').hidden=true; render(); });
beginState();
