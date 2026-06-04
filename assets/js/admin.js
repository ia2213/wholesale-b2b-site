document.addEventListener('DOMContentLoaded', () => {
  onSupabaseReady(async () => {
    const isAdmin = await verifierAdmin();
    if (!isAdmin) {
      document.getElementById('adminContent').style.display = 'none';
      document.getElementById('adminBlocked').style.display = 'block';
      return;
    }
    document.getElementById('adminContent').style.display = 'block';
    document.getElementById('adminBlocked').style.display = 'none';
    chargerProduitsAdmin();

    document.getElementById('formProduit').addEventListener('submit', async e => {
      e.preventDefault();
      const idHidden = document.getElementById('produitId').value;
      const data = {
        titre: document.getElementById('titreProduit').value.trim(),
        description: document.getElementById('descriptionProduit').value.trim(),
        prix_unitaire: Number(document.getElementById('prixProduit').value),
        quantite_min: Number(document.getElementById('quantiteMinProduit').value),
        categorie: document.getElementById('categorieProduit').value.trim(),
        image_url: document.getElementById('imageProduit').value.trim() || 'https://via.placeholder.com/400x300?text=Produit',
        actif: true
      };
      let error;
      if (idHidden) {
        ({ error } = await window.sb.from('produits').update(data).eq('id', idHidden));
      } else {
        ({ error } = await window.sb.from('produits').insert(data));
      }
      const msgEl = document.getElementById('messageAdmin');
      if (error) {
        msgEl.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
      } else {
        msgEl.innerHTML = `<div class="alert alert-success">Produit ${idHidden ? 'mis à jour' : 'ajouté'} avec succès.</div>`;
        resetForm();
        chargerProduitsAdmin();
      }
    });
  });
});

async function chargerProduitsAdmin() {
  const cont = document.getElementById('listeProduitsAdmin');
  const { data, error } = await window.sb.from('produits').select('*').order('id');
  if (error || !data?.length) { cont.innerHTML = '<p>Aucun produit.</p>'; return; }
  cont.innerHTML = `<table class="table">
    <thead><tr><th>ID</th><th>Titre</th><th>Catégorie</th><th>Prix</th><th>Qté mini</th><th>Actif</th><th>Actions</th></tr></thead>
    <tbody>${data.map(p => `<tr>
      <td>${p.id}</td><td>${p.titre}</td><td>${p.categorie || ''}</td>
      <td>${formatPrix(p.prix_unitaire)}</td><td>${p.quantite_min}</td>
      <td>${p.actif ? '✅' : '❌'}</td>
      <td>
        <button class="btn-outline" onclick="editerProduit(${p.id})">Éditer</button>
        <button class="btn-outline" onclick="toggleActif(${p.id}, ${p.actif})">${p.actif ? 'Désactiver' : 'Activer'}</button>
      </td>
    </tr>`).join('')}</tbody>
  </table>`;
}

async function toggleActif(id, actuel) {
  await window.sb.from('produits').update({ actif: !actuel }).eq('id', id);
  chargerProduitsAdmin();
}

async function editerProduit(id) {
  const { data: p } = await window.sb.from('produits').select('*').eq('id', id).single();
  if (!p) return;
  document.getElementById('produitId').value = p.id;
  document.getElementById('titreProduit').value = p.titre;
  document.getElementById('descriptionProduit').value = p.description || '';
  document.getElementById('prixProduit').value = p.prix_unitaire;
  document.getElementById('quantiteMinProduit').value = p.quantite_min;
  document.getElementById('categorieProduit').value = p.categorie || '';
  document.getElementById('imageProduit').value = p.image_url || '';
}

function resetForm() {
  ['produitId','titreProduit','descriptionProduit','prixProduit','quantiteMinProduit','categorieProduit','imageProduit']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}
