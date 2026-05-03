# Allanic Nature Theme

Thème Home Assistant pour la maison Allanic — palette nature sobre, optimisé affichage permanent sur tablettes Kindle Fire (mode wall display).

Deux variants :
- `allanic_nature_dark` (dark, par défaut)
- `allanic_nature_light` (light, fallback jour)

Switch automatique dark/light via `sun.sun` : voir [`docs/automation_dark_light_switch.yaml`](docs/automation_dark_light_switch.yaml).
Snippets card-mod (Mushroom / Tile, layout portrait Kindle Fire) : voir [`docs/card_mod_snippets.yaml`](docs/card_mod_snippets.yaml).

## Installation via HACS

1. **HACS → Frontend** *(ou Themes selon version)*
2. Menu `⋮` → **Custom repositories**
3. Coller l'URL : `https://github.com/maximeallanic/ha-allanic-nature-theme`
4. Catégorie : **Theme** → **Add**
5. Cliquer sur la carte « Allanic Nature Theme » → **Download**
6. **Redémarrer Home Assistant** (ou `Developer Tools → YAML → Reload Themes`)

### Patch `configuration.yaml` (si pas déjà présent)

HACS ne modifie pas `configuration.yaml`. Vérifier qu'il contient :

```yaml
frontend:
  themes: !include_dir_merge_named themes
```

Si absent, l'ajouter une seule fois puis redémarrer HA.

### Activation

Profil utilisateur → **Theme** → choisir `allanic_nature_dark` ou `allanic_nature_light`.

## Mise à jour

HACS détecte automatiquement les nouvelles releases du repo. Bouton **Update** dans la carte HACS, puis reload themes.

## Désinstallation (réversible)

HACS → carte du thème → **Remove**. Aucun fichier résiduel hors `themes/allanic_nature.yaml`.

## Développement

Le thème vit dans `themes/allanic_nature.yaml`. Tout commit sur `main` est tagué pour publication HACS via GitHub release.

## Licence

MIT — voir [`LICENSE`](LICENSE).
