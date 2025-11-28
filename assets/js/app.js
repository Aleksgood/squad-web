// app.js - entry point: init storage, load players, setup UI
import { initStorage, loadPersistedState, getState, saveState } from './storage.js';
import { initTeams, renderTeams } from './teams.js';
import { showToast } from './ui.js';

async function init() {
  initStorage();
  loadPersistedState();
  await loadPlayersFromProject();
  initTeams();
  wireEvents();
  renderTeams();
}

async function loadPlayersFromProject() {
  // Load players.csv from project
  try {
    const state = getState();
    // 💡 Додаємо перевірку: завантажуємо гравців, лише якщо список гравців у стані порожній.
    if (state.players && state.players.length > 0) {
      return;
    }
    const res = await fetch('data/players/players.csv');
    if (!res.ok) return;
    const text = await res.text();
    const players = parseCsv(text);
    const state = getState();
    // Add players to state
    players.forEach(p => {
      const player = {
        id: crypto.randomUUID(),
        name: p.name,
        role: p.role,
        flank: p.flank,
        shootingLevel: p.shootingLevel
      };
      state.players.push(player);
    });
  } catch (e) {
    console.warn('Не вдалося завантажити players.csv', e);
  }
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines.shift().split(',');
  const idx = name => header.indexOf(name);
  return lines.map(line => {
    const cols = line.split(',');
    return {
      name: cols[idx('Name')] || '',
      role: cols[idx('Role')] || '',
      flank: cols[idx('Flank')] || '',
      shootingLevel: Number(cols[idx('ShootingLevel')] || 0)
    };
  });
}

function wireEvents() {
  document.getElementById('btnAddTeam').addEventListener('click', () => window.createTeamPrompt());
}

// Expose to global for modules that might call refresh
window.refreshTeams = renderTeams;

// Wait for DOM to load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
