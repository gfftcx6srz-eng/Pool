// ===========================================
// Projektlernen Module
// ===========================================

const Projektlernen = {
  // State
  state: {
    currentPhase: 'start',
    projektIdee: '',
    projektziel: '',
    zielgruppe: '',
    arbeitsschritte: '',
    ressourcen: '',
    zeitplan: '',
    partner: '',
    reflexion: '',
    anfGesellschaft: '',
    anfLebenswelt: '',
    anfGanzheitlich: '',
    anfProdukt: '',
    anfKommunikation: '',
    anfKann: '',
    checklists: {
      start: [],
      planung: [],
      anforderungen: {},
      durchfuehrung: [],
      praesentation: []
    },
    formatOptions: [],
    weeks: [],
    lastSaved: null
  },
  
  storageKey: 'pool-projektlernen-v2',
  
  phasen: [
    { id: 'start', titel: 'Projektfindung', emoji: '💡', farbe: 'violet' },
    { id: 'planung', titel: 'Planung', emoji: '🎯', farbe: 'emerald' },
    { id: 'anforderungen', titel: 'Anforderungen', emoji: '⭐', farbe: 'rose' },
    { id: 'durchfuehrung', titel: 'Durchführung', emoji: '👥', farbe: 'fuchsia' },
    { id: 'praesentation', titel: 'Präsentation', emoji: '🎤', farbe: 'amber' }
  ],
  
  load() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed };
      } catch (e) {
        console.error('Fehler beim Laden:', e);
      }
    }
  },
  
  save() {
    this.state.lastSaved = new Date().toISOString();
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    Utils.showSaveIndicator();
  },
  
  setPhase(phase) {
    this.state.currentPhase = phase;
    this.render();
  },
  
  updateField(field, value) {
    this.state[field] = value;
    this.save();
  },
  
  toggleChecklist(phase, index, subIndex = null) {
    if (phase === 'anforderungen' && subIndex !== null) {
      if (!this.state.checklists.anforderungen[`anf${index}`]) {
        this.state.checklists.anforderungen[`anf${index}`] = [];
      }
      this.state.checklists.anforderungen[`anf${index}`][subIndex] = 
        !this.state.checklists.anforderungen[`anf${index}`][subIndex];
    } else {
      if (!Array.isArray(this.state.checklists[phase])) {
        this.state.checklists[phase] = [];
      }
      this.state.checklists[phase][index] = !this.state.checklists[phase][index];
    }
    this.save();
    this.render();
  },
  
  toggleFormatOption(index) {
    this.state.formatOptions[index] = !this.state.formatOptions[index];
    this.save();
    this.render();
  },
  
  addWeek() {
    this.state.weeks.push({ aktivitaet: '', reflexion: '' });
    this.save();
    this.render();
  },
  
  updateWeek(index, field, value) {
    this.state.weeks[index][field] = value;
    this.save();
  },
  
  reset() {
    if (confirm('Möchtest du wirklich alle Daten zurücksetzen?')) {
      localStorage.removeItem(this.storageKey);
      location.reload();
    }
  },
  
  exportData() {
    Utils.exportJSON(this.state, `projektlernen-export-${new Date().toISOString().split('T')[0]}.json`);
    Utils.showToast('Export erfolgreich', 'success');
  },
  
  importData() {
    Utils.importJSON((data) => {
      this.state = { ...this.state, ...data };
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      this.render();
      Utils.showToast('Import erfolgreich', 'success');
    });
  },
  
  render() {
    const container = document.getElementById('projektlernen-content');
    if (!container) return;
    
    container.innerHTML = `
      <div class="phase-nav slide-up">
        ${this.phasen.map(p => `
          <button class="phase-btn ${this.state.currentPhase === p.id ? 'active' : ''}" 
                  onclick="Projektlernen.setPhase('${p.id}')">
            <div class="phase-icon-circle">${p.emoji}</div>
            <p>${p.titel}</p>
          </button>
        `).join('')}
      </div>
      
      <div class="card slide-up stagger-1" style="margin-bottom: var(--space-lg);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md);">
          <div style="display: flex; align-items: center; gap: var(--space-sm);">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: var(--accent-emerald);"></span>
            <span style="color: var(--text-secondary); font-size: 0.875rem;">
              ${this.state.lastSaved ? `Zuletzt: ${Utils.formatDate(this.state.lastSaved)}` : 'Noch nicht gespeichert'}
            </span>
          </div>
          <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" onclick="Projektlernen.exportData()">💾 JSON</button>
            <button class="btn btn-secondary btn-sm" onclick="Projektlernen.importData()">📤 Import</button>
            <button class="btn btn-danger btn-sm" onclick="Projektlernen.reset()">🔄 Reset</button>
          </div>
        </div>
      </div>
      
      <div class="slide-up stagger-2">
        ${this.renderPhaseContent()}
      </div>
    `;
    
    this.attachInputListeners();
  },
  
  attachInputListeners() {
    const debouncedSave = Utils.debounce(() => this.save(), 500);
    document.querySelectorAll('#projektlernen-content textarea, #projektlernen-content input[type="text"]').forEach(el => {
      el.addEventListener('input', (e) => {
        const field = e.target.dataset.field;
        if (field) {
          this.state[field] = e.target.value;
          debouncedSave();
        }
        const weekIndex = e.target.dataset.weekindex;
        const weekField = e.target.dataset.weekfield;
        if (weekIndex !== undefined && weekField) {
          this.state.weeks[parseInt(weekIndex)][weekField] = e.target.value;
          debouncedSave();
        }
      });
    });
  },
  
  renderPhaseContent() {
    switch (this.state.currentPhase) {
      case 'start': return this.renderPhaseStart();
      case 'planung': return this.renderPhasePlanung();
      case 'anforderungen': return this.renderPhaseAnforderungen();
      case 'durchfuehrung': return this.renderPhaseDurchfuehrung();
      case 'praesentation': return this.renderPhasePraesentation();
      default: return '';
    }
  },
  
  renderPhaseStart() {
    const ideen = [
      { titel: '🌍 Gesellschaftsbezug', items: ['Dialekte dokumentieren', 'Mehrsprachigkeit erforschen', 'Leichte Sprache für lokale Infos'] },
      { titel: '🎨 Kreativ & Produktiv', items: ['Podcast über Sprachwandel', 'Poetry Slam organisieren', 'Comic in verschiedenen Sprachen'] },
      { titel: '🔬 Forschend', items: ['Social Media & Sprache', 'Sprachbiografien sammeln', 'Werbung analysieren'] }
    ];
    const hilfsfragen = [
      'Was interessiert mich persönlich am Thema Sprache?',
      'Welches Problem möchte ich untersuchen?',
      'Für wen könnte mein Projekt nützlich sein?',
      'Welches Produkt könnte entstehen?'
    ];
    
    return `
      <div class="card">
        <div class="card-header">
          <div class="card-icon violet">💡</div>
          <div><h2 class="card-title">Phase 1: Projektfindung</h2></div>
        </div>
        <div class="info-box violet">
          <p><strong>Prinzip:</strong> Gesellschaftsbezug & Lebenspraxisbezug – Finde ein Thema, das dich interessiert UND für andere relevant ist!</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-xl);">
          ${ideen.map(k => `
            <div style="background: rgba(139, 92, 246, 0.1); padding: var(--space-md); border-radius: var(--radius-md);">
              <h4 style="color: var(--accent-violet); margin-bottom: var(--space-sm); font-size: 0.9rem;">${k.titel}</h4>
              <ul style="list-style: none; font-size: 0.85rem; color: var(--text-secondary);">
                ${k.items.map(i => `<li style="padding: 2px 0;">• ${i}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
        <div class="form-group">
          <label class="form-label">📝 Meine Projektidee</label>
          <textarea class="form-textarea" data-field="projektIdee" placeholder="Beschreibe hier deine Projektidee...">${this.state.projektIdee}</textarea>
        </div>
        <h3 style="margin-bottom: var(--space-md);">❓ Hilfsfragen</h3>
        <div class="checklist">
          ${hilfsfragen.map((f, i) => `
            <div class="checklist-item ${this.state.checklists.start?.[i] ? 'checked' : ''}" onclick="Projektlernen.toggleChecklist('start', ${i})">
              <div class="check-circle">✓</div>
              <span class="checklist-text">${f}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },
  
  renderPhasePlanung() {
    const checklistItems = [
      'Projektziel formuliert',
      'Arbeitsschritte überlegt',
      'Ressourcen geplant',
      'Zeitplan erstellt',
      'Partner identifiziert'
    ];
    
    return `
      <div class="card">
        <div class="card-header">
          <div class="card-icon emerald">🎯</div>
          <div><h2 class="card-title">Phase 2: Planung</h2></div>
        </div>
        <div class="info-box emerald">
          <p><strong>Prinzip:</strong> Selbstbestimmtes Lernen – Du entscheidest über Ziele, Methoden und Zeitplan!</p>
        </div>
        <div class="form-group">
          <label class="form-label">🎯 Mein Projektziel</label>
          <textarea class="form-textarea" data-field="projektziel" placeholder="Was möchte ich erreichen?">${this.state.projektziel}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">👥 Zielgruppe</label>
          <textarea class="form-textarea" data-field="zielgruppe" placeholder="Für wen ist mein Projekt?">${this.state.zielgruppe}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">📋 Arbeitsschritte</label>
          <textarea class="form-textarea" data-field="arbeitsschritte" placeholder="1. ...&#10;2. ...&#10;3. ..." style="min-height: 150px;">${this.state.arbeitsschritte}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">🧰 Ressourcen</label>
          <textarea class="form-textarea" data-field="ressourcen" placeholder="Materialien, Technik, Personen...">${this.state.ressourcen}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">📅 Zeitplan</label>
          <textarea class="form-textarea" data-field="zeitplan" placeholder="Woche 1: ...&#10;Woche 2: ...">${this.state.zeitplan}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">🤝 Partner</label>
          <textarea class="form-textarea" data-field="partner" placeholder="Außerschulische Partner...">${this.state.partner}</textarea>
        </div>
        <h3 style="margin-bottom: var(--space-md);">✓ Checkliste</h3>
        <div class="checklist">
          ${checklistItems.map((item, i) => `
            <div class="checklist-item ${this.state.checklists.planung?.[i] ? 'checked' : ''}" onclick="Projektlernen.toggleChecklist('planung', ${i})">
              <div class="check-circle">✓</div>
              <span class="checklist-text">${item}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },
  
  renderPhaseAnforderungen() {
    const anforderungen = [
      { id: 1, titel: 'Gesellschaftsbezug', emoji: '🌍', checks: ['Echte Zielgruppe', 'Realitätsbezug', 'Nutzen für andere'], field: 'anfGesellschaft' },
      { id: 2, titel: 'Lebensweltbezug', emoji: '❤️', checks: ['Selbst gewählt', 'Eigene Interessen', 'Motiviert'], field: 'anfLebenswelt' },
      { id: 3, titel: 'Ganzheitlich', emoji: '🎯', checks: ['KOPF: Recherche', 'HERZ: Kreativität', 'HAND: Praktisch'], field: 'anfGanzheitlich' },
      { id: 4, titel: 'Produktorientierung', emoji: '💡', checks: ['Sichtbares Ergebnis', 'Gebrauchswert', 'Nicht nur für Note'], field: 'anfProdukt' },
      { id: 5, titel: 'Kommunikabilität', emoji: '👥', checks: ['Öffentliche Präsentation', 'Externes Feedback', 'Reichweite'], field: 'anfKommunikation' }
    ];
    
    return `
      <div class="card">
        <div class="card-header">
          <div class="card-icon rose">⭐</div>
          <div><h2 class="card-title">Anforderungen</h2></div>
        </div>
        <div class="info-box rose">
          <p><strong>Die 5 Prinzipien nach Wolfgang Emer</strong> – Orientierungspunkte für dein Projekt</p>
        </div>
        ${anforderungen.map(anf => `
          <div style="background: var(--bg-secondary); padding: var(--space-lg); border-radius: var(--radius-lg); margin-bottom: var(--space-md); border-left: 3px solid var(--accent-violet);">
            <h4 style="margin-bottom: var(--space-sm);">${anf.emoji} ${anf.id}. ${anf.titel}</h4>
            <div class="checklist" style="margin-bottom: var(--space-md);">
              ${anf.checks.map((check, i) => `
                <div class="checklist-item ${this.state.checklists.anforderungen?.[`anf${anf.id}`]?.[i] ? 'checked' : ''}" 
                     onclick="Projektlernen.toggleChecklist('anforderungen', ${anf.id}, ${i})"
                     style="padding: var(--space-sm);">
                  <div class="check-circle">✓</div>
                  <span class="checklist-text" style="font-size: 0.875rem;">${check}</span>
                </div>
              `).join('')}
            </div>
            <textarea class="form-textarea" data-field="${anf.field}" 
                      placeholder="So erfülle ich dieses Kriterium..." 
                      style="min-height: 80px;">${this.state[anf.field] || ''}</textarea>
          </div>
        `).join('')}
        <div class="form-group">
          <label class="form-label">⭐ KANN-Kriterien (Bonus)</label>
          <textarea class="form-textarea" data-field="anfKann" 
                    placeholder="Fächerübergreifend? Teamarbeit? Außerschulische Partner?">${this.state.anfKann}</textarea>
        </div>
      </div>
    `;
  },
  
  renderPhaseDurchfuehrung() {
    const checklistItems = [
      'Recherche durchgeführt (Kopf)',
      'Kreativ gearbeitet (Herz)',
      'Etwas Praktisches erstellt (Hand)',
      'Feedback eingeholt',
      'Zwischenergebnisse dokumentiert'
    ];
    
    return `
      <div class="card">
        <div class="card-header">
          <div class="card-icon fuchsia">👥</div>
          <div><h2 class="card-title">Phase 3: Durchführung</h2></div>
        </div>
        <div class="info-box fuchsia">
          <p><strong>Prinzip:</strong> Ganzheitliches Lernen – Kopf, Herz und Hand!</p>
        </div>
        <h3 style="margin-bottom: var(--space-md);">📅 Wochenprotokoll</h3>
        <div id="weeks-container">
          ${this.state.weeks.map((week, i) => `
            <div style="background: var(--bg-secondary); padding: var(--space-md); border-radius: var(--radius-md); margin-bottom: var(--space-sm);">
              <h4 style="margin-bottom: var(--space-sm); color: var(--accent-fuchsia);">Woche ${i + 1}</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">
                <input type="text" class="form-input" placeholder="Aktivität..." 
                       data-weekindex="${i}" data-weekfield="aktivitaet" value="${week.aktivitaet || ''}">
                <input type="text" class="form-input" placeholder="Reflexion..." 
                       data-weekindex="${i}" data-weekfield="reflexion" value="${week.reflexion || ''}">
              </div>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-secondary" onclick="Projektlernen.addWeek()" style="margin-bottom: var(--space-xl);">
          + Woche hinzufügen
        </button>
        <h3 style="margin-bottom: var(--space-md);">✓ Checkliste</h3>
        <div class="checklist">
          ${checklistItems.map((item, i) => `
            <div class="checklist-item ${this.state.checklists.durchfuehrung?.[i] ? 'checked' : ''}" 
                 onclick="Projektlernen.toggleChecklist('durchfuehrung', ${i})">
              <div class="check-circle">✓</div>
              <span class="checklist-text">${item}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },
  
  renderPhasePraesentation() {
    const formatOptions = [
      'Vortrag in der Klasse',
      'Ausstellung in der Schule',
      'Online-Veröffentlichung',
      'Performance/Workshop',
      'Kooperation mit Partnern'
    ];
    const checklistItems = [
      'Zielgruppe für Präsentation definiert',
      'Format gewählt',
      'Produkt fertiggestellt',
      'Reflexion geschrieben',
      'Öffentlichkeit hergestellt'
    ];
    
    return `
      <div class="card">
        <div class="card-header">
          <div class="card-icon amber">🎤</div>
          <div><h2 class="card-title">Phase 4: Präsentation & Reflexion</h2></div>
        </div>
        <div class="info-box amber">
          <p><strong>Prinzip:</strong> Produktorientierung & Kommunikabilität – Dein Projekt soll anderen einen Mehrwert bieten!</p>
        </div>
        <div class="form-group">
          <label class="form-label">🎤 Präsentationsformat</label>
          <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
            ${formatOptions.map((opt, i) => `
              <label style="display: flex; align-items: center; gap: var(--space-sm); cursor: pointer; padding: var(--space-sm); background: var(--bg-secondary); border-radius: var(--radius-sm);">
                <input type="checkbox" ${this.state.formatOptions?.[i] ? 'checked' : ''} 
                       onchange="Projektlernen.toggleFormatOption(${i})"
                       style="width: 18px; height: 18px; accent-color: var(--accent-amber);">
                <span style="color: var(--text-primary);">${opt}</span>
              </label>
            `).join('')}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">🤔 Selbstreflexion</label>
          <textarea class="form-textarea" data-field="reflexion" 
                    placeholder="Was habe ich gelernt? Was war herausfordernd? Was würde ich anders machen?" 
                    style="min-height: 150px;">${this.state.reflexion}</textarea>
        </div>
        <h3 style="margin-bottom: var(--space-md);">✓ Checkliste</h3>
        <div class="checklist">
          ${checklistItems.map((item, i) => `
            <div class="checklist-item ${this.state.checklists.praesentation?.[i] ? 'checked' : ''}" 
                 onclick="Projektlernen.toggleChecklist('praesentation', ${i})">
              <div class="check-circle">✓</div>
              <span class="checklist-text">${item}</span>
            </div>
          `).join('')}
        </div>
        <div class="info-box emerald" style="margin-top: var(--space-lg);">
          <p>🎉 <strong>Glückwunsch!</strong> Dein Projekt hat jetzt einen echten Mehrwert für andere!</p>
        </div>
      </div>
    `;
  },
  
  init() {
    this.load();
  }
};

Projektlernen.init();
window.Projektlernen = Projektlernen;
