/* RECOMMENDATION ENGINE */

const MODE_INFO = {
  produit_unique: { label: 'Produit Clé', desc: 'Le soin le plus impactant pour votre peau', icon: '⭐' },
  duo: { label: 'Duo Essentiel', desc: '2 produits fondamentaux — routine rapide et efficace', icon: '✌️' },
  trio: { label: 'Trio Efficace', desc: 'La base solide d\'une vraie routine skincare', icon: '🎯' },
  routine_complete: { label: 'Routine Complète', desc: 'Le programme skincare sur-mesure pour votre profil', icon: '✨' },
};


const MODE_BASE_CATS = {
  produit_unique: ['serum'],
  duo: ['nettoyant', 'serum'],
  trio: ['nettoyant', 'serum', 'creme_jour'],
  routine_complete: ['nettoyant', 'serum', 'creme_jour', 'spf'],
};


const ROUTINE_ORDER = ['nettoyant', 'lotion', 'serum', 'creme_jour', 'creme_nuit', 'masque', 'gommage', 'spf', 'complement'];


const EXFOLIANT_IDS = new Set(['VLG01', 'VGE01', 'VGE02']);


function scoreProduct(p, a) {
  let score = 0;

  // 1. Type de peau (30 pts)
  if (p.types_peau.includes(a.type_peau)) score += 30;

  // 2. Problème principal (25 pts)
  if (p.problemes.includes(a.probleme_principal)) score += 25;

  // 3. Objectif (15 pts)
  if (p.objectifs.includes(a.objectif)) score += 15;

  // 4. Sensibilité — compatibilité critique
  if (p.adapte_sens.includes(a.sensibilite)) {
    score += 10;
  } else {
    // Produit trop puissant pour cette peau
    score -= 40;
  }

  // 5. Niveau puissance vs objectif (8 pts)
  const idealPuiss = (a.objectif === 'entretien') ? 2 : 3;
  if (p.niveau_puiss === idealPuiss) score += 8;
  else if (Math.abs(p.niveau_puiss - idealPuiss) === 1) score += 4;

  // 6. Priorité produit (1-5 → jusqu'à 7 pts)
  score += p.priorite * 1.4;

  return Math.max(0, score);
}

// ============================================================
// DÉTERMINATION DU MODE DE RECOMMANDATION
// ============================================================
function determineMode(a) {
  let pts = 0;
  // Budget — driver principal
  if (a.budget === 'eleve') pts += 3;
  else if (a.budget === 'moyen') pts += 2;
  // Objectif
  if (a.objectif === 'transformation') pts += 2;
  else if (a.objectif === 'entretien') pts += 1;
  // Fréquence et préférences
  if (a.preference_routine === 'complete') pts += 1;
  if (a.frequence === 'intensif') pts += 1;
  else if (a.frequence === 'minimum') pts -= 1;
  // Expérience actuelle
  if (a.routine_actuelle === 'complete') pts += 1;
  else if (a.routine_actuelle === 'aucune') pts -= 1;

  if (pts <= 0) return 'produit_unique';
  if (pts <= 2) return 'duo';
  if (pts <= 4) return 'trio';
  return 'routine_complete';
}



