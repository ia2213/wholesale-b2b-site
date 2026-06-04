function renderProduits(liste) {
  const cont = document.getElementById("listeProduits");
  if (!cont) return;
  if (!liste.length) {
    cont.innerHTML = "<p>Aucun produit ne correspond à vos filtres.</p>";
    return;
  }
  cont.innerHTML = liste.map(p => `
    <article class="card product-card">
      <img src="${p.image}" alt="${p.titre}">
      <h3>${p.titre}</h3>
      <div class="product-meta">${p.categorie}</div>
      <div class="product-meta">Quantité min : ${p.quantiteMin} unités</div>
      <div class="product-price">${formatPrix(p.prixUnitaire)} / unité</div>
      <div class="product-actions">
        <input type="number" min="${p.quantiteMin}" value="${p.quantiteMin}" id="qte-${p.id}" style="max-width:90px;">
        <button class="btn-primary" onclick="ajouterAuPanierDepuisCatalogue(${p.id})">Ajouter</button>
      </div>
    </article>
  `).join("");
}

function appliquerFiltres() {
  const cat = document.getElementById("categorie").value;
  const minQ = Number(document.getElementById("minQuantite").value);
  let liste = [...produits];
  if (cat) liste = liste.filter(p => p.categorie === cat);
  if (!Number.isNaN(minQ) && minQ > 0) liste = liste.filter(p => p.quantiteMin >= minQ);
  renderProduits(liste);
}

function ajouterAuPanierDepuisCatalogue(idProduit) {
  const input = document.getElementById(`qte-${idProduit}`);
  if (!input) return;
  ajouterAuPanier(idProduit, Number(input.value));
}

document.addEventListener("DOMContentLoaded", () => {
  renderProduits(produits);
  const form = document.getElementById("filtreForm");
  form.addEventListener("submit", e => { e.preventDefault(); appliquerFiltres(); });
});