"use client";

import { useState } from "react";
import { Search, BookMarked, Settings, RefreshCw, Tag, FolderOpen, Star, Bell, LayoutGrid, List, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState<string>("introduction");

  const sections = [
    { id: "introduction", title: "Introduction", icon: BookMarked },
    { id: "getting-started", title: "Démarrage rapide", icon: RefreshCw },
    { id: "synchronization", title: "Synchronisation", icon: RefreshCw },
    { id: "navigation", title: "Navigation", icon: LayoutGrid },
    { id: "organization", title: "Organisation", icon: FolderOpen },
    { id: "features", title: "Fonctionnalités", icon: Star },
    { id: "notifications", title: "Notifications", icon: Bell },
    { id: "settings", title: "Paramètres", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[var(--bh-bg-deep)] text-[var(--bh-text-primary)]">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-[var(--bh-border)] bg-[var(--bh-sidebar-bg)] p-6">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <BookMarked className="h-8 w-8 text-[var(--bh-primary)]" />
            <span className="bg-gradient-to-r from-[var(--bh-primary)] to-[var(--bh-accent-blue)] bg-clip-text text-transparent">
              Favoxia
            </span>
          </div>
          <p className="mt-2 text-sm text-[var(--bh-text-muted)]">Documentation utilisateur</p>
        </div>

        <nav className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                  activeSection === section.id
                    ? "bg-[var(--bh-primary-muted)] text-[var(--bh-primary)]"
                    : "text-[var(--bh-text-secondary)] hover:bg-[var(--bh-glass-bg)] hover:text-[var(--bh-text-primary)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {section.title}
              </button>
            );
          })}
        </nav>

        <div className="mt-8 rounded-lg border border-[var(--bh-border)] bg-[var(--bh-glass-bg)] p-4">
          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--bh-primary)] px-4 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl p-12">
          {/* Introduction */}
          {activeSection === "introduction" && (
            <div className="space-y-6">
              <h1 className="text-4xl font-bold">Bienvenue sur Favoxia</h1>
              <p className="text-lg text-[var(--bh-text-secondary)]">
                Favoxia est votre gestionnaire de favoris centralisé qui synchronise automatiquement vos marque-pages depuis tous vos navigateurs web.
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-6">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--bh-primary-muted)]">
                    <RefreshCw className="h-6 w-6 text-[var(--bh-primary)]" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">Synchronisation automatique</h3>
                  <p className="text-sm text-[var(--bh-text-secondary)]">
                    Importez automatiquement vos favoris depuis Chrome, Firefox, Safari, Edge, Brave et Arc toutes les 15 minutes.
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-6">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--bh-accent-blue)]/10">
                    <FolderOpen className="h-6 w-6 text-[var(--bh-accent-blue)]" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">Organisation intelligente</h3>
                  <p className="text-sm text-[var(--bh-text-secondary)]">
                    Organisez vos favoris avec des tags, collections et dossiers. Arc crée automatiquement des collections depuis vos espaces.
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-6">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--bh-accent-green)]/10">
                    <Search className="h-6 w-6 text-[var(--bh-accent-green)]" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">Recherche puissante</h3>
                  <p className="text-sm text-[var(--bh-text-secondary)]">
                    Trouvez instantanément n'importe quel favori grâce à la recherche par titre, URL ou domaine.
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-6">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--bh-accent-pink)]/10">
                    <Bell className="h-6 w-6 text-[var(--bh-accent-pink)]" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">Notifications en temps réel</h3>
                  <p className="text-sm text-[var(--bh-text-secondary)]">
                    Restez informé des nouvelles synchronisations, collections créées et erreurs éventuelles.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Getting Started */}
          {activeSection === "getting-started" && (
            <div className="space-y-6">
              <h1 className="text-4xl font-bold">Démarrage rapide</h1>
              <p className="text-lg text-[var(--bh-text-secondary)]">
                Commencez à utiliser Favoxia en quelques étapes simples.
              </p>

              <div className="space-y-4">
                <div className="rounded-xl border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bh-primary)] text-sm font-bold text-white">
                      1
                    </div>
                    <h3 className="text-lg font-semibold">Configurez vos navigateurs</h3>
                  </div>
                  <p className="text-sm text-[var(--bh-text-secondary)]">
                    Ouvrez les paramètres (icône ⚙️ en haut à droite) et activez les navigateurs que vous souhaitez synchroniser. Par défaut, Chrome et Firefox sont activés.
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bh-primary)] text-sm font-bold text-white">
                      2
                    </div>
                    <h3 className="text-lg font-semibold">Lancez la première synchronisation</h3>
                  </div>
                  <p className="text-sm text-[var(--bh-text-secondary)]">
                    Cliquez sur l'icône de synchronisation (🔄) dans l'en-tête pour importer vos favoris. Une notification vous confirmera le nombre de favoris importés.
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bh-primary)] text-sm font-bold text-white">
                      3
                    </div>
                    <h3 className="text-lg font-semibold">Explorez vos favoris</h3>
                  </div>
                  <p className="text-sm text-[var(--bh-text-secondary)]">
                    Vos favoris sont maintenant disponibles ! Utilisez la barre de recherche, les filtres par navigateur, ou explorez les collections créées automatiquement.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Synchronization */}
          {activeSection === "synchronization" && (
            <div className="space-y-6">
              <h1 className="text-4xl font-bold">Synchronisation</h1>
              <p className="text-lg text-[var(--bh-text-secondary)]">
                Comprendre comment fonctionne la synchronisation automatique de vos favoris.
              </p>

              <div className="space-y-6">
                <div>
                  <h2 className="mb-3 text-2xl font-semibold">Synchronisation automatique</h2>
                  <p className="mb-4 text-[var(--bh-text-secondary)]">
                    Favoxia vérifie automatiquement vos navigateurs toutes les <strong>15 minutes</strong> pour détecter de nouveaux favoris. Vous n'avez rien à faire, tout est automatique !
                  </p>
                  <div className="rounded-lg border border-[var(--bh-accent-green)]/30 bg-[var(--bh-accent-green)]/10 p-4">
                    <p className="text-sm text-[var(--bh-text-secondary)]">
                      <strong className="text-[var(--bh-accent-green)]">Astuce :</strong> La fréquence de synchronisation peut être configurée dans les paramètres de chaque navigateur (bientôt disponible).
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="mb-3 text-2xl font-semibold">Synchronisation manuelle</h2>
                  <p className="mb-4 text-[var(--bh-text-secondary)]">
                    Vous pouvez lancer une synchronisation manuelle à tout moment en cliquant sur l'icône de synchronisation (🔄) dans l'en-tête du dashboard.
                  </p>
                </div>

                <div>
                  <h2 className="mb-3 text-2xl font-semibold">Navigateurs supportés</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-lg border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-3">
                      <div className="h-3 w-3 rounded-full bg-[var(--bh-accent-amber)]"></div>
                      <span>Google Chrome</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-3">
                      <div className="h-3 w-3 rounded-full bg-[var(--bh-accent-red)]"></div>
                      <span>Mozilla Firefox</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-3">
                      <div className="h-3 w-3 rounded-full bg-[var(--bh-accent-blue)]"></div>
                      <span>Apple Safari</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-3">
                      <div className="h-3 w-3 rounded-full bg-[var(--bh-accent-cyan)]"></div>
                      <span>Microsoft Edge</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-3">
                      <div className="h-3 w-3 rounded-full bg-[var(--bh-accent-red)]"></div>
                      <span>Brave Browser</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-3">
                      <div className="h-3 w-3 rounded-full bg-[var(--bh-primary)]"></div>
                      <span>Arc Browser</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="mb-3 text-2xl font-semibold">Détection des doublons</h2>
                  <p className="text-[var(--bh-text-secondary)]">
                    Favoxia détecte automatiquement les favoris en double (même URL) et ne les importe qu'une seule fois, même s'ils existent dans plusieurs navigateurs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          {activeSection === "navigation" && (
            <div className="space-y-6">
              <h1 className="text-4xl font-bold">Navigation</h1>
              <p className="text-lg text-[var(--bh-text-secondary)]">
                Découvrez comment naviguer efficacement dans Favoxia.
              </p>

              <div className="space-y-6">
                <div>
                  <h2 className="mb-3 text-2xl font-semibold">Barre latérale</h2>
                  <p className="mb-4 text-[var(--bh-text-secondary)]">
                    La barre latérale vous permet de filtrer rapidement vos favoris :
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <Star className="mt-0.5 h-4 w-4 shrink-0 text-[var(--bh-accent-amber)]" />
                      <div>
                        <strong>Mes favoris :</strong> Affiche uniquement vos favoris marqués comme favoris
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <LayoutGrid className="mt-0.5 h-4 w-4 shrink-0 text-[var(--bh-primary)]" />
                      <div>
                        <strong>Navigateurs :</strong> Filtrez par navigateur source (Chrome, Firefox, etc.)
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Tag className="mt-0.5 h-4 w-4 shrink-0 text-[var(--bh-accent-pink)]" />
                      <div>
                        <strong>Tags :</strong> Organisez vos favoris par thématique (Dev, Design, News, etc.)
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <FolderOpen className="mt-0.5 h-4 w-4 shrink-0 text-[var(--bh-accent-blue)]" />
                      <div>
                        <strong>Collections :</strong> Regroupements créés automatiquement depuis Arc ou manuellement
                      </div>
                    </li>
                  </ul>
                </div>

                <div>
                  <h2 className="mb-3 text-2xl font-semibold">Recherche</h2>
                  <p className="text-[var(--bh-text-secondary)]">
                    La barre de recherche en haut vous permet de rechercher vos favoris par :
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--bh-text-secondary)]">
                    <li>• Titre du favori</li>
                    <li>• Nom de domaine (ex: "github.com")</li>
                    <li>• URL complète</li>
                  </ul>
                </div>

                <div>
                  <h2 className="mb-3 text-2xl font-semibold">Modes d'affichage</h2>
                  <div className="flex gap-3">
                    <div className="flex-1 rounded-lg border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-4">
                      <LayoutGrid className="mb-2 h-5 w-5 text-[var(--bh-primary)]" />
                      <h3 className="mb-1 font-semibold">Mode grille</h3>
                      <p className="text-sm text-[var(--bh-text-secondary)]">
                        Affichage en cartes avec aperçu visuel (3 colonnes)
                      </p>
                    </div>
                    <div className="flex-1 rounded-lg border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-4">
                      <List className="mb-2 h-5 w-5 text-[var(--bh-primary)]" />
                      <h3 className="mb-1 font-semibold">Mode liste</h3>
                      <p className="text-sm text-[var(--bh-text-secondary)]">
                        Affichage compact en liste pour voir plus de favoris
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="mb-3 text-2xl font-semibold">Tri des résultats</h2>
                  <p className="text-[var(--bh-text-secondary)]">
                    Utilisez le bouton de tri "Date ajout" pour inverser l'ordre d'affichage :
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--bh-text-secondary)]">
                    <li>• <strong>Descendant ↓</strong> : Plus récents en premier (par défaut)</li>
                    <li>• <strong>Ascendant ↑</strong> : Plus anciens en premier</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Organization */}
          {activeSection === "organization" && (
            <div className="space-y-6">
              <h1 className="text-4xl font-bold">Organisation</h1>
              <p className="text-lg text-[var(--bh-text-secondary)]">
                Organisez vos favoris avec des tags et collections pour retrouver facilement ce que vous cherchez.
              </p>

              <div className="space-y-6">
                <div>
                  <h2 className="mb-3 text-2xl font-semibold">Tags</h2>
                  <p className="mb-4 text-[var(--bh-text-secondary)]">
                    Les tags vous permettent de catégoriser vos favoris par thématique. Vous pouvez :
                  </p>
                  <ul className="space-y-2 text-[var(--bh-text-secondary)]">
                    <li>• Créer de nouveaux tags dans les paramètres</li>
                    <li>• Personnaliser la couleur de chaque tag</li>
                    <li>• Assigner plusieurs tags à un même favori</li>
                    <li>• Filtrer vos favoris par tag dans la barre latérale</li>
                  </ul>
                </div>

                <div>
                  <h2 className="mb-3 text-2xl font-semibold">Collections</h2>
                  <p className="mb-4 text-[var(--bh-text-secondary)]">
                    Les collections sont des groupements de favoris. Favoxia les crée automatiquement depuis vos espaces Arc !
                  </p>
                  <div className="rounded-lg border border-[var(--bh-accent-blue)]/30 bg-[var(--bh-accent-blue)]/10 p-4">
                    <p className="text-sm text-[var(--bh-text-secondary)]">
                      <strong className="text-[var(--bh-accent-blue)]">Magie Arc :</strong> Si vous utilisez Arc Browser, vos espaces (Pinned, Work, Personal, etc.) sont automatiquement convertis en collections avec les bons icônes !
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="mb-3 text-2xl font-semibold">Favoris</h2>
                  <p className="mb-4 text-[var(--bh-text-secondary)]">
                    Marquez vos favoris les plus importants avec l'étoile ⭐ pour les retrouver rapidement dans la section "Mes favoris".
                  </p>
                  <p className="text-sm text-[var(--bh-text-secondary)]">
                    Cliquez sur l'étoile dans une carte de favori pour l'ajouter/retirer de vos favoris.
                  </p>
                </div>

                <div>
                  <h2 className="mb-3 text-2xl font-semibold">Notes personnelles</h2>
                  <p className="text-[var(--bh-text-secondary)]">
                    Ajoutez des notes à vos favoris en cliquant dessus pour ouvrir les détails. Utile pour vous rappeler pourquoi vous avez sauvegardé ce lien !
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          {activeSection === "features" && (
            <div className="space-y-6">
              <h1 className="text-4xl font-bold">Fonctionnalités</h1>
              <p className="text-lg text-[var(--bh-text-secondary)]">
                Découvrez toutes les fonctionnalités avancées de Favoxia.
              </p>

              <div className="space-y-6">
                <div className="rounded-xl border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-6">
                  <h2 className="mb-3 text-xl font-semibold">Aperçus visuels</h2>
                  <p className="text-[var(--bh-text-secondary)]">
                    Chaque favori affiche une miniature du site web pour une reconnaissance visuelle rapide. Les miniatures sont générées automatiquement en arrière-plan.
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-6">
                  <h2 className="mb-3 text-xl font-semibold">Métadonnées enrichies</h2>
                  <p className="mb-3 text-[var(--bh-text-secondary)]">
                    Cliquez sur un favori pour voir ses détails complets :
                  </p>
                  <ul className="space-y-2 text-sm text-[var(--bh-text-secondary)]">
                    <li>• URL complète</li>
                    <li>• Domaine et adresse IP</li>
                    <li>• Protocole (HTTP/HTTPS)</li>
                    <li>• Navigateur source</li>
                    <li>• Dossier d'origine</li>
                    <li>• Date d'ajout</li>
                    <li>• Tags et collections associés</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-6">
                  <h2 className="mb-3 text-xl font-semibold">Logs de synchronisation</h2>
                  <p className="text-[var(--bh-text-secondary)]">
                    Consultez l'historique complet de toutes les synchronisations dans les paramètres. Chaque synchronisation affiche :
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--bh-text-secondary)]">
                    <li>• Navigateur synchronisé</li>
                    <li>• Nombre de favoris importés</li>
                    <li>• Statut (succès/erreur)</li>
                    <li>• Date et heure exacte</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-6">
                  <h2 className="mb-3 text-xl font-semibold">Statistiques en temps réel</h2>
                  <p className="text-[var(--bh-text-secondary)]">
                    La barre latérale affiche en temps réel :
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--bh-text-secondary)]">
                    <li>• Nombre de favoris par navigateur</li>
                    <li>• Nombre de favoris par tag</li>
                    <li>• Nombre de favoris par collection</li>
                    <li>• Total de favoris marqués comme favoris</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-6">
                  <h2 className="mb-3 text-xl font-semibold">Gestion des navigateurs</h2>
                  <p className="text-[var(--bh-text-secondary)]">
                    Dans les paramètres, vous pouvez pour chaque navigateur :
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--bh-text-secondary)]">
                    <li>• Activer/désactiver la synchronisation</li>
                    <li>• Voir la date de dernière synchronisation</li>
                    <li>• Voir le nombre total de favoris importés</li>
                    <li>• Lancer une synchronisation manuelle</li>
                    <li>• Supprimer tous les favoris d'un navigateur pour réimporter</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === "notifications" && (
            <div className="space-y-6">
              <h1 className="text-4xl font-bold">Notifications</h1>
              <p className="text-lg text-[var(--bh-text-secondary)]">
                Restez informé de toute l'activité de Favoxia grâce au système de notifications.
              </p>

              <div className="space-y-6">
                <div>
                  <h2 className="mb-3 text-2xl font-semibold">Centre de notifications</h2>
                  <p className="mb-4 text-[var(--bh-text-secondary)]">
                    Cliquez sur l'icône cloche (🔔) en haut à droite pour ouvrir le centre de notifications. Un badge rouge indique le nombre de notifications non lues.
                  </p>
                </div>

                <div>
                  <h2 className="mb-3 text-2xl font-semibold">Types de notifications</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 rounded-lg border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-4">
                      <div className="mt-1 h-2 w-2 rounded-full bg-[var(--bh-accent-green)]"></div>
                      <div>
                        <h3 className="font-semibold text-[var(--bh-accent-green)]">Succès</h3>
                        <p className="text-sm text-[var(--bh-text-secondary)]">
                          Synchronisation réussie, nouveaux favoris importés, collections créées
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-4">
                      <div className="mt-1 h-2 w-2 rounded-full bg-[var(--bh-accent-blue)]"></div>
                      <div>
                        <h3 className="font-semibold text-[var(--bh-accent-blue)]">Information</h3>
                        <p className="text-sm text-[var(--bh-text-secondary)]">
                          Synchronisation terminée sans nouveaux favoris
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-4">
                      <div className="mt-1 h-2 w-2 rounded-full bg-[var(--bh-accent-amber)]"></div>
                      <div>
                        <h3 className="font-semibold text-[var(--bh-accent-amber)]">Avertissement</h3>
                        <p className="text-sm text-[var(--bh-text-secondary)]">
                          Actions nécessitant votre attention
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-[var(--bh-border)] bg-[var(--bh-bg-card)] p-4">
                      <div className="mt-1 h-2 w-2 rounded-full bg-[var(--bh-accent-red)]"></div>
                      <div>
                        <h3 className="font-semibold text-[var(--bh-accent-red)]">Erreur</h3>
                        <p className="text-sm text-[var(--bh-text-secondary)]">
                          Échecs de synchronisation, erreurs d'accès aux fichiers de navigateur
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="mb-3 text-2xl font-semibold">Gestion des notifications</h2>
                  <p className="text-[var(--bh-text-secondary)]">
                    Dans le centre de notifications, vous pouvez :
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--bh-text-secondary)]">
                    <li>• Marquer une notification comme lue en cliquant dessus</li>
                    <li>• Marquer toutes les notifications comme lues</li>
                    <li>• Supprimer une notification individuellement</li>
                    <li>• Effacer toutes les notifications</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-[var(--bh-accent-blue)]/30 bg-[var(--bh-accent-blue)]/10 p-4">
                  <p className="text-sm text-[var(--bh-text-secondary)]">
                    <strong className="text-[var(--bh-accent-blue)]">Astuce :</strong> Les notifications sont conservées jusqu'à 50 entrées maximum. Les plus anciennes sont automatiquement supprimées.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {activeSection === "settings" && (
            <div className="space-y-6">
              <h1 className="text-4xl font-bold">Paramètres</h1>
              <p className="text-lg text-[var(--bh-text-secondary)]">
                Personnalisez Favoxia selon vos besoins.
              </p>

              <div className="space-y-6">
                <div>
                  <h2 className="mb-3 text-2xl font-semibold">Accéder aux paramètres</h2>
                  <p className="text-[var(--bh-text-secondary)]">
                    Cliquez sur l'icône ⚙️ en haut à droite du dashboard pour ouvrir le modal de paramètres.
                  </p>
                </div>

                <div>
                  <h2 className="mb-3 text-2xl font-semibold">Onglet Navigateurs</h2>
                  <p className="mb-4 text-[var(--bh-text-secondary)]">
                    Gérez quels navigateurs sont synchronisés automatiquement :
                  </p>
                  <ul className="space-y-2 text-sm text-[var(--bh-text-secondary)]">
                    <li>• Activez/désactivez chaque navigateur individuellement</li>
                    <li>• Consultez la date de dernière synchronisation</li>
                    <li>• Voyez le nombre de favoris importés</li>
                    <li>• Synchronisez manuellement un navigateur spécifique</li>
                    <li>• Supprimez tous les favoris d'un navigateur pour réimporter</li>
                  </ul>
                </div>

                <div>
                  <h2 className="mb-3 text-2xl font-semibold">Onglet Tags</h2>
                  <p className="mb-4 text-[var(--bh-text-secondary)]">
                    Créez et personnalisez vos tags :
                  </p>
                  <ul className="space-y-2 text-sm text-[var(--bh-text-secondary)]">
                    <li>• Créez de nouveaux tags avec un nom et une couleur</li>
                    <li>• Modifiez le nom et la couleur des tags existants</li>
                    <li>• Supprimez les tags dont vous n'avez plus besoin</li>
                    <li>• Voyez le nombre de favoris associés à chaque tag</li>
                  </ul>
                </div>

                <div>
                  <h2 className="mb-3 text-2xl font-semibold">Onglet Collections</h2>
                  <p className="mb-4 text-[var(--bh-text-secondary)]">
                    Organisez vos collections :
                  </p>
                  <ul className="space-y-2 text-sm text-[var(--bh-text-secondary)]">
                    <li>• Créez de nouvelles collections avec un nom et un icône</li>
                    <li>• Modifiez les collections existantes</li>
                    <li>• Supprimez les collections inutilisées</li>
                    <li>• Voyez le nombre de favoris dans chaque collection</li>
                  </ul>
                </div>

                <div>
                  <h2 className="mb-3 text-2xl font-semibold">Onglet Logs</h2>
                  <p className="text-[var(--bh-text-secondary)]">
                    Consultez l'historique complet de toutes les synchronisations avec :
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--bh-text-secondary)]">
                    <li>• Navigateur source</li>
                    <li>• Action effectuée</li>
                    <li>• Nombre de favoris traités</li>
                    <li>• Statut (succès/erreur)</li>
                    <li>• Horodatage précis</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-[var(--bh-accent-amber)]/30 bg-[var(--bh-accent-amber)]/10 p-4">
                  <p className="text-sm text-[var(--bh-text-secondary)]">
                    <strong className="text-[var(--bh-accent-amber)]">Attention :</strong> La suppression d'un tag, d'une collection ou des favoris d'un navigateur est irréversible. Une confirmation vous sera demandée.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 border-t border-[var(--bh-border)] pt-8">
            <p className="text-center text-sm text-[var(--bh-text-muted)]">
              Favoxia - Votre gestionnaire de favoris centralisé
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