function buildRoutine(a) {
  const mode = determineMode(a);
  const modeInfo = MODE_INFO[mode];

  // 1. Scorer tous les produits visage
  const FACE_CATS = ['nettoyant', 'lotion', 'serum', 'creme_jour', 'creme_nuit', 'masque', 'gommage', 'spf', 'complement'];
  const scored = PRODUCTS
    .filter(p => FACE_CATS.includes(p.categorie))
    .map(p => ({ ...p, score: scoreProduct(p, a) }))
    .sort((x, y) => y.score - x.score);

  // 2. Catégories cibles selon mode + ajouts dynamiques
  let targetCats = [...MODE_BASE_CATS[mode]];

  if (mode === 'routine_complete') {
    // Lotion : ajouter si peau non très sensible (exfoliant chimique potentiel)
    if (a.sensibilite !== 'eleve') {
      targetCats.splice(targetCats.indexOf('serum'), 0, 'lotion');
    }
    // Crème de nuit : transformation ou fréquence intensive
    if (a.objectif === 'transformation' || a.frequence === 'intensif') {
      targetCats.push('creme_nuit');
    }
    // Masque + gommage : seulement si fréquence intensive (1 exfoliant max)
    if (a.frequence === 'intensif') {
      targetCats.push('masque');
      targetCats.push('gommage');
    }
  }

  // 3. SÉLECTION HERO-FIRST
  const routine = [];
  const usedIds = new Set();
  const usedCats = new Set();
  let exfoliantCount = 0;

  // Hero = produit avec meilleur score GLOBAL (toutes catégories confondues)
  const hero = scored.find(p => targetCats.includes(p.categorie) && p.score > 0);
  if (hero) {
    routine.push(hero);
    usedIds.add(hero.id);
    usedCats.add(hero.categorie);
    if (EXFOLIANT_IDS.has(hero.id)) exfoliantCount++;
  }

  // Remplir les catégories restantes autour du hero
  for (const cat of targetCats) {
    if (usedCats.has(cat)) continue;
    const winner = scored.find(p => {
      if (p.categorie !== cat) return false;
      if (usedIds.has(p.id)) return false;
      if (p.score <= 0) return false;
      // Max 1 exfoliant par routine
      if (EXFOLIANT_IDS.has(p.id) && exfoliantCount >= 1) return false;
      return true;
    });
    if (winner) {
      routine.push(winner);
      usedIds.add(winner.id);
      usedCats.add(cat);
      if (EXFOLIANT_IDS.has(winner.id)) exfoliantCount++;
    }
  }

  // 4. SPF auto-ajouté si un produit sélectionné l'exige
  const needsSPF = routine.some(p => p.spf_requis);
  const hasSPF = routine.some(p => p.categorie === 'spf');
  if (needsSPF && !hasSPF) {
    const spf = scored.find(p => p.categorie === 'spf' && !usedIds.has(p.id));
    if (spf) { routine.push(spf); usedIds.add(spf.id); }
  }

  // 5. Tri dans l'ordre logique de la routine
  routine.sort((x, y) => ROUTINE_ORDER.indexOf(x.categorie) - ROUTINE_ORDER.indexOf(y.categorie));

  // 6. UPSELL — basé sur compatible[] du hero
  const upsell = [];
  if (hero && hero.compatible) {
    for (const compId of hero.compatible) {
      if (usedIds.has(compId)) continue;
      const prod = PRODUCTS.find(p => p.id === compId);
      if (prod && prod.adapte_sens.includes(a.sensibilite) && scoreProduct(prod, a) > 0) {
        upsell.push({ ...prod, score: scoreProduct(prod, a) });
      }
      if (upsell.length >= 2) break;
    }
  }
  // Gummies toujours suggérés si budget >= moyen
  if (a.budget !== 'bas' && !usedIds.has('CAG01') && !upsell.find(p => p.id === 'CAG01')) {
    const gummies = PRODUCTS.find(p => p.id === 'CAG01');
    if (gummies && upsell.length < 3) upsell.push(gummies);
  }

  return { routine, upsell, needsSPF, mode, modeInfo, hero };
}

const PB_LABELS = {
  acne: "l'acné et les boutons", taches: "les taches pigmentaires",
  teint_terne: "le teint terne", deshydratation: "la déshydratation",
  imperfections: "les imperfections", eclat: "le manque d'éclat",
  anti_age: "les signes du temps",
};
const PEAU_LABELS = {
  seche: "peau sèche", grasse: "peau grasse", mixte: "peau mixte",
  normale: "peau normale", sensible: "peau sensible",
};
const OBJ_PHRASES = {
  rapide: "avec des résultats rapidement visibles",
  entretien: "pour un entretien quotidien efficace",
  transformation: "pour une vraie transformation de la peau",
};

