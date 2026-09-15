# TideEye â€” Directions & Roadmap

> **TideEye** â€” Â« aman Â» (l'eau) + Â« eye Â» (l'Å“il satellite).
> *L'eau vue du ciel. L'alerte au sol.*
>
> Surveillance de la qualitÃ© de l'eau par satellite pour les communautÃ©s
> qui n'ont ni laboratoire ni capteurs â€” pensÃ©e pour l'Afrique.

Ce document est notre **feuille de route partagÃ©e**. On avance **une Ã©tape Ã  la
fois** : chaque Ã©tape est validÃ©e avant de passer Ã  la suivante. On coche au fur
et Ã  mesure.

---

## 0. Positionnement (le Â« pourquoi Â»)

- **ProblÃ¨me** : des millions de personnes boivent l'eau de lacs/riviÃ¨res/mares
  non testÃ©s. Peu de labos, peu d'Ã©quipes, immenses territoires. CholÃ©ra, algues
  toxiques, pollution â€” souvent dÃ©tectÃ©s trop tard.
- **Solution** : le satellite (Sentinel-2, gratuit, couvre tout le continent)
  analyse l'eau Ã  distance â†’ un **score de risque** â†’ une **alerte actionnable**
  pour la communautÃ©.
- **Ce qui nous diffÃ©rencie** (personne ne combine les trois) :
  1. ðŸ›°ï¸ Satellite â†’ **action concrÃ¨te** (pas juste de la donnÃ©e)
  2. ðŸŒ PensÃ© **faible ressource / Afrique** (zÃ©ro capteur, langue locale, message
     tÃ©lÃ©phone/affiche)
  3. ðŸ¤– Couche **multi-agents IA** qui traduit les indices en langage humain + plan
     d'action
