// ════════════════════════════════════════════════════════════════════════════
//  ALLANIC NATURE — correctifs shadow DOM non couvrables par thème/card-mod
// ════════════════════════════════════════════════════════════════════════════
//  Le choix « cartes teal partout » casse le contrat HA (--primary-text-color
//  lisible sur --primary-background-color) et laisse certains composants avec des
//  couleurs de PAGE ou l'accent cyan brut. card-mod 4.2.1 ne peut pas les cibler
//  (type root = hui-root, absent des pages de config) et aucune variable native
//  dédiée n'existe. On injecte donc un <style> dans le shadowRoot des composants
//  concernés, et pour le FAB on pose des variables CSS inline (elles traversent le
//  shadow par héritage). Pas de Constructable StyleSheets (compat WebView Kindle).
//  Chargé via frontend.extra_module_url.
//
//  Robustesse : on intercepte customElements.define pour patcher la classe AVANT
//  toute instance (sinon course au démarrage avec les dialogues chargés à la
//  demande, ex. sélecteur de cartes), + hooks firstUpdated ET connectedCallback
//  (idempotents), + scan initial des instances déjà montées.
//
//  Correctifs :
//   • ha-data-table : group-header (« Alarme ») illisible → teal + texte clair ;
//     bordures ligne/en-tête (--divider-color clair) → teal foncé.
//   • hui-card-picker : tuiles .card en --primary-background-color (clair) + titre/
//     desc clairs → teal + texte clair.
//   • ha-section-title : bg neutre clair + texte --secondary-text-color clair → teal.
//   • ha-tab : onglet actif = pastille teal des cartes (#0D5D6D) + texte clair, sans
//     soulignement cyan ; ripple survol/clic en teal (au lieu du cyan global).
//   • ha-tab-group-tab : soulignement actif --indicator-color (cyan) → teal.
//   • ha-button[slot=fab] : FAB « Créer … » cyan → teal (repos/survol/clic), texte
//     clair, UNIQUEMENT le slot fab (les autres boutons accent restent cyan).
// ════════════════════════════════════════════════════════════════════════════
(() => {
  const STYLE_ID = "allanic-shadow-fix";

  // ── Texte de PAGE (panneaux rendus sur --primary-background-color) ─────────
  //  Problème : « cartes teal partout » force --primary-text/secondary-color en
  //  CLAIR (lisible sur teal). Or certains panneaux (logbook, history, areas)
  //  rendent du texte directement sur le FOND DE PAGE (clair en light) → clair
  //  sur clair, illisible. On mappe ces variables sur --mush-title/subtitle-color,
  //  que le thème bascule par mode (foncé en light, clair en dark) → lisible dans
  //  les 2 modes. Scopé au PANNEAU (pas au composant : ha-logbook-renderer sert
  //  aussi dans les more-info sur teal, où il doit rester clair).
  const PAGE_TEXT = `
    --primary-text-color: var(--mush-title-color, #0D2E33) !important;
    --secondary-text-color: var(--mush-subtitle-color, #0A4D5C) !important;
    --primary-color: var(--mush-title-color, #0D2E33) !important;
    --state-icon-color: var(--mush-subtitle-color, #0A4D5C) !important;
  `;
  // Ré-affirmation CLAIR sur les surfaces teal DANS ces panneaux (cartes + champs
  //  de formulaire dont le fond reprend le teal des cartes : input-fill-color).
  const TEAL_SURFACE = `
    --primary-text-color: #E8F4F5 !important;
    --secondary-text-color: #C8E8EC !important;
    --primary-color: #00B2C6 !important;
    --state-icon-color: #6FB5BD !important;
  `;
  // Tags des SURFACES TEAL (cartes + champs de formulaire à fond teal) : on RÉ-AFFIRME
  //  le texte CLAIR. Posé en :host GLOBALEMENT (pas en sélecteur descendant depuis le
  //  panneau), car les cartes/listes sont souvent imbriquées trop profondément (shadow
  //  roots successifs) pour être atteintes par un sélecteur. :host sur chaque élément
  //  teal est indépendant de la profondeur. Hors panneaux à fond clair, c'est un no-op
  //  (les variables y valent déjà clair) → aucun impact sur dashboards / data-tables.
  const TEAL_TAGS = ["ha-card", "ha-md-list", "ha-textfield", "ha-textarea", "ha-select", "ha-combo-box", "ha-date-range-picker", "search-input-outlined"];
  // Panneaux à FOND DE PAGE clair (texte foncé par-mode). hass-subpage = wrapper des
  //  pages de DÉTAIL (intégration, appareil…). +entrées dédiées pour les panneaux et
  //  titres situés HORS hass-subpage (ex. le titre de ha-config-integration-page). Les
  //  listes data-table (hass-tabs-subpage-data-table, fond sombre) ne sont PAS incluses
  //  → elles restent lisibles avec leur texte clair.
  const PANEL_TAGS = ["hass-subpage", "ha-panel-logbook", "ha-panel-history", "ha-config-areas-dashboard", "ha-config-integration-page", "ha-config-device-page"];

  // ── Correctifs par injection de <style> dans le shadowRoot ─────────────────
  const FIXES = {
    "ha-data-table": `
      :host { ${TEAL_SURFACE} }
      .mdc-data-table__cell.group-header,
      .group-header {
        background-color: #0D5D6D !important;
        color: #E8F4F5 !important;
      }
      .mdc-data-table__row {
        border-top-color: #08363D !important;
      }
      .mdc-data-table__header-row {
        border-bottom-color: #08363D !important;
      }
    `,
    "hui-card-picker": `
      .card {
        background: #0D5D6D !important;
      }
      .card-header {
        color: #E8F4F5 !important;
      }
      .description {
        color: #C8E8EC !important;
      }
    `,
    "ha-section-title": `
      :host {
        background-color: #0D5D6D !important;
        color: #E8F4F5 !important;
      }
    `,
    // ha-tip (« Astuce ! ») : .text lit --secondary-text-color (clair) sur le FOND
    // DE PAGE → illisible en light. Pas de couleur fixe (casserait le dark) : on
    // mappe sur --mush-title/subtitle-color, que le thème bascule par mode (foncé en
    // light, clair en dark). Le lien <a> reste en --primary-color (cyan).
    "ha-tip": `
      :host {
        color: var(--mush-title-color, #0D2E33) !important;
        --secondary-text-color: var(--mush-subtitle-color, #0A4D5C) !important;
        --primary-text-color: var(--mush-title-color, #0D2E33) !important;
      }
    `,
    // Tiroir de notifications : .notifications a bg --primary-background-color +
    // color --primary-text-color (tous deux clairs en light) → « Aucune notification »
    // illisible. Texte par-mode (foncé en light, clair en dark) comme ha-tip.
    "notification-drawer": `
      .notifications {
        color: var(--mush-title-color, #0D2E33) !important;
      }
    `,
    "ha-tab": `
      :host([active]) {
        color: #E8F4F5 !important;
        background-color: #0D5D6D !important;
        border-radius: 12px !important;
      }
      :host([active]) div {
        background-color: #0D5D6D !important;
        color: #E8F4F5 !important;
        border-radius: 12px !important;
        border-bottom-color: transparent !important;
      }
      :host {
        --ha-ripple-color: #14788C !important;
        --ha-ripple-hover-color: #14788C !important;
        --ha-ripple-pressed-color: #14788C !important;
        --md-ripple-hover-color: #14788C !important;
        --md-ripple-pressed-color: #14788C !important;
      }
      :host([active]:hover),
      :host([active]:active),
      :host([selected]:hover) {
        background-color: #0D5D6D !important;
      }
    `,
    "ha-tab-group-tab": `
      :host {
        --indicator-color: #14788C !important;
      }
      :host([active]) {
        border-block-end-color: #14788C !important;
        border-inline-end-color: #14788C !important;
        border-inline-start-color: #14788C !important;
      }
    `,
  };
  // Génère les entrées « panneau fond clair » (texte foncé par-mode) et « surface
  //  teal » (texte clair ré-affirmé). Voir PANEL_TAGS / TEAL_TAGS ci-dessus.
  //  + on force explicitement les TITRES/EN-TÊTES de chrome (certains, ex. le titre de
  //  ha-config-integration-page, n'utilisent PAS --primary-text-color → l'héritage de
  //  PAGE_TEXT ne suffit pas). Ces sélecteurs ne touchent que le shadow DIRECT du
  //  panneau (les titres de cartes sont dans des shadow roots imbriqués → non visés).
  PANEL_TAGS.forEach((t) => {
    FIXES[t] = `:host{${PAGE_TEXT}}
      .title, h1, h2, h3, h4 { color: var(--mush-title-color, #0D2E33) !important; }`;
  });
  TEAL_TAGS.forEach((t) => { if (!FIXES[t]) FIXES[t] = `:host{${TEAL_SURFACE}}`; });

  // ── FAB : variables inline (teal) sur le seul ha-button[slot=fab] ──────────
  const FAB_VARS = {
    "--wa-color-brand-fill-loud": "#0D5D6D",
    "--ha-color-fill-primary-loud-resting": "#0D5D6D",
    "--ha-color-fill-primary-loud-hover": "#0F6B7E",
    "--ha-color-fill-primary-loud-active": "#0A4D5C",
    "--wa-color-brand-on-loud": "#E8F4F5",
    "--ha-color-on-primary-loud": "#E8F4F5",
  };

  const injectStyle = (el, css) => {
    const sr = el && el.shadowRoot;
    if (!sr || sr.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    sr.appendChild(style);
  };

  const styleFab = (el) => {
    if (!el || el.getAttribute("slot") !== "fab") return;
    Object.keys(FAB_VARS).forEach((k) => el.style.setProperty(k, FAB_VARS[k]));
  };

  const applyTo = (el) => {
    const css = FIXES[el.localName];
    if (css) injectStyle(el, css);
    if (el.localName === "ha-button") styleFab(el);
  };

  // ── Patch d'une classe : enrobe firstUpdated + connectedCallback (idempotents) ──
  const patchClass = (cls) => {
    if (!cls || cls.__allanicPatched) return;
    cls.__allanicPatched = true;
    const proto = cls.prototype;
    const oFU = proto.firstUpdated;
    proto.firstUpdated = function (...a) {
      const r = oFU ? oFU.apply(this, a) : undefined;
      try { applyTo(this); } catch (e) { /* noop */ }
      return r;
    };
    const oCC = proto.connectedCallback;
    proto.connectedCallback = function (...a) {
      const r = oCC ? oCC.apply(this, a) : undefined;
      try { applyTo(this); } catch (e) { /* noop */ }
      return r;
    };
  };

  const TAGS = Object.keys(FIXES).concat(["ha-button"]);

  // 1) Intercepter define() → patcher AVANT toute instance (anti-course)
  const origDefine = customElements.define.bind(customElements);
  customElements.define = function (name, cls, options) {
    if (TAGS.indexOf(name) !== -1) { try { patchClass(cls); } catch (e) { /* noop */ } }
    return origDefine(name, cls, options);
  };

  // 2) Tags déjà définis au chargement du module
  TAGS.forEach((name) => {
    const ex = customElements.get(name);
    if (ex) patchClass(ex);
  });

  // 3) Instances déjà montées (descente récursive des shadowRoots)
  const scan = (root) => {
    root.querySelectorAll("*").forEach((node) => {
      try { applyTo(node); } catch (e) { /* noop */ }
      if (node.shadowRoot) scan(node.shadowRoot);
    });
  };
  try { scan(document); } catch (e) { /* noop */ }
})();
