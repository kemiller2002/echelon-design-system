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
