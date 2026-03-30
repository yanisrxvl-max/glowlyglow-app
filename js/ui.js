/* UI / DOM */

const EXPRESS_PROFILES = {
      grasse_acne: { type_peau: 'grasse', probleme_principal: 'acne', sensibilite: 'moyen', objectif: 'rapide', routine_actuelle: 'aucune', budget: 'moyen', preference_routine: 'simple', frequence: 'normal' },
      seche_hydra: { type_peau: 'seche', probleme_principal: 'deshydratation', sensibilite: 'moyen', objectif: 'entretien', routine_actuelle: 'simple', budget: 'moyen', preference_routine: 'simple', frequence: 'normal' },
      taches_glow: { type_peau: 'mixte', probleme_principal: 'taches', sensibilite: 'faible', objectif: 'rapide', routine_actuelle: 'simple', budget: 'moyen', preference_routine: 'simple', frequence: 'normal' },
    };


function renderQuestions() {
      const container = document.getElementById('questionsContainer');
      container.innerHTML = '';

      questions.forEach((q, idx) => {
        const card = document.createElement('div');
        card.className = 'question-card' + (idx === 0 ? ' active' : '');
        card.id = `q-${idx}`;

        card.innerHTML = `
      <div class="question-number">${q.number}</div>
      <div class="question-text">${q.text}</div>
      <div class="question-sub">${q.sub}</div>
      <div class="options-grid">
        ${q.options.map(o => `
          <button class="option-btn" data-question="${q.id}" data-value="${o.value}" onclick="selectOption(this, ${idx})">
            <span class="option-emoji">${o.emoji}</span>
            <span class="option-dot"></span>
            <span>
              <div class="option-label">${o.label}</div>
              <div class="option-desc">${o.desc}</div>
            </span>
          </button>
        `).join('')}
      </div>
      <div class="nav-row">
        <button class="nav-back ${idx === 0 ? 'hidden' : ''}" onclick="goBack(${idx})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Retour
        </button>
      </div>
    `;

        container.appendChild(card);
      });
    }

function selectOption(btn, questionIdx) {
      if (transitioning) return;
      const q = questions[questionIdx];
      btn.closest('.options-grid').querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      answers[q.id] = btn.dataset.value;
      transitioning = true;
      setTimeout(() => {
        if (questionIdx < questions.length - 1) {
          goNext(questionIdx);
        } else {
          showResults();
        }
        transitioning = false;
      }, 400);
    }

function goNext(fromIdx) {
      const fromCard = document.getElementById(`q-${fromIdx}`);
      const toCard = document.getElementById(`q-${fromIdx + 1}`);

      fromCard.classList.add('exit');
      setTimeout(() => {
        fromCard.classList.remove('active', 'exit');
        toCard.classList.add('active');
        current = fromIdx + 1;
        updateProgress();
      }, 280);
    }

function goBack(toIdx) {
      if (toIdx <= 0) return;
      const fromCard = document.getElementById(`q-${toIdx}`);
      const toCard = document.getElementById(`q-${toIdx - 1}`);

      fromCard.classList.remove('active');
      toCard.classList.add('active');
      current = toIdx - 1;
      updateProgress();
    }

function updateProgress() {
      const pct = Math.round(((current + 1) / questions.length) * 100);
      document.getElementById('progressFill').style.width = pct + '%';
      document.getElementById('stepLabel').textContent = `Étape ${current + 1} / ${questions.length}`;
      document.getElementById('percentLabel').textContent = pct + '%';
    }

