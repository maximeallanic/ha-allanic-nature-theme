# Allanic Nature Theme

Thème Home Assistant pour la maison Allanic — identité **teal** (cartes `#0D5D6D` + accents cyan `#00B2C6`), optimisé pour l'affichage permanent sur tablettes Kindle Fire (wall display) **et** lisible en usage admin desktop.

## Architecture (v0.8.0 — « cartes teal partout »)

Un **thème unique** `allanic_nature` avec une clé `modes:` (dark + light) :

- **Cartes teal + texte clair + accents cyan** identiques dans les **deux** modes (tout le bloc « carte » est commun).
- Seuls le **fond de page** et le **chrome** (sidebar, header, dividers, titres de section) changent selon le mode :
  - `dark` : page quasi-noir, sidebar sombre, titres clairs.
  - `light` : page claire, sidebar claire, titres de section foncés.
- Bascule du mode poussée explicitement par tablette via `browser_mod.set_theme` (`dark: dark|light`) — **jamais** `prefers-color-scheme` (WebView Kindle peu fiable).

100 % variables natives HA pour le thème. Quelques cas que ni les variables natives ni card-mod ne peuvent corriger (texte « clair sur clair » posé sur le fond de page : titre de la sidebar, entrées du journal/historique, en-têtes des pages de réglages, data-tables…) sont gérés par un **module JS** complémentaire — voir ci-dessous.

## Installation

### 1. Le thème (via HACS)

1. **HACS** → menu `⋮` → **Custom repositories**
2. URL : `https://github.com/maximeallanic/ha-allanic-nature-theme` — catégorie **Theme** → **Add**
3. Ouvrir la carte « Allanic Nature Theme » → **Download**
4. Vérifier `configuration.yaml` (HACS ne le modifie pas) :
   ```yaml
   frontend:
     themes: !include_dir_merge_named themes
   ```
5. **Reload Themes** (`Outils de développement → YAML`) ou redémarrer HA.
6. Profil utilisateur → **Thème** → `allanic_nature`.

### 2. Le module JS complémentaire (`www/allanic-data-table.js`)

Indispensable pour la lisibilité du **chrome de page en mode clair** (titre sidebar, journal/historique, pièces, pages de détail des intégrations/appareils, data-tables, onglets, FAB, etc.). card-mod **ne peut pas** atteindre l'intérieur des pages de réglages : ce module injecte des `<style>` ciblés dans les shadow DOM concernés.

1. Copier [`www/allanic-data-table.js`](www/allanic-data-table.js) dans le dossier `config/www/` de Home Assistant (chemin servi : `/local/allanic-data-table.js`).
2. L'enregistrer dans `configuration.yaml` :
   ```yaml
   frontend:
     extra_module_url:
       - /local/allanic-data-table.js
   ```
3. **Redémarrer HA** (requis pour charger un nouvel `extra_module_url`).

> ⚠️ Le fichier est servi en **cache** sous `/local/`. Après toute mise à jour du module, faire un **rechargement forcé** (Ctrl+Shift+R) sur chaque appareil (un reload normal sert l'ancienne version). Modifier seulement le CSS interne du module = Ctrl+Shift+R suffit ; ajouter/retirer le fichier de `extra_module_url` = redémarrage HA.

## Mise à jour

HACS détecte les nouvelles releases du dépôt (bouton **Update** + reload themes) pour le **thème**. Le **module JS** se met à jour manuellement (re-copie dans `www/` + hard reload).

## Désinstallation (réversible)

HACS → carte du thème → **Remove**. Retirer le module de `extra_module_url` et supprimer `www/allanic-data-table.js`.

## Développement

- Thème : `themes/allanic_nature.yaml` (100 % variables natives + `card-mod-sidebar`).
- Module : `www/allanic-data-table.js` (correctifs shadow DOM non couvrables par variables/card-mod).

## Licence

MIT — voir [`LICENSE`](LICENSE).
