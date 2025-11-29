// teams.js - manage teams & players
import { getState, saveState } from './storage.js';
import { showToast, modalForm } from './ui.js';

export function initTeams() {
  if (!getState().teams) getState().teams = [];
  if (!getState().players) getState().players = [];
}

export function renderTeams() {
  const container = document.getElementById('teamsSection');
  container.innerHTML = '';
  getState().teams.forEach(team => {
    const card = document.createElement('div');
    card.className = 'team-card';
    card.innerHTML = `<div class="team-header"><strong>${team.name}</strong><div class="actions"><button data-edit>Edit</button><button data-del>✕</button></div></div>`;
    const list = document.createElement('ul'); list.className = 'players-list';
    team.players.forEach(pid => {
      const p = getState().players.find(pl => pl.id === pid);
      if (!p) return;
      const li = document.createElement('li');
      li.className = 'player-row';
      li.tabIndex = 0;
      li.innerHTML = `<span class="player-name">${p.name}</span><span class="player-role">${p.role || ''}</span>`;
      li.addEventListener('click', () => selectPlayer(p));
      list.appendChild(li);
    });
    const addBtn = document.createElement('button'); addBtn.textContent = 'Add +'; addBtn.type='button'; addBtn.addEventListener('click', () => addPlayerPrompt(team.id));
    card.appendChild(list); card.appendChild(addBtn);
    card.querySelector('[data-edit]').addEventListener('click', () => editTeamPrompt(team));
    card.querySelector('[data-del]').addEventListener('click', () => deleteTeam(team.id));
    container.appendChild(card);
  });
}

window.createTeamPrompt = function() {
  modalForm({ title: 'Нова команда', fields:[{ name:'name', label:'Назва команди', type:'text', required:true }], submitText:'Створити' })
    .then(vals => { if(!vals) return; const t={ id: crypto.randomUUID(), name: vals.name, players: [] }; getState().teams.push(t); saveState(); renderTeams(); showToast('Команду створено'); });
};

function editTeamPrompt(team) {
  modalForm({ title:'Редагувати команду', fields:[{ name:'name', label:'Назва', type:'text', required:true, value: team.name }], submitText:'Зберегти' })
    .then(v=>{ if(!v) return; team.name=v.name; saveState(); renderTeams(); showToast('Оновлено'); });
}
function deleteTeam(id) {
  if (!confirm('Видалити команду?')) return;
  const s=getState(); s.teams = s.teams.filter(t=>t.id!==id); saveState(); renderTeams(); showToast('Команду видалено');
}

function addPlayerPrompt(teamId) {
  const assignedIds = new Set();
  getState().teams.forEach(t => t.players.forEach(pid => assignedIds.add(pid)));
  const available = getState().players.filter(p => !assignedIds.has(p.id));
  
  if (available.length === 0) {
    showToast('Немає доступних гравців. Додайте їх у players.csv');
    return;
  }
  
  modalForm({ 
    title:'Додати гравця', 
    fields:[
      { name:'playerId', label:'Гравець', type:'select', options: available.map(p => p.id), optionLabels: available.map(p => p.name), required: true }
    ], 
    submitText:'Додати' 
  }).then(vals => {
    if(!vals) return;
    const team = getState().teams.find(t => t.id === teamId);
    team.players.push(vals.playerId);
    saveState();
    renderTeams();
    showToast('Гравця додано');
  });
}

function addPlayerPrompt(p) {
  const team = getState().teams.find(t => t.id === p);
  if (!team) return;
  const panel = document.getElementById('playerDetailPanel'); 
  panel.hidden = false; 
  const form = document.getElementById('playerDetailForm');
  form.name.value = p.name; 
  form.role.value = p.role; 
  form.flank.value = p.flank; 
  form.shootingLevel.value = p.shootingLevel;
  form.onsubmit = e => { 
    e.preventDefault(); 
    p.name = form.name.value; 
    p.role = form.role.value; 
    p.flank = form.flank.value; 
    p.shootingLevel = Number(form.shootingLevel.value || 0); 
    saveState(); 
    renderTeams(); 
    showToast('Гравця оновлено'); 
  };
  document.getElementById('btnDeletePlayer').onclick = () => removePlayerFromTeam(p.id);
}

function removePlayerFromTeam(pid) {
  if(!confirm('Видалити гравця з команди?')) return;
  const s = getState(); 
  s.teams.forEach(t => { t.players = t.players.filter(id => id !== pid); }); 
  saveState(); 
  renderTeams(); 
  showToast('Гравця видалено з команди'); 
  document.getElementById('playerDetailPanel').hidden = true;
}
