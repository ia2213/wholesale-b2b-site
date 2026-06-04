function renderProduits(liste) {
  const cont = document.getElementById('listeProduits');
  if (!cont) return;
  if (!liste.length) { cont.innerHTML = '<p>Aucun produit ne correspond à vos filtres.</p>'; return; }
  cont.innerHTML = liste.map(p => `
    <article class="card product-card">
      <img src="${p.image_url || 'https://via.placeholder.com/400x300?text=Produit'}" alt="${p.titre}">
      <h3>${p.titre}</h3>
      <div class="product-meta">${p.categorie || ''}</div>
      <div class="product-meta">Quantité min : ${p.quantite_min} unités</div>
      <div class="product-price">${formatPrix(p.prix_unitaire)} / unité</div>
      <div class="product-actions">
        <input type="number" min="${p.quantite_min}" value="${p.quantite_min}" id="qte-${p.id}" style="max-width:90px;">
        <button class="btn-primary" onclick="ajouterDepuisCatalogue(${p.id})">Ajouter</button>
      </div>
    </article>
  `).join('');
}

function ajouterDepuisCatalogue(idProduit) {
  const produit = produits.find(p => p.id === idProduit);
  if (!produit) return;
  const input = document.getElementById(`qte-${idProduit}`);
  ajouterAuPanier(idProduit, Number(input.value), produit);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('filtreForm');
  if (form) form.addEventListener('submit', e => { e.preventDefault(); appliquerFiltres(); });
  onSupabaseReady(async () => {
    const { data, error } = await window.sb.from('produits').select('*').eq('actif', true).order('id');
    if (error) { console.error(error); return; }
    produits = data || [];
    renderProduits(produits);
  });
});

function appliquerFiltres() {
  const cat = document.getElementById('categorie').value;
  const minQ = Number(document.getElementById('minQuantite').value);
  let liste = [...produits];
  if (cat) liste = liste.filter(p => p.categorie === cat);
  if (!Number.isNaN(minQ) && minQ > 0) liste = liste.filter(p => p.quantite_min >= minQ);
  renderProduits(liste);
}
