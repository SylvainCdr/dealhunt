import mongoose from "mongoose";

const DealSchema = new mongoose.Schema({
  // Identifiant unique du produit sur la source
  sourceId: { type: String, required: true },
  // Source du deal : aliexpress, amazon, ebay, awin, manual
  source: {
    type: String,
    required: true,
    enum: ["aliexpress", "amazon", "ebay", "awin", "manual"],
  },
  title: { type: String, required: true },
  description: String,
  image: String,
  // Prix actuel
  price: { type: Number, required: true },
  // Prix barré (ancien prix)
  originalPrice: Number,
  // Pourcentage de réduction calculé
  discount: Number,
  currency: { type: String, default: "EUR" },
  // Lien affilié complet
  affiliateUrl: { type: String, required: true },
  // Catégorie du produit
  category: String,
  // Note moyenne (ex: 4.5)
  rating: Number,
  // Nombre de commandes/avis
  orders: Number,
  // Mis en avant manuellement (Option 3: curation)
  featured: { type: Boolean, default: false },
  // Nombre de clics trackés
  clicks: { type: Number, default: 0 },
  // Actif ou non (pour masquer sans supprimer)
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index composé pour éviter les doublons par source
DealSchema.index({ sourceId: 1, source: 1 }, { unique: true });
// Index pour les requêtes front
DealSchema.index({ category: 1, active: 1 });
DealSchema.index({ featured: 1, active: 1 });

export default mongoose.models.Deal || mongoose.model("Deal", DealSchema);