- **Concurrents repÃ©rÃ©s** : CyFi (NASA, donnÃ©es brutes, pas d'UI), Digital Earth
  Africa (donnÃ©es, alertes Â« coming soon Â»), CholeraMap (Bangladesh only). â†’ On
  remplit le trou : **du satellite Ã  l'action, pour l'Afrique, maintenant.**

---

## âš‘ DÃ©cision cadre (actÃ©e)

- **On refait tout.** Rien ne reste figÃ© comme dans l'AquaLens d'origine. Chaque
  Ã©cran, texte et fonctionnalitÃ© est **rÃ©Ã©valuÃ© et rÃ©adaptÃ© Ã  notre use case**
  (eau + Afrique + action), ou supprimÃ©.
- **Landing page = premiÃ¨re cible** : entiÃ¨rement revue/rÃ©adaptÃ©e (le contenu
  actuel n'est pas alignÃ© sur notre positionnement).
- On **retire les fonctionnalitÃ©s inutiles** (voir Â§6) pour un produit clair,
  focalisÃ©, dÃ©fendable devant les juges.

## âš‘ Vision produit â€” Ã©cran principal & fonctionnalitÃ©s cibles (actÃ©e)

**Ã‰cran principal = une carte plein Ã©cran, orientÃ©e action :**
1. L'utilisateur **clique un point d'eau** â†’ analyse satellite lancÃ©e.
2. Affichage du **verdict** (ðŸŸ¢/ðŸŸ¡/ðŸ”´ + score).
3. **Panneau type Â« chat Â» en bas** : explication IA en langage humain.
4. Sous le chat : **gÃ©nÃ©ration de rapport** â†’ bouton **TÃ©lÃ©charger PDF** +
   **Envoyer par email**.

**4 systÃ¨mes autour :**
- ðŸ“² **Alertes SMS programmÃ©es** : envoi Ã  un numÃ©ro ou Ã  **un lot de numÃ©ros**.
  *(DÃ©pend d'un fournisseur SMS â€” Twilio / Africa's Talking. Fallback sans compte :
  lien WhatsApp/SMS prÃ©-rempli.)*
- ðŸ”— **Partage par lien** : le lien **rouvre l'analyse telle quelle** (Ã©tat persistÃ©,
  rien Ã  refaire). Base dÃ©jÃ  lÃ  : chaque session a une URL/ID unique.
- ðŸ”„ **Mises Ã  jour automatiques** : rÃ©-analyse pÃ©riodique du point d'eau
  (planificateur/cron cÃ´tÃ© serveur) â†’ surveillance continue.
- ðŸ“§ **Envoi du rapport par email** (SMTP : Gmail / Resend).

**DÃ©pendances externes Ã  prÃ©voir :** fournisseur SMS (lot), service email.
Le reste est construit en interne.

## 1. Directions VISUELLES (identitÃ© & UI)

Objectif : une identitÃ© propre, crÃ©dible, distinctive â€” pas un template IA gÃ©nÃ©rique.

- [ ] **1.1 Renommage complet** AquaLens â†’ TideEye (logo, titres, README, PDF,
      metadata, footer, package names visibles).
- [ ] **1.2 Palette & thÃ¨me** : bleu eau profond + accent Â« alerte Â» (ambre/rouge)
      + vert Â« sÃ»r Â». Mode clair lisible en plein soleil (contexte terrain).
- [ ] **1.3 Logo** : Å“il stylisÃ© formÃ© d'une goutte d'eau / onde satellite.
- [ ] **1.4 Page d'accueil** : hero avec le vrai propos (eau + Afrique + action),
      chiffres d'impact, carte de dÃ©monstration.
- [ ] **1.5 Codes couleur risque cohÃ©rents** partout (UI, PDF, carte) :
      ðŸŸ¢ sÃ»r Â· ðŸŸ¡ prudence Â· ðŸ”´ Ã©viter.

## 2. Directions APPLICATIVES (parcours utilisateur)

Objectif : rendre le rÃ©sultat **actionnable**, pas juste informatif.

- [ ] **2.1 Plan d'action** sur la page session : checklist priorisÃ©e selon le
      niveau de risque (ex. ðŸ”´ â†’ afficher avis Â« ne pas boire Â», alerter le comitÃ©
      de village, faire bouillir, demander un prÃ©lÃ¨vement).
- [ ] **2.2 Bouton Â« Alerter Â»** : gÃ©nÃ¨re un message prÃªt-Ã -envoyer
      (WhatsApp `wa.me` / SMS / email `mailto:`) prÃ©-rempli avec lieu + niveau +
      consigne. **100% rÃ©el, dÃ©montrable, sans partenaire externe.**
- [ ] **2.3 Affiche imprimable** (PDF A4) Ã  coller au point d'eau : pictogramme
      ðŸ”´/ðŸŸ¢ + consigne simple, comprÃ©hensible mÃªme sans lecture.
- [ ] **2.4 Dashboard multi-sites** : carte d'ensemble des points d'eau surveillÃ©s
      avec code couleur â€” vue Â« salle de contrÃ´le Â».
- [ ] **2.5 Score de confiance** : indiquer Ã  quel point se fier au rÃ©sultat
      (couverture nuageuse, fraÃ®cheur image, fraction d'eau).

## 3. Directions FONCTIONNELLES (moteur & donnÃ©es)

Objectif : puissance technique rÃ©elle, alignÃ©e Â« Earth Forward Â».

- [ ] **3.1 DÃ©tection d'algues (HAB)** renforcÃ©e : flag Â« bloom probable Â» basÃ© sur
      NDCI + seuils ; sujet chaud climat+Afrique.
- [ ] **3.2 Tendance temporelle** : comparer les sessions d'un mÃªme point d'eau â†’
      Â« turbiditÃ© +40% en 2 semaines â†’ dÃ©gradation Â». Transforme une photo en
      **systÃ¨me d'alerte prÃ©coce**.
- [ ] **3.3 Points d'eau africains** prÃ©-chargÃ©s en dÃ©mo (ex. lac Victoria, lac
      Tchad, un barrage local) pour une dÃ©mo crÃ©dible.
- [ ] **3.4 Robustesse dÃ©mo** : garantir un chemin qui marche mÃªme si Gemini/quota
      tombe (fallbacks dÃ©jÃ  prÃ©sents Ã  valider).
- [ ] **3.5 (Option) source Digital Earth Africa** pour Ã©largir la couverture.

---

## 3bis. FonctionnalitÃ©s Ã  RETIRER (actÃ©)

On supprime pour un produit clair et dÃ©fendable :

- [ ] **Page Changelog** (`(marketing)/changelog`) â€” notes de version, hors sujet.
- [ ] **Page About** (`(marketing)/about`) â€” sur l'auteur d'origine.
- [ ] **Page Settings** (`(app)/settings`) â€” thÃ¨me/prefs gadget.
- [ ] **Agent Field Liaison** (`backend/.../field_liaison.py`) â€” legacy.
- [ ] **Field Brief Card** (`components/session/field-brief-card.tsx`) â€” legacy.
- [ ] **MÃ©moire pgvector / embeddings** (`agent_memory`, `tools/embeddings.py`,
      `tools/memory_tools.py`) â€” sur-ingÃ©niÃ©, valeur marginale.
- [ ] **Agent Historian** (`historian.py`, `tools/history_tools.py`) â€” retirÃ©
      entiÃ¨rement. Pipeline IA final : **Scout â†’ Analyst â†’ Reporter**.

Ã€ simplifier (discuter au moment venu) : CRUD water-bodies, Agent Constellation
(anim marketing), page Methodology.

## 3ter. FaisabilitÃ© Sentinel (actÃ©)

Sentinel-2 **seul suffit** pour notre positionnement (triage / alerte prÃ©coce /
tendance), pas pour un certificat de potabilitÃ© â€” ce qu'on assume.
- âœ… Fiable : chlorophylle-a/algues (NDCI, RÂ² 0.82â€“0.88), turbiditÃ© (NDTI, RÂ² 0.6â€“0.7),
  dÃ©tection d'eau, cyanobactÃ©ries via indices+ML (~92% avec calibration), rÃ©solution
  10â€“30 m (voit les petits plans d'eau), revisite 5 j.
- âš ï¸ Limites : ne voit pas bactÃ©ries/chimie dissoute/pathogÃ¨nes ; pas de tempÃ©rature ;
  nuages (saison des pluies) ; prÃ©cision variable â†’ calibration locale utile.
- ðŸ‘‰ ConsÃ©quence : garder le cadrage Â« outil consultatif, pas un labo Â» ; garder les
  preuves terrain (vÃ©ritÃ© terrain) ; ajout mÃ©tÃ©o/pluie recommandÃ© (voir Power Pack).

## 3quater. Power Pack â€” renforcements (actÃ©)

PrioritÃ© d'impact pour rendre TideEye plus puissant :

- [ ] **P1. Heatmap de risque sur le plan d'eau** : colorier la surface pixel par
      pixel (pas juste un point) â†’ montre *oÃ¹* est le problÃ¨me. Wow visuel.
- [ ] **P2. Tendance + alerte prÃ©coce** : comparer les sessions dans le temps
      (Â« turbiditÃ© +40% en 2 semaines Â») â†’ vrai systÃ¨me d'alerte prÃ©coce.
- [ ] **P3. Fusion mÃ©tÃ©o/pluie** : pluie rÃ©cente = ruissellement = risque ;
      rend le score contextuel/prÃ©dictif, comble une limite du satellite.
- [ ] **P4. Population exposÃ©e** : croiser avec la densitÃ© de population â†’
      Â« ~X personnes potentiellement exposÃ©es Â». Impact chiffrÃ© pour le pitch.

Plus tard / v2 : Sentinel-1 radar (anti-nuages), agent prÃ©vision de bloom (HAB
forecast), boucle communautaire complÃ¨te (signalement citoyen â†’ alerte village).

## 4. Livrables compÃ©tition (NextStep Hacks â€” deadline 20 sept.)

- [ ] **4.1 Texte Devpost** alignÃ© sur le positionnement Afrique + action.
- [ ] **4.2 VidÃ©o pitch â‰¤ 5 min** : problÃ¨me â†’ dÃ©mo live (analyse d'un lac â†’
      score â†’ alerte WhatsApp + affiche) â†’ impact â†’ vision.
- [ ] **4.3 README** propre au nom TideEye, avec lien vers la dÃ©mo en ligne.
- [ ] **4.4 DÃ©claration honnÃªte** : ce qui a Ã©tÃ© fait avant vs pendant le hackathon
      (exigÃ© par le rÃ¨glement).

---

## 5. Ã‰tat du dÃ©ploiement (fait âœ…)

- âœ… DÃ©ployÃ© sur le VPS, mode rÃ©el (satellite Sentinel-2 + Gemini).
- âœ… Frontend : https://aqualensapp.shadrakbessanh.me
- âœ… API : https://aqualens-api.shadrakbessanh.me/docs
- â³ Ã€ renommer en URLs TideEye aprÃ¨s le renommage (Ã©tape 1.1).
- ðŸ” AprÃ¨s compÃ©t : changer mdp root + rÃ©gÃ©nÃ©rer clÃ© Gemini.

---

## Ordre d'exÃ©cution proposÃ© (pas Ã  pas)

1. **1.1 Renommage** (base de tout le reste)
2. **2.1 + 2.2** Plan d'action + bouton Alerter (le cÅ“ur Â« actionnable Â»)
3. **2.3** Affiche imprimable
4. **3.1** DÃ©tection algues
5. **1.2â€“1.5** IdentitÃ© visuelle
6. **3.2** Tendance temporelle
7. **4.x** Livrables compÃ©tition

> On valide chaque Ã©tape ensemble avant la suivante.

