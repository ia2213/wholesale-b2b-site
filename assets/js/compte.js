let currentSession = null;

function showTab(tab) {
  document.querySelectorAll('.compte-tab').forEach(t => t.style.display = 'none');
  const el = document.getElementById('tab-' + tab);
  if (el) el.style.display = 'block';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`[data-tab="${tab}"]`);
  if (btn) btn.classList.add('active');
}

function renderPanier() {
  const cont = document.getElementById('panierContainer');
  if (!cont) return;
  if (!panier.length) { cont.innerHTML = '<p>Votre panier est vide.</p>'; return; }
  let total = 0;
  const lignes = panier.map((item, idx) => {
    const sousTotal = item.prix_unitaire * item.quantite;
    total += sousTotal;
    return `<tr>
      <td>${item.titre}</td><td>${item.quantite}</td>
      <td>${formatPrix(item.prix_unitaire)}</td><td>${formatPrix(sousTotal)}</td>
      <td><button onclick="supprimerLigne(${idx})" class="btn-outline">Supprimer</button></td>
    </tr>`;
  }).join('');
  cont.innerHTML = `<table class="table">
    <thead><tr><th>Produit</th><th>Quantité</th><th>Prix unitaire</th><th>Sous-total</th><th></th></tr></thead>
    <tbody>${lignes}</tbody>
    <tfoot><tr><th colspan="3">Total HT estimé</th><th>${formatPrix(total)}</th><th></th></tr></tfoot>
  </table>`;
}

function supprimerLigne(index) {
  panier.splice(index, 1);
  localStorage.setItem('panier', JSON.stringify(panier));
  renderPanier();
}

async function validerCommande() {
  const societe = document.getElementById('societe')?.value.trim();
  const email = currentSession?.user.email;
  const adresse = document.getElementById('adresse')?.value.trim();
  const msg = document.getElementById('messageCommande');
  if (!panier.length) { msg.innerHTML = '<div class="alert alert-error">Votre panier est vide.</div>'; return; }
  if (!societe || !adresse) { msg.innerHTML = '<div class="alert alert-error">Renseignez la société et l\'adresse.</div>'; return; }
  const total = panier.reduce((acc, i) => acc + i.prix_unitaire * i.quantite, 0);
  const { data: commande, error } = await window.sb.from('commandes').insert({
    user_id: currentSession.user.id, societe, email, adresse, total, statut: 'en_attente'
  }).select().single();
  if (error) { msg.innerHTML = `<div class="alert alert-error">Erreur : ${error.message}</div>`; return; }
  await window.sb.from('lignes_commande').insert(
    panier.map(item => ({ commande_id: commande.id, produit_id: item.id, titre: item.titre, quantite: item.quantite, prix_unitaire: item.prix_unitaire }))
  );
  panier = [];
  localStorage.setItem('panier', JSON.stringify(panier));
  renderPanier();
  msg.innerHTML = `<div class="alert alert-success">Commande <strong>CMD-${commande.id}</strong> enregistrée ! Confirmation envoyée à ${email}.</div>`;
}

async function chargerCommandes() {
  const cont = document.getElementById('commandesContainer');
  if (!cont || !currentSession) return;
  const { data, error } = await window.sb.from('commandes').select('*, lignes_commande(*)').eq('user_id', currentSession.user.id).order('created_at', { ascending: false });
  if (error || !data?.length) { cont.innerHTML = '<p>Aucune commande pour le moment.</p>'; return; }
  cont.innerHTML = data.map(c => `
    <div class="card">
      <strong>CMD-${c.id}</strong> — ${new Date(c.created_at).toLocaleDateString('fr-FR')}
      <span class="badge" style="margin-left:0.5rem;">${c.statut.replace('_',' ')}</span>
      <div style="font-size:0.85rem;margin-top:0.5rem;color:#4b5563;">Total : ${formatPrix(c.total)} — ${c.lignes_commande.length} ligne(s)</div>
    </div>
  `).join('');
}

async function connexion() {
  const email = document.getElementById('loginEmail').value.trim();
  const mdp = document.getElementById('loginMdp').value;
  const msg = document.getElementById('msgLogin');
  const { error } = await window.sb.auth.signInWithPassword({ email, password: mdp });
  if (error) { msg.innerHTML = `<div class="alert alert-error">${error.message}</div>`; return; }
  window.location.reload();
}

async function inscription() {
  const email = document.getElementById('regEmail').value.trim();
  const mdp = document.getElementById('regMdp').value;
  const societe = document.getElementById('regSociete').value.trim();
  const msg = document.getElementById('msgReg');
  if (!email || !mdp || !societe) { msg.innerHTML = '<div class="alert alert-error">Tous les champs sont requis.</div>'; return; }
  const { data, error } = await window.sb.auth.signUp({ email, password: mdp });
  if (error) { msg.innerHTML = `<div class="alert alert-error">${error.message}</div>`; return; }
  if (data.user) {
    await window.sb.from('profiles').upsert({ id: data.user.id, email, societe });
  }
  msg.innerHTML = '<div class="alert alert-success">Compte créé ! Vérifiez votre e-mail pour confirmer votre inscription.</div>';
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab));
  });
  const hash = window.location.hash;
  if (hash === '#inscription') showTab('inscription');
  else showTab('connexion');

  onSupabaseReady(async () => {
    const { data: { session } } = await window.sb.auth.getSession();
    currentSession = session;
    if (session) {
      showTab('panier');
      const { data: profile } = await window.sb.from('profiles').select('*').eq('id', session.user.id).single();
      if (profile) {
        const s = document.getElementById('societe');
        const a = document.getElementById('adresse');
        if (s) s.value = profile.societe || '';
        if (a) a.value = profile.adresse || '';
      }
      renderPanier();
      chargerCommandes();
    }
    document.getElementById('btnValiderCommande')?.addEventListener('click', validerCommande);
    document.getElementById('btnLogin')?.addEventListener('click', connexion);
    document.getElementById('btnReg')?.addEventListener('click', inscription);
  });
});
