function renderPanier() {
  const cont = document.getElementById("panierContainer");
  if (!cont) return;
  if (!panier.length) { cont.innerHTML = "<p>Votre panier est vide.</p>"; return; }
  let total = 0;
  const lignes = panier.map((item, idx) => {
    const sousTotal = item.prixUnitaire * item.quantite;
    total += sousTotal;
    return `<tr>
      <td>${item.titre}</td>
      <td>${item.quantite}</td>
      <td>${formatPrix(item.prixUnitaire)}</td>
      <td>${formatPrix(sousTotal)}</td>
      <td><button onclick="supprimerLigne(${idx})" class="btn-outline">Supprimer</button></td>
    </tr>`;
  }).join("");
  cont.innerHTML = `<table class="table">
    <thead><tr><th>Produit</th><th>Quantité</th><th>Prix unitaire</th><th>Sous-total</th><th></th></tr></thead>
    <tbody>${lignes}</tbody>
    <tfoot><tr><th colspan="3">Total HT estimé</th><th>${formatPrix(total)}</th><th></th></tr></tfoot>
  </table>`;
}

function supprimerLigne(index) {
  panier.splice(index, 1);
  localStorage.setItem("panier", JSON.stringify(panier));
  renderPanier();
}

function validerCommande() {
  const societe = document.getElementById("societe").value.trim();
  const email = document.getElementById("email").value.trim();
  const adresse = document.getElementById("adresse").value.trim();
  const msg = document.getElementById("messageCommande");
  if (!panier.length) { msg.innerHTML = '<div class="alert alert-error">Votre panier est vide.</div>'; return; }
  if (!societe || !email || !adresse) { msg.innerHTML = '<div class="alert alert-error">Merci de renseigner la société, l\'e-mail et l\'adresse.</div>'; return; }
  const numeroCommande = "CMD-" + Date.now();
  localStorage.setItem("derniereCommande", JSON.stringify({ numero: numeroCommande, panier, societe, email, adresse, date: new Date().toISOString() }));
  panier = [];
  localStorage.setItem("panier", JSON.stringify(panier));
  renderPanier();
  msg.innerHTML = `<div class="alert alert-success">Merci ${societe}, votre commande <strong>${numeroCommande}</strong> a été enregistrée. Un e-mail de confirmation sera envoyé à ${email}.</div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  renderPanier();
  document.getElementById("btnValiderCommande").addEventListener("click", validerCommande);
});