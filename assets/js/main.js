function renderHeader(active) {
  const header = document.querySelector("header");
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
        <a href="admin.html" class="${active === 'admin' ? 'active' : ''}">Admin</a>
      </nav>
      <div class="nav-right">
        <a href="catalogue.html" class="btn-outline">Catalogue</a>
        <a href="compte.html" class="btn-primary">Mon compte</a>
      </div>
    </div>
  `;
}

function renderFooter() {
  const footer = document.querySelector("footer");
  if (!footer) return;
  const year = new Date().getFullYear();
  footer.innerHTML = `
    <div class="footer-inner">
      <div>© ${year} B2B Wholesale Hub. Tous droits réservés.</div>
      <div>Contact : contact@b2b-wholesale-hub.com</div>
    </div>
  `;
}

function ajouterAuPanier(idProduit, quantiteCommande) {
  const produit = produits.find(p => p.id === idProduit);
  if (!produit) return;
  const quantite = Number(quantiteCommande);
  if (Number.isNaN(quantite) || quantite < produit.quantiteMin) {
    alert(`Quantité minimale pour ce produit : ${produit.quantiteMin} unités.`);
    return;
  }
  const existant = panier.find(item => item.id === idProduit);
  if (existant) {
    existant.quantite += quantite;
  } else {
    panier.push({ id: produit.id, titre: produit.titre, prixUnitaire: produit.prixUnitaire, quantite });
  }
  localStorage.setItem("panier", JSON.stringify(panier));
  alert("Produit ajouté au panier !");
}

function formatPrix(valeur) {
  return valeur.toFixed(2).replace(".", ",") + " €";
}