function buildVendorView(hero, routine, upsell, a, needsSPF) {
      if (!hero) return '<p style="color:var(--warm-gray)">Profil incomplet — relancez le diagnostic.</p>';

      const pitch = generatePitch(hero, a);
      const why = generateWhy(hero, a);
      // Complémentaires = routine sans hero (max 2) ; si mode ultra simple, upsell en renfort
      const compls = routine.filter(p => p.id !== hero.id).slice(0, 2);
      const totalP = hero.prix + compls.reduce((s, p) => s + p.prix, 0);
      const gamme = hero.gamme;

      const complHTMLRapide = compls.length ? `
        <div class="compl-list">
          <div class="compl-list-label">Proposer en complément</div>
          ${compls.map(p => `
            <div class="compl-item">
              <span>${p.emoji} ${p.nom}</span>
              <span class="compl-price">${p.prix}€</span>
            </div>`).join('')}
          <div class="panier-total"><span>Panier potentiel</span><span>${totalP}€</span></div>
        </div>` : '';

      const complHTMLDetail = compls.length ? `
        <div class="vendor-section">
          <div class="vendor-section-label">D — Proposer en complément</div>
          ${compls.map(p => `
            <div class="compl-item-detail">
              <div>
                <div class="compl-name">${p.emoji} ${p.nom}</div>
                <div class="compl-reason">${generatePitch(p, a)}</div>
              </div>
              <div class="compl-price-r">${p.prix}€</div>
            </div>`).join('')}
          <div class="panier-total" style="border-radius:0 0 var(--radius) var(--radius);border:1.5px solid var(--light-border);border-top:none">
            <span>Panier potentiel</span><span>${totalP}€</span>
          </div>
        </div>` : '';

      // Génération des 3 nouvelles lignes
      const opening = generateOpening(a);
      const objection = generateObjection(a);
      const openingHTML = `
        <div class="opening-line">
          <div class="opening-prefix">➡️ À dire en premier</div>
          <div class="opening-text">${opening}</div>
        </div>`;
      const objectionHTML = `
        <div class="objection-block">
          <span class="objection-icon">💬</span>
          <div class="objection-inner">
            <div class="objection-prefix">Si le client hésite</div>
            <div class="objection-text">${objection}</div>
          </div>
        </div>`;

      // ---- VUE RAPIDE ----
      // Mémo vendeur (3 bullets max)
      const memo = generateMemo(hero, a);
      const memoHTML = memo.length ? '<div class="memo-vendor">' + memo.map(function (m) { return '<div class="memo-item"><span class="memo-dot">●</span>' + m + '</div>'; }).join('') + '</div>' : '';

      // Panier visuel
      const allItems = [hero, ...compls];
      const cartItemsHTML = allItems.map(function (p) { return '<div class="cart-item"><span>' + p.emoji + ' ' + p.nom + '</span><span class="cart-item-price">' + p.prix + '€</span></div>'; }).join('');
      const cartHTML = '<div class="cart-visual"><div class="cart-header">🧺 Routine recommandée</div>' + cartItemsHTML + '<div class="cart-total"><span class="cart-total-label">Total</span><span class="cart-total-val">' + totalP + '€</span></div><button class="cart-cta" onclick="document.getElementById(\'captureBlock\').scrollIntoView({behavior:\'smooth\'})">👉 Tu veux commencer avec ça ?</button></div>';

      // Share client
      const captureHTML = '<div class="capture-block" id="captureBlock"><div class="capture-label">📋 Partager la routine</div><div class="capture-row"><input class="capture-input" id="sharePrenom" type="text" placeholder="Prénom du client (optionnel)"></div><div class="share-grid"><button class="share-btn btn-copy" onclick="copyRoutine()"><span style="font-size:15px">📋</span> Copier</button><button class="share-btn btn-native" onclick="shareRoutine()"><span style="font-size:15px">📱</span> Envoyer</button></div></div>';

      const rapide = '<div id="viewRapide">' + openingHTML + '<div class="hero-card" style="box-shadow:0 0 0 2px var(--gold), 0 8px 32px rgba(200,150,62,0.18)"><div class="hero-badge" style="opacity:1;font-size:11px">⭐ À PROPOSER EN PRIORITÉ</div><div class="hero-name">' + hero.emoji + ' ' + hero.nom + '</div><div class="hero-meta"><span class="step-gamme gamme-' + gamme + '">' + gamme + '</span><span class="hero-price-tag">' + hero.prix + '€</span></div>' + memoHTML + '<div class="hero-pitch">“' + pitch + '”</div></div>' + cartHTML + objectionHTML + captureHTML + '</div>';

      // ---- VUE DÉTAILLÉE ----
      const detail = `<div id="viewDetail" style="display:none">
        <div class="vendor-section">
          <div class="vendor-section-label">A — Phrase d'entrée</div>
          ${openingHTML}
        </div>
        <div class="vendor-section">
          <div class="vendor-section-label">B — Produit principal</div>
          <div class="hero-card" style="box-shadow:0 0 0 2px var(--gold), 0 8px 32px rgba(200,150,62,0.18)">
            <div class="hero-badge" style="opacity:1;font-size:11px">⭐ À PROPOSER EN PRIORITÉ</div>
            <div class="hero-name">${hero.emoji} ${hero.nom}</div>
            <div class="hero-meta">
              <span class="step-gamme gamme-${gamme}">${gamme}</span>
              <span class="hero-price-tag">${hero.prix}€</span>
            </div>
            <div class="hero-actifs">${hero.actifs_cles.slice(0, 3).map(ac => `<span class="actif-pill">${ac}</span>`).join('')}</div>
          </div>
        </div>
        <div class="vendor-section">
          <div class="vendor-section-label">C — Pourquoi ce produit</div>
          <div class="why-list">${why.map(r => `<div class="why-item"><span class="why-check">✓</span> ${r}</div>`).join('')}</div>
        </div>
        <div class="vendor-section">
          <div class="vendor-section-label">D — Comment le présenter</div>
          <div class="pitch-box">“${pitch}”</div>
        </div>
        ${complHTMLDetail}
        ${needsSPF ? `<div class="spf-notice"><span>☀️</span><span>Rappel vendeur : SPF 50 recommandé après les actifs photosensibilisants (AHA, Vit. C, Bakuchiol).</span></div>` : ''}
        ${objectionHTML}
      </div>`;

      return rapide + detail;
    }

