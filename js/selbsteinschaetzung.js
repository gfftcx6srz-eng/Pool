// ===========================================
// Selbsteinschätzung Module
// ===========================================

const Selbsteinschaetzung = {
  // State
  state: {
    zeitpunkt: 'anfang',
    daten: {
      anfang: { bewertungen: {}, reflexionen: {}, expandedKompetenz: null },
      mitte: { bewertungen: {}, reflexionen: {}, expandedKompetenz: null },
      ende: { bewertungen: {}, reflexionen: {}, expandedKompetenz: null }
    }
  },
  
  // Kompetenzbereiche Data
  kompetenzbereiche: [
    {
      id: 'selbstkompetenz',
      titel: 'Selbstkompetenz',
      emoji: '🧠',
      farbe: 'violet',
      kompetenzen: [
        { id: 's1', text: 'Ich kann mein Thema/meine Fragestellung selbstständig wählen und eingrenzen' },
        { id: 's2', text: 'Ich plane meinen Lernprozess selbst (Schritte, Zeitplan, Ressourcen)' },
        { id: 's3', text: 'Ich übernehme Verantwortung für den Erfolg meines Projekts' },
        { id: 's4', text: 'Ich kann meine eigenen Interessen erkennen und verfolgen' },
        { id: 's5', text: 'Ich reflektiere regelmäßig meinen Lernstand und passe mein Vorgehen an' },
        { id: 's6', text: 'Ich arbeite selbstständig, auch wenn keine Lehrkraft direkt anwesend ist' }
      ]
    },
    {
      id: 'sozialkompetenz',
      titel: 'Sozialkompetenz',
      emoji: '👥',
      farbe: 'emerald',
      kompetenzen: [
        { id: 'so1', text: 'Ich kann in einer Gruppe konstruktiv zusammenarbeiten' },
        { id: 'so2', text: 'Ich teile Aufgaben fair auf und halte Absprachen ein' },
        { id: 'so3', text: 'Ich kann mit unterschiedlichen Meinungen umgehen und Kompromisse finden' },
        { id: 'so4', text: 'Ich gebe anderen konstruktives Feedback' },
        { id: 'so5', text: 'Ich kann um Hilfe bitten und anderen helfen' },
        { id: 'so6', text: 'Ich übernehme Verantwortung für das gemeinsame Ergebnis' }
      ]
    },
    {
      id: 'kognitive',
      titel: 'Kognitive Fähigkeiten',
      emoji: '💡',
      farbe: 'fuchsia',
      kompetenzen: [
        { id: 'k1', text: 'Ich recherchiere gezielt Informationen zu meinem Thema' },
        { id: 'k2', text: 'Ich entwickle kreative Lösungsansätze für Probleme' },
        { id: 'k3', text: 'Ich verbinde Wissen aus verschiedenen Fächern' },
        { id: 'k4', text: 'Ich lerne ganzheitlich (Kopf, Herz und Hand)' },
        { id: 'k5', text: 'Ich erkenne Zusammenhänge zwischen meinem Thema und der Gesellschaft' },
        { id: 'k6', text: 'Ich kann mein Wissen strukturiert darstellen und präsentieren' }
      ]
    },
    {
      id: 'demokratie',
      titel: 'Demokratiebildung',
      emoji: '⚖️',
      farbe: 'amber',
      kompetenzen: [
        { id: 'd1', text: 'Ich bringe mich aktiv in Entscheidungsprozesse ein' },
        { id: 'd2', text: 'Ich respektiere demokratische Entscheidungen der Gruppe' },
        { id: 'd3', text: 'Ich gestalte den Lernprozess aktiv mit' },
        { id: 'd4', text: 'Ich höre anderen aktiv zu und lasse sie ausreden' },
        { id: 'd5', text: 'Ich erkenne, dass meine Entscheidungen Auswirkungen auf andere haben' },
        { id: 'd6', text: 'Ich übernehme verschiedene Rollen in der Gruppe' }
      ]
    }
  ],
  
  skala: [
    { wert: 1, emoji: '😟', label: 'Brauche Übung' },
    { wert: 2, emoji: '😐', label: 'Geht so' },
    { wert: 3, emoji: '🙂', label: 'Okay' },
    { wert: 4, emoji: '😊', label: 'Gut' },
    { wert: 5, emoji: '😃', label: 'Sehr gut' }
  ],
  
  // Storage
  storageKey: 'pool-selbsteinschaetzung-v2',
  
  load() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        this.state = JSON.parse(saved);
      } catch (e) {
        console.error('Fehler beim Laden:', e);
      }
    }
  },
  
  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    Utils.showSaveIndicator();
  },
  
  getCurrentData() {
    return this.state.daten[this.state.zeitpunkt];
  },
  
  setBewertung(kompId, wert) {
    this.getCurrentData().bewertungen[kompId] = wert;
    this.save();
    this.render();
  },
  
  toggleBereich(bereichId) {
    const current = this.getCurrentData().expandedKompetenz;
    this.getCurrentData().expandedKompetenz = current === bereichId ? null : bereichId;
    this.save();
    this.render();
  },
  
  setZeitpunkt(wert) {
    this.state.zeitpunkt = wert;
    this.save();
    this.render();
  },
  
  berechneDurchschnitt(bereichId, zeitpunkt = null) {
    const zp = zeitpunkt || this.state.zeitpunkt;
    const bereich = this.kompetenzbereiche.find(b => b.id === bereichId);
    const bewertungen = this.state.daten[zp].bewertungen;
    const werte = bereich.kompetenzen.map(k => bewertungen[k.id]).filter(w => w);
    if (werte.length === 0) return null;
    return (werte.reduce((a, b) => a + b, 0) / werte.length).toFixed(1);
  },
  
  gesamtDurchschnitt(zeitpunkt = null) {
    const zp = zeitpunkt || this.state.zeitpunkt;
    const alle = Object.values(this.state.daten[zp].bewertungen).filter(w => w);
    if (alle.length === 0) return null;
    return (alle.reduce((a, b) => a + b, 0) / alle.length).toFixed(1);
  },
  
  anzahlBewertet() {
    return Object.values(this.getCurrentData().bewertungen).filter(w => w).length;
  },
  
  gesamtKompetenzen() {
    return this.kompetenzbereiche.reduce((sum, b) => sum + b.kompetenzen.length, 0);
  },
  
  reset() {
    if (confirm('Möchtest du wirklich alle Daten zurücksetzen?')) {
      localStorage.removeItem(this.storageKey);
      this.state = {
        zeitpunkt: 'mitte',
        daten: {
          anfang: { bewertungen: {}, reflexionen: {}, expandedKompetenz: null },
          mitte: { bewertungen: {}, reflexionen: {}, expandedKompetenz: null },
          ende: { bewertungen: {}, reflexionen: {}, expandedKompetenz: null }
        }
      };
      this.render();
      Utils.showToast('Alle Daten wurden zurückgesetzt', 'success');
    }
  },
  
  exportData() {
    Utils.exportJSON(this.state, `selbsteinschaetzung-export-${new Date().toISOString().split('T')[0]}.json`);
    Utils.showToast('Export erfolgreich', 'success');
  },
  
  importData() {
    Utils.importJSON((data) => {
      this.state = data;
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      this.render();
      Utils.showToast('Import erfolgreich', 'success');
    });
  },
  
  // Rendering
  render() {
    const container = document.getElementById('selbsteinschaetzung-content');
    if (!container) return;
    
    const fortschritt = (this.anzahlBewertet() / this.gesamtKompetenzen()) * 100;
    
    container.innerHTML = `
      <!-- Header Card -->
      <div class="card slide-up">
        <div class="card-header">
          <div class="card-icon violet">🏆</div>
          <div>
            <h2 class="card-title">Meine Kompetenzen im PooL</h2>
            <p class="card-subtitle">Selbsteinschätzung v2</p>
          </div>
        </div>
        
        <!-- Zeitpunkt Selector -->
        <div class="form-group">
          <label class="form-label">Zeitpunkt wählen:</label>
          <select class="form-select" id="zeitpunkt-select">
            <option value="anfang" ${this.state.zeitpunkt === 'anfang' ? 'selected' : ''}>🚀 Projektbeginn</option>
            <option value="mitte" ${this.state.zeitpunkt === 'mitte' ? 'selected' : ''}>⏳ Projekt-Mitte</option>
            <option value="ende" ${this.state.zeitpunkt === 'ende' ? 'selected' : ''}>🎯 Projektende</option>
          </select>
        </div>
        
        <!-- Progress -->
        <div class="progress-container">
          <div class="progress-header">
            <span class="progress-label">Fortschritt</span>
            <span class="progress-value">${this.anzahlBewertet()} / ${this.gesamtKompetenzen()}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${fortschritt}%"></div>
          </div>
        </div>
        
        <!-- Actions -->
        <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm" onclick="Selbsteinschaetzung.exportData()">
            💾 JSON Export
          </button>
          <button class="btn btn-secondary btn-sm" onclick="Selbsteinschaetzung.importData()">
            📤 JSON Import
          </button>
          <button class="btn btn-danger btn-sm" onclick="Selbsteinschaetzung.reset()">
            🔄 Reset
          </button>
        </div>
      </div>
      
      ${this.renderVergleich()}
      
      <!-- Kompetenzbereiche -->
      <div class="accordion">
        ${this.kompetenzbereiche.map((b, i) => this.renderBereich(b, i)).join('')}
      </div>
      
      ${this.gesamtDurchschnitt() ? this.renderAuswertung() : ''}
    `;
    
    // Event Listeners
    document.getElementById('zeitpunkt-select')?.addEventListener('change', (e) => {
      this.setZeitpunkt(e.target.value);
    });
  },
  
  renderVergleich() {
    const anfang = this.gesamtDurchschnitt('anfang');
    const mitte = this.gesamtDurchschnitt('mitte');
    const ende = this.gesamtDurchschnitt('ende');
    
    if (!anfang && !mitte && !ende) return '';
    
    let entwicklung = '-';
    if (anfang && ende) {
      const diff = (parseFloat(ende) - parseFloat(anfang)).toFixed(1);
      entwicklung = parseFloat(diff) > 0 ? `+${diff}` : diff;
    }
    
    return `
      <div class="card slide-up stagger-1">
        <div class="card-header">
          <div class="card-icon cyan">📈</div>
          <div>
            <h3 class="card-title">Entwicklungsvergleich</h3>
          </div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value violet">${anfang || '-'}</div>
            <div class="stat-label">Anfang</div>
          </div>
          <div class="stat-card">
            <div class="stat-value fuchsia">${mitte || '-'}</div>
            <div class="stat-label">Mitte</div>
          </div>
          <div class="stat-card">
            <div class="stat-value emerald">${ende || '-'}</div>
            <div class="stat-label">Ende</div>
          </div>
          <div class="stat-card">
            <div class="stat-value amber">${entwicklung}</div>
            <div class="stat-label">Entwicklung</div>
          </div>
        </div>
      </div>
    `;
  },
  
  renderBereich(bereich, index) {
    const durchschnitt = this.berechneDurchschnitt(bereich.id);
    const isExpanded = this.getCurrentData().expandedKompetenz === bereich.id;
    const bewertungen = this.getCurrentData().bewertungen;
    const bewertet = bereich.kompetenzen.filter(k => bewertungen[k.id]).length;
    
    return `
      <div class="accordion-item ${isExpanded ? 'open' : ''} slide-up stagger-${index + 2}">
        <div class="accordion-header" onclick="Selbsteinschaetzung.toggleBereich('${bereich.id}')">
          <div class="accordion-title">
            <div class="accordion-icon card-icon ${bereich.farbe}">${bereich.emoji}</div>
            <div>
              <h3 class="card-title">${bereich.titel}</h3>
              <p class="card-subtitle">${bewertet} / ${bereich.kompetenzen.length} bewertet</p>
            </div>
          </div>
          <div class="accordion-meta">
            ${durchschnitt ? `<span class="accordion-badge" style="color: var(--accent-${bereich.farbe}); font-weight: 700; font-size: 1.25rem;">${durchschnitt}</span>` : ''}
            <span class="accordion-arrow">▼</span>
          </div>
        </div>
        <div class="accordion-content">
          <div class="accordion-body">
            ${bereich.kompetenzen.map(k => this.renderKompetenz(k)).join('')}
          </div>
        </div>
      </div>
    `;
  },
  
  renderKompetenz(komp) {
    const aktuelleWert = this.getCurrentData().bewertungen[komp.id];
    
    return `
      <div class="form-group">
        <label class="form-label">${komp.text}</label>
        <div class="rating-scale">
          ${this.skala.map(s => `
            <button 
              class="rating-btn ${aktuelleWert === s.wert ? 'selected' : ''}" 
              data-value="${s.wert}"
              onclick="Selbsteinschaetzung.setBewertung('${komp.id}', ${s.wert})">
              <span class="rating-emoji">${s.emoji}</span>
              <span class="rating-label">${s.wert}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  },
  
  renderAuswertung() {
    const zeitpunktLabels = {
      anfang: 'Projektbeginn',
      mitte: 'Projekt-Mitte',
      ende: 'Projektende'
    };
    
    return `
      <div class="card slide-up" style="background: linear-gradient(135deg, var(--accent-violet), var(--accent-fuchsia)); border: none;">
        <div class="card-header">
          <div class="card-icon" style="background: rgba(255,255,255,0.2);">📊</div>
          <div>
            <h3 class="card-title" style="color: white;">Auswertung (${zeitpunktLabels[this.state.zeitpunkt]})</h3>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-md);">
          <div style="background: rgba(255,255,255,0.15); padding: var(--space-lg); border-radius: var(--radius-md);">
            <h4 style="color: white; margin-bottom: var(--space-md);">Durchschnittswerte</h4>
            <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
              <div style="display: flex; justify-content: space-between; padding: var(--space-sm); background: rgba(255,255,255,0.2); border-radius: var(--radius-sm);">
                <span style="color: white;">Gesamt:</span>
                <span style="color: white; font-weight: 700; font-size: 1.25rem;">${this.gesamtDurchschnitt()}</span>
              </div>
              ${this.kompetenzbereiche.map(b => {
                const avg = this.berechneDurchschnitt(b.id);
                return avg ? `
                  <div style="display: flex; justify-content: space-between; padding: var(--space-sm); background: rgba(255,255,255,0.1); border-radius: var(--radius-sm);">
                    <span style="color: rgba(255,255,255,0.9);">${b.emoji} ${b.titel}:</span>
                    <span style="color: white; font-weight: 600;">${avg}</span>
                  </div>
                ` : '';
              }).join('')}
            </div>
          </div>
          
          <div style="background: rgba(255,255,255,0.15); padding: var(--space-lg); border-radius: var(--radius-md);">
            <h4 style="color: white; margin-bottom: var(--space-md);">Interpretation</h4>
            <div style="color: rgba(255,255,255,0.9); font-size: 0.9rem; display: flex; flex-direction: column; gap: var(--space-sm);">
              <p><strong>4.0-5.0:</strong> 🌟 Sehr gut!</p>
              <p><strong>3.0-3.9:</strong> 👍 Gut unterwegs</p>
              <p><strong>2.0-2.9:</strong> 📈 Entwicklungspotenzial</p>
              <p><strong>1.0-1.9:</strong> 🤝 Unterstützung hilfreich</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  init() {
    this.load();
  }
};

// Initialize on load
Selbsteinschaetzung.init();

// Export
window.Selbsteinschaetzung = Selbsteinschaetzung;