function generatePitch(p, a) {
  const pb = PB_LABELS[a.probleme_principal] || "votre problème";
  const peau = PEAU_LABELS[a.type_peau] || "votre type de peau";
  const obj = OBJ_PHRASES[a.objectif] || "";
  if (p.problemes.includes(a.probleme_principal) && p.types_peau.includes(a.type_peau))
    return `${p.nom} est la solution ciblée pour traiter ${pb} sur ${peau}, ${obj}.`;
  if (p.problemes.includes(a.probleme_principal))
    return `${p.nom} agit directement sur ${pb} — parfaitement adapté à votre profil ${obj}.`;
  if (p.categorie === 'nettoyant')
    return `Ce nettoyant prépare et respecte votre ${peau} — indispensable pour que les soins actifs fonctionnent.`;
  if (p.categorie === 'spf')
    return `Le SPF 50 est non-négociable avec les actifs utilisés — il protège et maximise les résultats.`;
  if (p.categorie === 'complement')
    return `Ce complément agit de l'intérieur en synergie avec votre routine — pour accélérer les résultats visibles.`;
  return `${p.nom} est parfaitement adapté à votre ${peau} ${obj}.`;
}

function generateWhy(p, a) {
  const reasons = [];
  const pb = PB_LABELS[a.probleme_principal] || "votre problème";
  const peau = PEAU_LABELS[a.type_peau] || "votre type de peau";
  if (p.problemes.includes(a.probleme_principal)) reasons.push(`Cible directement ${pb}`);
  if (p.types_peau.includes(a.type_peau)) reasons.push(`Formulé pour ${peau}`);
  if (a.sensibilite === 'eleve' && p.adapte_sens.includes('eleve'))
    reasons.push(`Bien toléré par les peaux sensibles`);
  if (a.sensibilite !== 'eleve' && p.niveau_puiss === 3)
    reasons.push(`Concentration élevée — résultats accélérés`);
  if (a.objectif === 'rapide' && p.niveau_puiss >= 2) reasons.push(`Action rapide et visible`);
  reasons.push(`Actifs clés : ${p.actifs_cles.slice(0, 3).join(', ')}`);
  return reasons;
}



function generateOpening(a) {
  const sens = a.sensibilite === 'eleve' ? ' sans agresser ta peau' : '';
  const MAP = {
    acne: `Vu ta peau, le plus important pour toi c'est de traiter l'acné${sens} — on a exactement ce qu'il faut.`,
    taches: `Pour toi, la priorité c'est d'uniformiser le teint et atténuer les taches — c'est tout à fait traitable.`,
    deshydratation: `Ta peau manque vraiment d'hydratation — l'objectif c'est de la rééquilibrer en profondeur.`,
    teint_terne: `Ton teint a besoin de retrouver son éclat — ça se règle rapidement avec les bons actifs.`,
    imperfections: `Pour toi c'est avant tout la texture et les imperfections — on va cibler ça directement.`,
    eclat: `Ta peau manque de luminosité — c'est exactement ce qu'on peut régler avec les bons soins.`,
    anti_age: `L'objectif c'est de préserver et raffermir ta peau — on commence par le soin le plus impactant.`,
  };
  return MAP[a.probleme_principal] || `Voici ce que je te recommande en priorité selon ton profil.`;
}

function generateObjection(a) {
  if (a.budget === 'bas')
    return `On commence avec l'essentiel — ce seul produit va déjà faire une vraie différence sur ta peau.`;
  if (a.objectif === 'rapide')
    return `Tu peux déjà commencer avec celui-ci — tu verras la différence en 2-3 semaines.`;
  if (a.objectif === 'transformation')
    return `C'est exactement ce soin qu'il te faut — c'est la base de tout pour transformer ta peau.`;
  return `C'est le produit le plus adapté à ton profil — tu peux y aller en toute confiance.`;
}