function generateMemo(p, a) {
      const m = [];
      if (p.categorie === 'serum') m.push('Appliquer matin et/ou soir sur peau propre');
      if (p.categorie === 'nettoyant') m.push('Base de toute routine — matin et soir');
      if (p.niveau_puiss >= 3) m.push('Concentration forte — résultats en 2-3 semaines');
      else if (p.niveau_puiss <= 1) m.push('Ultra-doux — convient aux peaux réactives');
      if (p.spf_requis) m.push('SPF obligatoire le matin avec ce produit');
      if (p.categorie === 'creme_jour') m.push('Hydrate et protège toute la journée');
      if (p.problemes.includes('acne')) m.push('Action purifiante — réduit les imperfections');
      if (p.problemes.includes('taches')) m.push('Unifie le teint — atténue les taches');
      if (p.problemes.includes('deshydratation')) m.push('Repulpe et nourrit en profondeur');
      return m.slice(0, 3);
    }

function switchDisplay(mode) {
      document.getElementById('viewRapide').style.display = mode === 'rapide' ? 'block' : 'none';
      document.getElementById('viewDetail').style.display = mode === 'detail' ? 'block' : 'none';
      document.getElementById('btnRapide').classList.toggle('active', mode === 'rapide');
      document.getElementById('btnDetail').classList.toggle('active', mode === 'detail');
    }

function toggleProfile() {
      const el = document.getElementById('profileCollapse');
      const arrow = document.getElementById('profileArrow');
      const open = el.style.display === 'none';
      el.style.display = open ? 'block' : 'none';
      arrow.innerHTML = open ? '&#8593;' : '&#8595;';
    }

function expressStart(key) {
      const profile = EXPRESS_PROFILES[key];
      if (!profile) return;
      Object.assign(answers, profile);
      document.getElementById('expressPanel').style.display = 'none';
      document.querySelector('.quiz-header').style.display = 'none';
      document.getElementById('questionsContainer').style.display = 'none';
      document.querySelector('.progress-wrapper').style.display = 'none';
      // Build profile rows
      const labelMap = {};
      questions.forEach(q => q.options.forEach(o => { labelMap[q.id + '__' + o.value] = o.label; }));
      document.getElementById('profileRows').innerHTML = questions.map(q => {
        const val = answers[q.id]; const label = labelMap[q.id + '__' + val] || val;
        const cleanQ = q.text.replace(' ?', '').replace('Quel est votre ', '').replace('Quelle est votre ', '')
          .replace('À quelle fréquence souhaitez-vous vous en occuper', 'Fréquence')
          .replace('Quelle routine vous correspond', 'Préférence routine')
          .replace('Quel budget souhaitez-vous investir', 'Budget');
        return '<div class="profile-row"><span class="label">' + cleanQ + '</span><span class="profile-tag">' + label + '</span></div>';
      }).join('');
      const { routine, upsell, needsSPF, mode, modeInfo, hero } = buildRoutine(answers);
      document.getElementById('vendorContainer').innerHTML = buildVendorView(hero, routine, upsell, answers, needsSPF);
      document.getElementById('resultsCard').classList.add('active');
      switchDisplay('rapide');
    }










function showResults() {
    document.querySelector('.quiz-header').style.display = 'none';
    document.getElementById('questionsContainer').style.display = 'none';
    document.querySelector('.progress-wrapper').style.display = 'none';
    const express = document.getElementById('expressPanel');
    if (express) express.style.display = 'none';

    // Build profile rows
    const labelMap = {};
    questions.forEach(q => q.options.forEach(o => { labelMap[q.id + '__' + o.value] = o.label; }));
    document.getElementById('profileRows').innerHTML = questions.map(q => {
        const val = answers[q.id];
        if (!val) return ''; // If not all questions are answered somehow
        const label = labelMap[q.id + '__' + val] || val;
        const cleanQ = q.text.replace(' ?', '').replace('Quel est votre ', '').replace('Quelle est votre ', '')
            .replace('À quelle fréquence souhaitez-vous vous en occuper', 'Fréquence')
            .replace('Quelle routine vous correspond', 'Préférence routine')
            .replace('Quel budget souhaitez-vous investir', 'Budget');
        return '<div class="profile-row"><span class="label">' + cleanQ + '</span><span class="profile-tag">' + label + '</span></div>';
    }).join('');

    const { routine, upsell, needsSPF, mode, modeInfo, hero } = buildRoutine(answers);
    document.getElementById('vendorContainer').innerHTML = buildVendorView(hero, routine, upsell, answers, needsSPF);
    document.getElementById('resultsCard').classList.add('active');
    switchDisplay('rapide');
}

function restart() {
    window.location.reload();
}

function toggleJSON() {
    const output = document.getElementById('jsonOutput');
    const code = document.getElementById('jsonContent');
    if (output.style.display === 'block') {
        output.style.display = 'none';
    } else {
        code.textContent = JSON.stringify(answers, null, 2);
        output.style.display = 'block';
    }
}
