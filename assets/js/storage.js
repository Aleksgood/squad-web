// storage.js - localStorage persistence
const KEY = 'squad_planner_state_v1';
let state = { 
  teams: [], 
  players: []
};

export function initStorage() { /* reserved for future migrations */ }
export function getState() { return state; }
export function saveState() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('Cannot persist state', e); }
}
export function loadPersistedState() {
  try { 
    const raw = localStorage.getItem(KEY); 
    if (raw) { 
      const parsed = JSON.parse(raw); 
      state = { ...state, ...parsed }; 
    } 
  } catch {}
}

window.addEventListener('beforeunload', () => saveState());
