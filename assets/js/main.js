function renderHeader(active) {
  const header = document.querySelector('header');
  if (!header) return;
  header.innerHTML = `
    <div class="navbar">
      <div class="nav-left">
        <div>
          <div style="font-weight:600;font-size:1.1rem;">B2B Wholesale Hub</div>
          <div style="font-size:0.78rem;color:#6b7280;">Vente de produits en gros</div>
        </div>
      </div>
      <nav class="nav-links">
        <a href="index.html" class="${active === 'accueil' ? 'active' : ''}">Accueil</a>
        <a href="catalogue.html" class="${active === 'catalogue' ? 'active' : ''}">Catalogue</a>
        <a href="faq.html" class="${active === 'faq' ? 'active' : ''}">FAQ</a>
        <a href="blog.html" class="${active === 'blog' ? 'active' : ''}">Blog</a>
        <a href="compte.html" class="${active === 'compte' ? 'active' : ''}">Compte</a>
      </nav>
      <div class="nav-right" id="navAuth">
        <a href="compte.html" class="btn-primary">Mon compte</a>
      </div>
    </div>
  `;
  onSupabaseReady(async () => {
    const { data: { session } } = await window.sb.auth.getSession();
    const navAuth = document.getElementById('navAuth');
    if (!navAuth) return;
    if (session) {
      const { data: profile } = await window.sb.from('profiles').select('role,societe').eq('id', session.user.id).single();
      const isAdmin = profile && profile.role === 'admin';
      navAuth.innerHTML = `
        ${isAdmin ? '<a href="admin.html" class="btn-outline" style="color:#dc2626;border-color:#dc2626;">⚙ Admin</a>' : ''}
        <span style="font-size:0.85rem;color:#4b5563;">${profile?.societe || session.user.email}</span>
        <button class="btn-outline" onclick="deconnexion()">Déconnexion</button>
      `;
    } else {
      navAuth.innerHTML = `
        <a href="compte.html" class="btn-outline">Se connecter</a>
        <a href="compte.html#inscription" class="btn-primary">Créer un compte</a>
      `;
    }
  });
}

async function deconnexion() {
  await window.sb.auth.signOut();
  localStorage.removeItem('panier');
  window.location.href = 'index.html';
}

function renderFooter() {
  const footer = document.querySelector('footer');
  if (!footer) return;
  const year = new Date().getFullYear();
  footer.innerHTML = `
    <div class="footer-inner">
      <div>© ${year} B2B Wholesale Hub. Tous droits réservés.</div>
      <div>Contact : contact@b2b-wholesale-hub.com</div>
    </div>
  `;
}

function ajouterAuPanier(idProduit, quantiteCommande, produit) {
  const quantite = Number(quantiteCommande);
  if (Number.isNaN(quantite) || quantite < produit.quantite_min) {
    alert(`Quantité minimale : ${produit.quantite_min} unités.`);
    return;
  }
  const existant = panier.find(item => item.id === idProduit);
  if (existant) {
    existant.quantite += quantite;
  } else {
    panier.push({ id: produit.id, titre: produit.titre, prix_unitaire: produit.prix_unitaire, quantite });
  }
  localStorage.setItem('panier', JSON.stringify(panier));
  alert('Produit ajouté au panier !');
}

function formatPrix(valeur) {
  return Number(valeur).toFixed(2).replace('.', ',') + ' €';
}

async function verifierAdmin() {
  return new Promise(resolve => {
    onSupabaseReady(async () => {
      const { data: { session } } = await window.sb.auth.getSession();
      if (!session) { resolve(false); return; }
      const { data: profile } = await window.sb.from('profiles').select('role').eq('id', session.user.id).single();
      resolve(profile && profile.role === 'admin');
    });
  });
}
