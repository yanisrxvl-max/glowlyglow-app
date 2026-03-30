/* APP ENTRY & STATE */

let current = 0;
let transitioning = false;
const answers = {};
let PRODUCTS = [];

// Initialize application
async function initApp() {
  try {
    const response = await fetch('data/products.json');
    PRODUCTS = await response.json();
    renderQuestions();
  } catch (e) {
    console.error("Failed to load products: ", e);
    alert("Erreur de chargement de la base de données produits.");
  }
}

document.addEventListener('DOMContentLoaded', initApp);

// PWA Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => { });
}
