function renderHeader(active) {
  const header = document.querySelector('header');
  if (!header) return;
  header.innerHTML = `
    <div class="navbar">
      <a href="index.html" class="nav-brand">
        <div class="nav-brand-icon">W</div>
        <span class="nav-brand-name">WholesaleHub</span>
      </a>

      <div class="nav-center" id="navCenter">
        <nav class="nav-links" id="navLinks">
          <a href="index.html" class="${active === 'accueil' ? 'active' : ''}">Accueil</a>
          <a href="catalogue.html" class="${active === 'catalogue' ? 'active' : ''}">Catalogue</a>
          <a href="faq.html" class="${active === 'faq' ? 'active' : ''}">FAQ</a>
          <a href="blog.html" class="${active === 'blog' ? 'active' : ''}">Ressources</a>
          <a href="compte.html" class="${active === 'compte' ? 'active' : ''}">Mon compte</a>
        </nav>
      </div>

      <div class="nav-right" id="navAuth">
        <span class="nav-right-placeholder btn-outline">Chargement</span>
        <span class="nav-right-placeholder btn-primary">Chargement</span>
      </div>

      <button class="burger" id="burgerBtn" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  `;

  document.getElementById('burgerBtn')?.addEventListener('click', () => {
    document.getElementById('navCenter')?.classList.toggle('open');
  });

  onSupabaseReady(async () => {
    const { data: { session } } = await window.sb.auth.getSession();
    const navAuth = document.getElementById('navAuth');
    if (!navAuth) return;

    if (session) {
      const { data: profile } = await window.sb.from('profiles').select('role,societe').eq('id', session.user.id).single();
      const isAdmin = profile && profile.role === 'admin';
      navAuth.innerHTML = `
        ${isAdmin ? '<a href="admin.html" class="btn-outline btn-sm">⚙ Admin</a>' : ''}
        <span class="nav-user-name">${profile?.societe || session.user.email}</span>
        <a href="compte.html" class="btn-outline btn-sm">Mon espace</a>
        <button class="btn-primary btn-sm" onclick="deconnexion()">Déconnexion</button>
      `;
    } else {
      navAuth.innerHTML = `
        <a href="compte.html" class="btn-outline btn-sm">Connexion</a>
        <a href="compte.html#inscription" class="btn-primary btn-sm">Créer un compte</a>
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
      <div class="footer-top">
        <div>
          <div class="footer-brand-name">
            <div class="footer-brand-icon">W</div>
            WholesaleHub
          </div>
          <p class="footer-desc">La plateforme B2B de référence pour les professionnels. Commandez vos lots, palettes et cartons complets directement en ligne.</p>
          <a href="compte.html#inscription" class="btn-outline btn-sm" style="border-color:rgba(255,255,255,0.25);color:rgba(255,255,255,0.8);display:inline-flex;margin-top:0.25rem;">Ouvrir un compte →</a>
        </div>
        <div class="footer-col">
          <div class="footer-col-title">Plateforme</div>
          <a href="catalogue.html">Catalogue</a>
          <a href="compte.html">Mon compte</a>
          <a href="compte.html#panier">Panier</a>
          <a href="compte.html#commandes">Mes commandes</a>
        </div>
        <div class="footer-col">
          <div class="footer-col-title">Ressources</div>
          <a href="faq.html">FAQ</a>
          <a href="blog.html">Blog</a>
          <a href="blog.html">Guide acheteur</a>
        </div>
        <div class="footer-col">
          <div class="footer-col-title">Contact</div>
          <a href="mailto:contact@wholesalehub.fr">contact@wholesalehub.fr</a>
          <a href="#">Conditions générales</a>
          <a href="#">Politique de confidentialité</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span class="footer-copy">© ${year} WholesaleHub — Tous droits réservés.</span>
        <div class="footer-legal">
          <a href="#">Mentions légales</a>
          <a href="#">CGV</a>
          <a href="#">RGPD</a>
        </div>
      </div>
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
