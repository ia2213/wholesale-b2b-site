let produitsAdmin = JSON.parse(localStorage.getItem("produitsAdmin")) || JSON.parse(JSON.stringify(produits));

function sauvegarderProduits() { localStorage.setItem("produitsAdmin", JSON.stringify(produitsAdmin)); }

function syncProduitsGlobaux() {
  if (Array.isArray(produitsAdmin)) {
    produits.length = 0;
    produitsAdmin.forEach(p => produits.push(p));
  }
}

function renderProduitsAdmin() {
  const cont = document.getElementById("listeProduitsAdmin");
  if (!cont) return;
  if (!produitsAdmin.length) { cont.innerHTML = "<p>Aucun produit.</p>"; return; }
  cont.innerHTML = `<table class="table">
    <thead><tr><th>ID</th><th>Titre</th><th>Catégorie</th><th>Prix</th><th>Qté mini</th><th>Actions</th></tr></thead>
    <tbody>${produitsAdmin.map(p => `<tr>
      <td>${p.id}</td><td>${p.titre}</td><td>${p.categorie || ''}</td>
      <td>${formatPrix(p.prixUnitaire)}</td><td>${p.quantiteMin}</td>
      <td>
        <button class="btn-outline" onclick="editerProduit(${p.id})">Éditer</button>
        <button class="btn-outline" onclick="supprimerProduit(${p.id})">Supprimer</button>
      </td>
    </tr>`).join('')}</tbody>
  </table>`;
}

function resetForm() {
  ['produitId','titreProduit','descriptionProduit','prixProduit','quantiteMinProduit','categorieProduit','imageProduit'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function editerProduit(id) {
  const p = produitsAdmin.find(x => x.id === id);
  if (!p) return;
  document.getElementById('produitId').value = p.id;
  document.getElementById('titreProduit').value = p.titre;
  document.getElementById('descriptionProduit').value = p.description;
  document.getElementById('prixProduit').value = p.prixUnitaire;
  document.getElementById('quantiteMinProduit').value = p.quantiteMin;
  document.getElementById('categorieProduit').value = p.categorie || '';
  document.getElementById('imageProduit').value = p.image || '';
}

function supprimerProduit(id) {
  if (!confirm('Supprimer ce produit ?')) return;
  produitsAdmin = produitsAdmin.filter(p => p.id !== id);
  sauvegarderProduits();
  syncProduitsGlobaux();
  renderProduitsAdmin();
}

function afficherMessageAdmin(type, texte) {
  const zone = document.getElementById('messageAdmin');
  if (!zone) return;
  zone.innerHTML = `<div class="alert alert-${type === 'success' ? 'success' : 'error'}">${texte}</div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  syncProduitsGlobaux();
  renderProduitsAdmin();
  document.getElementById('formProduit').addEventListener('submit', e => {
    e.preventDefault();
    const idHidden = document.getElementById('produitId').value;
    const titre = document.getElementById('titreProduit').value.trim();
    const description = document.getElementById('descriptionProduit').value.trim();
    const prix = Number(document.getElementById('prixProduit').value);
    const quantiteMin = Number(document.getElementById('quantiteMinProduit').value);
    const categorie = document.getElementById('categorieProduit').value.trim();
    const image = document.getElementById('imageProduit').value.trim() || 'https://via.placeholder.com/400x300?text=Produit';
    if (!titre || !description || Number.isNaN(prix) || Number.isNaN(quantiteMin)) {
      afficherMessageAdmin('error', 'Merci de renseigner tous les champs obligatoires.');
      return;
    }
    if (idHidden) {
      const p = produitsAdmin.find(x => String(x.id) === String(idHidden));
      if (p) Object.assign(p, { titre, description, prixUnitaire: prix, quantiteMin, categorie, image });
      afficherMessageAdmin('success', 'Produit mis à jour.');
    } else {
      const newId = produitsAdmin.length ? Math.max(...produitsAdmin.map(x => x.id)) + 1 : 1;
      produitsAdmin.push({ id: newId, titre, description, prixUnitaire: prix, quantiteMin, categorie, image });
      afficherMessageAdmin('success', 'Produit ajouté avec succès.');
    }
    sauvegarderProduits();
    syncProduitsGlobaux();
    renderProduitsAdmin();
    resetForm();
  });
});