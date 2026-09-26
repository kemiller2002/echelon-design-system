export const physicsMotionClasses = {
  "alert": "ef-alert",
  "command-palette": "ef-command-palette",
  "dialog": "ef-dialog",
  "disclosure": "ef-disclosure",
  "flyout": "ef-flyout",
  "menu": "ef-menu",
  "popover": "ef-popover",
  "tabs": "ef-tabs",
  "toast": "ef-toast",
  "fault-notification": "ef-fault-notification",
  "fault-banner": "ef-fault-banner",
  "fault-blocking": "ef-fault-blocking"
};

export function componentTag(slug, source) {
  return `<ef-${slug} class="ef-component-tag">
${source}
</ef-${slug}>`;
}

function setMotionWeight(source, className, weight) {
  const pattern = new RegExp(`<([a-z][\\w-]*)\\b([^>]*\\bclass="[^"]*\\b${className}\\b[^"]*"[^>]*)>`, "gi");
  return source.replace(pattern, (match, tag, attrs) => {
    const nextAttrs = /\\bdata-ef-motion-weight="/.test(attrs)
      ? attrs.replace(/\\bdata-ef-motion-weight="[^"]*"/, `data-ef-motion-weight="${weight}"`)
      : `${attrs} data-ef-motion-weight="${weight}"`;
    return `<${tag}${nextAttrs}>`;
  });
}

function preparePhysicsVariant(slug, source, weight, namespaceSnippet) {
  let html = setMotionWeight(source, physicsMotionClasses[slug], weight);

  if (slug === "command-palette") {
    html = html
      .replace(/<dialog\\b([^>]*)\\sopen(?=[\\s>])/i, "<dialog$1")
      .replace(
        /<dialog\\b([^>]*)class="ef-command-palette"([^>]*)>/i,
        `<button type="button" commandfor="physics-command-palette" command="show-modal">Open ${weight} command palette</button>
<dialog$1class="ef-command-palette"$2 id="physics-command-palette">`
      );
  }

  return namespaceSnippet(componentTag(slug, html), `motion-${slug}-${weight}-`);
}

export function physicsMotionExample(number, slug, source, namespaceSnippet, example) {
  const weights = ["light", "standard", "heavy"];
  const samples = weights.map(weight => {
    const snippet = preparePhysicsVariant(slug, source, weight, namespaceSnippet);
    return `<article class="motion-weight-sample" data-motion-weight="${weight}">
  <div class="motion-weight-label"><strong>${weight}</strong><span>presentation only</span></div>
  <div class="motion-weight-demo">${snippet}</div>
</article>`;
  }).join("");

  const combined = `<div class="motion-weight-grid" data-physics-motion-example="${slug}">
${samples}
</div>`;

  return example(
    number,
    "Motion weights",
    "Compare the same semantic contract at light, standard, and heavy perceived mass. Weight changes presentation only; native or application state remains authoritative.",
    combined
  );
}


export const verificationStressCases = [
  {
    id: "content-stress",
    title: "Content stress",
    note: "Long prose, localization expansion, and an unbroken identifier exercise wrapping and containment without changing semantic order.",
    className: "ve-stress ve-stress--content"
  },
  {
    id: "text-spacing",
    title: "Text spacing",
    note: "WCAG-style spacing overrides screen clipping, overlap, and fixed-height assumptions.",
    className: "ve-stress ve-stress--text-spacing"
  },
  {
    id: "grayscale",
    title: "Cue dropout · grayscale",
    note: "Color is removed as a screening condition. Text and structure must still carry consequential meaning.",
    className: "ve-stress ve-stress--grayscale"
  },
  {
    id: "reduced-contrast",
    title: "Reduced effective contrast",
    note: "A glare and low-brightness proxy screens whether hierarchy depends on subtle surface differences. This is fault injection, not human-subject validation.",
    className: "ve-stress ve-stress--reduced-contrast"
  }
];

function stressSource(source, id) {
  if (id !== "content-stress") return source;
  const longId = "VERIFICATION-0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF";
  return source
    .replace(/(<(?:h[1-6]|p|dt|dd|label|button|summary)\b[^>]*>)([^<]{2,})(<\/)/i, (_, a, value, c) =>
      a + value.trim() + " · Extended localized content for verification and layout resilience" + c)
    .replace(/(<(?:section|article|div)\b[^>]*>)/i, `$1<p class="ef-identifier">${longId}</p>`);
}

export function verificationStressExample(number, slug, source, namespaceSnippet, example) {
  const samples = verificationStressCases.map(item => {
    const snippet = namespaceSnippet(componentTag(slug, stressSource(source, item.id)), `ve-${slug}-${item.id}-`);
    return `<article class="${item.className}" data-ve-stress="${item.id}">
  <div class="motion-weight-label"><strong>${item.title}</strong><span>engineering screen</span></div>
  <div class="ve-stress__demo">${snippet}</div>
</article>`;
  }).join("");

  return example(
    number,
    "Visual Engineering stress screens",
    "Generated fault-injection specimens expose content, spacing, color-cue, and reduced-effective-contrast risks. They screen presentation robustness without claiming human-subject validation.",
    `<div class="ve-stress-grid" data-ve-verification="${slug}">
${samples}
</div>`
  );
}
