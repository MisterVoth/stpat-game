function setupTabs(){
  document.querySelectorAll('[data-tabs]').forEach((wrap)=>{
    const buttons = wrap.querySelectorAll('.tabbtn');
    const levels = wrap.querySelectorAll('.level');

    function activate(idx){
      buttons.forEach((b,i)=>b.classList.toggle('active', i===idx));
      levels.forEach((l,i)=>l.classList.toggle('active', i===idx));
    }

    buttons.forEach((b,i)=>b.addEventListener('click', ()=>activate(i)));
    activate(0);
  });
}

function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* -------------------------------
   Lucky Links (4x4 word grid)
-------------------------------- */

// null = white (unassigned), then cycles through 0–3
const GROUP_COLORS = [
  { bg: 'rgba(27,122,82,.22)',   border: '#1b7a52' },  // group 1 - medium green
  { bg: 'rgba(90,170,80,.28)',   border: '#4caf50' },  // group 2 - lighter green
  { bg: 'rgba(10,80,50,.30)',    border: '#0a5032' },  // group 3 - dark forest green
  { bg: 'rgba(180,215,100,.40)', border: '#8aab00' },  // group 4 - yellow-green
];

function applyGroupStyle(td, groupIndex){
  if(groupIndex === null){
    td.style.background = '';
    td.style.borderColor = '';
    td.classList.remove('selected');
  } else {
    const c = GROUP_COLORS[groupIndex];
    td.style.background = c.bg;
    td.style.borderColor = c.border;
    td.classList.add('selected');
  }
}

function buildGrid(el){
  const words = el.dataset.words.split(',').map(w => w.trim());
  shuffle(words);

  const table = document.createElement('table');
  const tbody = document.createElement('tbody');

  for(let r=0;r<4;r++){
    const tr = document.createElement('tr');
    for(let c=0;c<4;c++){
      const td = document.createElement('td');
      td.textContent = words[r*4+c];
      td._groupIndex = null; // tracks this tile's current state

      td.addEventListener('click', ()=>{
        // Cycle: null -> 0 -> 1 -> 2 -> 3 -> null -> ...
        if(td._groupIndex === null){
          td._groupIndex = 0;
        } else if(td._groupIndex < 3){
          td._groupIndex++;
        } else {
          td._groupIndex = null;
        }
        applyGroupStyle(td, td._groupIndex);
      });

      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  el.innerHTML='';
  el.appendChild(table);
}

function setupWordGrids(){
  document.querySelectorAll('.wordgrid').forEach(grid=>{
    buildGrid(grid);

    const container = grid.closest('.level');
    const shuffleBtn = container.querySelector('.shuffle-btn');
    const answerBtn = container.querySelector('.answer-btn');
    const answerOverlay = container.querySelector('.answer-overlay');

    if(shuffleBtn){
      shuffleBtn.addEventListener('click', ()=>{
        grid.classList.add('fade');
        setTimeout(()=>{
          buildGrid(grid);
          grid.classList.remove('fade');
        },200);
      });
    }

    if(answerBtn){
      answerBtn.addEventListener('click', ()=>{
        if(answerOverlay.classList.contains('visible')){
          answerOverlay.classList.remove('visible');
          answerOverlay.innerHTML='';
        } else {
          answerOverlay.innerHTML = formatAnswers(grid.dataset.answers);
          answerOverlay.classList.add('visible');
        }
      });
    }
  });
}

function formatAnswers(answerString){
  if(!answerString) return '';
  const groups = answerString.split(';');
  let html='<strong>Answer Key:</strong><ul>';
  groups.forEach(g=>{
    html += `<li>${g.replaceAll('|', ', ')}</li>`;
  });
  html+='</ul>';
  return html;
}

/* -------------------------------
   Word Dash (letter token rows)
-------------------------------- */
function shuffledLetters(word){
  const original = word.split('');
  let attempt = original.slice();
  let tries = 0;
  do {
    attempt = shuffle(original.slice());
    tries++;
  } while (attempt.join('') === word && tries < 10);
  return attempt;
}

function renderWordRow(rowEl, letters){
  rowEl.innerHTML = '';
  letters.forEach(ch => {
    const token = document.createElement('div');
    token.className = 'letter';
    token.textContent = ch;
    rowEl.appendChild(token);
  });
}

function setupWordRows(){
  document.querySelectorAll('.word-row[data-word][data-shuffle]').forEach(row=>{
    const word = (row.dataset.word || '').trim().toUpperCase();
    if(!word) return;
    const letters = shuffledLetters(word);
    renderWordRow(row, letters);
  });
}

window.addEventListener('DOMContentLoaded', ()=>{
  setupTabs();
  setupWordGrids();
  setupWordRows();
});
