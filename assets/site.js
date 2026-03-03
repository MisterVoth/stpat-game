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
      td.addEventListener('click', ()=>td.classList.toggle('selected'));
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
   Usage in HTML:
   <div class="word-row" data-word="GREEN" data-shuffle></div>
-------------------------------- */
function shuffledLetters(word){
  // Make sure we don't accidentally return the original word unchanged.
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
  setupWordRows(); // <-- NEW (Word Dash token shuffle)
});
