const questions = [
      {
        id: "type_peau",
        number: "Question 01",
        text: "Quel est votre type de peau ?",
        sub: "Si vous hésitez, pensez à l'état de votre peau en milieu de journée sans produit.",
        options: [
          { value: "seche", label: "Sèche", desc: "Tiraillements, inconfort, zones rugueuses", emoji: "🏜️" },
          { value: "grasse", label: "Grasse", desc: "Brillance, pores dilatés, excès de sébum", emoji: "💧" },
          { value: "mixte", label: "Mixte", desc: "Zone T grasse, joues normales à sèches", emoji: "⚖️" },
          { value: "normale", label: "Normale", desc: "Équilibrée, peu de problèmes visibles", emoji: "✨" },
          { value: "sensible", label: "Sensible", desc: "Rougeurs, réactivité, inconfort fréquent", emoji: "🌸" },
        ]
      },
      {
        id: "probleme_principal",
        number: "Question 02",
        text: "Quel est votre problème principal ?",
        sub: "Choisissez celui qui vous préoccupe le plus au quotidien.",
        options: [
          { value: "acne", label: "Acné / Boutons", desc: "Imperfections récurrentes, peau congestionnée", emoji: "🔴" },
          { value: "taches", label: "Taches pigmentaires", desc: "Hyperpigmentation, marques, teint irrégulier", emoji: "🎯" },
          { value: "teint_terne", label: "Teint terne", desc: "Manque de luminosité, peau fatiguée", emoji: "😶" },
          { value: "deshydratation", label: "Déshydratation", desc: "Peau qui tire, manque d'eau", emoji: "💦" },
          { value: "imperfections", label: "Imperfections", desc: "Pores, texture irrégulière, grain de peau", emoji: "🔍" },
          { value: "eclat", label: "Manque d'éclat", desc: "Peau terne sans problème majeur", emoji: "🌟" },
          { value: "anti_age", label: "Anti-âge", desc: "Rides, perte de fermeté, relâchement", emoji: "⏳" },
        ]
      },
      {
        id: "sensibilite",
        number: "Question 03",
        text: "Quel est votre niveau de sensibilité cutanée ?",
        sub: "Pensez à la réaction de votre peau face à de nouveaux produits.",
        options: [
          { value: "faible", label: "Faible", desc: "Ma peau tolère bien les nouveaux produits", emoji: "💪" },
          { value: "moyen", label: "Moyen", desc: "Parfois des réactions avec certains actifs", emoji: "⚠️" },
          { value: "eleve", label: "Élevé", desc: "Rougeurs et irritations fréquentes", emoji: "🛑" },
        ]
      },
      {
        id: "objectif",
        number: "Question 04",
        text: "Quel est votre objectif ?",
        sub: "Il n'y a pas de mauvaise réponse — chaque objectif a sa routine.",
        options: [
          { value: "rapide", label: "Résultat rapide", desc: "Je veux voir des changements vite", emoji: "⚡" },
          { value: "entretien", label: "Entretien", desc: "Maintenir ma peau en bon état", emoji: "🌿" },
          { value: "transformation", label: "Transformation profonde", desc: "Je veux vraiment transformer ma peau", emoji: "🦋" },
        ]
      },
      {
        id: "routine_actuelle",
        number: "Question 05",
        text: "Quelle est votre routine actuelle ?",
        sub: "Soyez honnête, ça nous aide à adapter nos conseils.",
        options: [
          { value: "aucune", label: "Aucune", desc: "Pas de routine définie", emoji: "🆕" },
          { value: "simple", label: "Simple", desc: "Nettoyant + crème, basique", emoji: "📋" },
          { value: "complete", label: "Complète", desc: "Nettoyant, sérum, crème, SPF...", emoji: "📚" },
        ]
      },
      {
        id: "budget",
        number: "Question 06",
        text: "Quel budget souhaitez-vous investir ?",
        sub: "Pour votre routine mensuelle complète.",
        options: [
          { value: "bas", label: "Essentiel", desc: "Moins de 50€ — les indispensables", emoji: "🪙" },
          { value: "moyen", label: "Confort", desc: "50€ à 100€ — une routine solide", emoji: "💰" },
          { value: "eleve", label: "Premium", desc: "Plus de 100€ — la routine complète", emoji: "👑" },
        ]
      },
      {
        id: "preference_routine",
        number: "Question 07",
        text: "Quelle routine vous correspond ?",
        sub: "Simple ne veut pas dire moins efficace.",
        options: [
          { value: "simple", label: "Routine simple", desc: "3-4 produits max, rapide et efficace", emoji: "🎯" },
          { value: "complete", label: "Routine complète", desc: "5+ produits, un vrai rituel beauté", emoji: "🧖" },
        ]
      },
      {
        id: "frequence",
        number: "Question 08",
        text: "À quelle fréquence souhaitez-vous vous en occuper ?",
        sub: "Dernière question — on y est presque.",
        options: [
          { value: "minimum", label: "Minimum", desc: "Le strict nécessaire, peu de temps", emoji: "⏱️" },
          { value: "normal", label: "Normal", desc: "Matin et soir, routine régulière", emoji: "🕐" },
          { value: "intensif", label: "Intensif", desc: "Masques, gommages, soins hebdo inclus", emoji: "🔥" },
        ]
      },
    ];