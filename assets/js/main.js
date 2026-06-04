function renderHeader(active) {
  const header = document.querySelector('header');
  if (!header) return;
  header.innerHTML = `
    <div class="navbar">
      <div class="nav-brand">
        <div class="nav-brand-icon">B2B</div>
        <div>
          <div class="nav-brand-name">Wholesale Hub</div>
          <div class="nav-brand-sub">Vente en gros B2B</div>
        </div>
      </div>
      <button class="burger" id="burgerBtn" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
      <nav class="nav-links" id="navLinks">
        <a href="index.html" class="${active === 'accueil' ? 'active' : ''}">Accueil</a>
        <a href="catalogue.html" class="${active === 'catalogue' ? 'active' : ''}">Catalogue</a>
        <a href="faq.html" class="${active === 'faq' ? 'active' : ''}">FAQ</a>
        <a href="blog.html" class="${active === 'blog' ? 'active' : ''}">Blog</a>
        <a href="compte.html" class="${active === 'compte' ? 'active' : ''}">Compte</a>
      </nav>
      <div class="nav-right" id="navAuth">
        <span style="font-size:0.8rem;color:#94a3b8;">Chargement...</span>
      </div>
    </div>
  `;

  // Burger toggle
  document.getElementById('burgerBtn')?.addEventListener('click', () => {
    document.getElementById('navLinks')?.classList.toggle('open');
  });

  onSupabaseReady(async () => {
    const { data: { session } } = await window.sb.auth.getSession();
    const navAuth = document.getElementById('navAuth');
    if (!navAuth) return;

    if (session) {
      const { data: profile } = await window.sb.from('profiles').select('role,societe').eq('id', session.user.id).single();
      const isAdmin = profile && profile.role === 'admin';
      navAuth.innerHTML = `
        ${isAdmin ? '<a href="admin.html" class="btn-danger" style="font-size:0.82rem;padding:0.4rem 0.8rem;">⚙️ Admin</a>' : ''}
        <span style="font-size:0.82rem;color:var(--text-muted);display:none;" class="nav-user-name">${profile?.societe || session.user.email}</span>
        <a href="compte.html" class="btn-outline" style="font-size:0.82rem;padding:0.4rem 0.8rem;">Mon compte</a>
        <button class="btn-primary" style="font-size:0.82rem;padding:0.4rem 0.8rem;" onclick="deconnexion()">Déconnexion</button>
      `;
      // Affiche le nom sur grand écran
      if (window.innerWidth > 768) {
        navAuth.querySelector('.nav-user-name').style.display = 'inline';
      }
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
      <div>
        <strong style="color:white;">B2B Wholesale Hub</strong><br>
        <span style="font-size:0.78rem;">© ${year} Tous droits réservés.</span>
      </div>
      <div style="display:flex;gap:1.5rem;flex-wrap:wrap;">
        <a href="faq.html">FAQ</a>
        <a href="blog.html">Blog</a>
        <a href="catalogue.html">Catalogue</a>
      </div>
      <div style="font-size:0.82rem;">contact@b2b-wholesale-hub.com</div>
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
