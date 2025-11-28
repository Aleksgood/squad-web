// ui.js - modal & toast helpers, accessibility focus management
export function showToast(message, timeout = 3000) {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div'); el.className='toast'; el.textContent=message; container.appendChild(el);
  setTimeout(()=>{ el.remove(); }, timeout);
}

export function confirmModal({ title='Підтвердження', message='Ви впевнені?', confirmText='OK', cancelText='Скасувати' }) {
  return new Promise(resolve => {
    const wrap = ensureModalContainer();
    const modal = document.createElement('div'); modal.className='modal';
    modal.innerHTML = `<h5>${title}</h5><p>${message}</p><div class='grid'><button id='mConfirm' class='primary'>${confirmText}</button><button id='mCancel' class='secondary'>${cancelText}</button></div>`;
    wrap.appendChild(modal); wrap.hidden=false; modal.querySelector('#mConfirm').focus();
    modal.querySelector('#mConfirm').onclick = () => close(true);
    modal.querySelector('#mCancel').onclick = () => close(false);
    function close(val){ wrap.hidden=true; modal.remove(); resolve(val); }
  });
}

export function modalForm({ title='Форма', fields=[], submitText='Зберегти', cancelText='Скасувати' }) {
  return new Promise(resolve => {
    const wrap = ensureModalContainer();
    const formId = 'modalForm_' + crypto.randomUUID();
    const modal = document.createElement('div'); modal.className='modal';
    const fieldsHtml = fields.map(f => renderField(f)).join('');
    modal.innerHTML = `<h5>${title}</h5><form id='${formId}' class='grid'>${fieldsHtml}<div class='grid span-full'><button type='submit' class='primary'>${submitText}</button><button type='button' id='mCancel' class='secondary'>${cancelText}</button></div></form>`;
    wrap.appendChild(modal); wrap.hidden=false;
    const form = modal.querySelector('form');
    form.onsubmit = e => { e.preventDefault(); const vals = collectValues(fields, form); close(vals); };
    modal.querySelector('#mCancel').onclick = () => close(null);
    modal.querySelector('input,select,textarea')?.focus();
    function close(val){ wrap.hidden=true; modal.remove(); resolve(val); }
  });
}

function renderField(f) {
  const common = `name='${f.name}' ${f.required?'required':''}`;
  if (f.type === 'select') {
    const opts = (f.options||[]).map((o, i) => {
      const label = f.optionLabels ? f.optionLabels[i] : o;
      return `<option value='${o}' ${f.value===o?'selected':''}>${label}</option>`;
    }).join('');
    return `<label>${f.label}<select ${common}>${opts}</select></label>`;
  }
  if (f.type === 'textarea') {
    return `<label>${f.label}<textarea ${common}>${f.value||''}</textarea></label>`;
  }
  return `<label>${f.label}<input type='${f.type||'text'}' value='${f.value||''}' ${common} ${f.min!==undefined?`min='${f.min}'`:''} ${f.max!==undefined?`max='${f.max}'`:''}></label>`;
}

function collectValues(fields, form) {
  const out={}; fields.forEach(f=>{ out[f.name] = form.querySelector(`[name='${f.name}']`).value; }); return out;
}

function ensureModalContainer(){ return document.getElementById('modalContainer'); }
