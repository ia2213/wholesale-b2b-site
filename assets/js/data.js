const produits = [
  {
    id: 1,
    titre: "Lot de 100 T-shirts coton",
    description: "T-shirts 100% coton, tailles assorties, parfaits pour la revente.",
    prixUnitaire: 3.5,
    quantiteMin: 100,
    image: "https://via.placeholder.com/400x300?text=T-shirts+coton",
    categorie: "Textile"
  },
  {
    id: 2,
    titre: "Palette de 50 cartons A4",
    description: "Cartons de déménagement format A4, très résistants.",
    prixUnitaire: 1.2,
    quantiteMin: 50,
    image: "https://via.placeholder.com/400x300?text=Cartons+A4",
    categorie: "Emballage"
  },
  {
    id: 3,
    titre: "Lot de 200 stylos professionnels",
    description: "Stylos bille noirs, encre longue durée, conditionnés par 200.",
    prixUnitaire: 0.45,
    quantiteMin: 200,
    image: "https://via.placeholder.com/400x300?text=Stylos+pro",
    categorie: "Fournitures"
  }
];

let panier = JSON.parse(localStorage.getItem("panier")) || [];