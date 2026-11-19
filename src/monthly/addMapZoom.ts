// Script-free click-to-enlarge for heat-map images inside the sandboxed
// report iframe (sandbox="" blocks scripts, so this uses a checkbox + label).
const ZOOM_CSS =
  ".bp-zoom-t{position:absolute;opacity:0;pointer-events:none}.bp-zoom-l{display:block;cursor:zoom-in}.bp-zoom-t:checked+.bp-zoom-l{position:fixed;inset:0;z-index:2147483647;background:rgba(15,23,42,.92);display:flex;align-items:center;justify-content:center;padding:16px;cursor:zoom-out;margin:0}.bp-zoom-t:checked+.bp-zoom-l img{width:auto!important;height:auto!important;max-width:100%!important;max-height:100%!important;object-fit:contain}.bp-zoom-hint{display:block;font-size:11px;color:#64748b;margin-top:4px}.bp-zoom-t:checked+.bp-zoom-l .bp-zoom-hint{color:#e2e8f0;position:absolute;bottom:8px;left:0;right:0;text-align:center}@media print{.bp-zoom-hint{display:none}}";

const IMG_TAG = /<img\b[^>]*>/gi;
const CLASS_ATTR = /\sclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;

export function addMapZoom(html: string): string {
  let n = 0;
  const wrapped = html.replace(IMG_TAG, (img) => {
    const m = img.match(CLASS_ATTR);
    const cls = m ? (m[1] ?? m[2] ?? m[3] ?? "") : "";
    if (!cls.includes("pipeline-heatmap")) return img;
    n += 1;
    const id = `bp-zoom-${n}`;
    return `<input type="checkbox" id="${id}" class="bp-zoom-t" aria-label="Enlarge map"><label for="${id}" class="bp-zoom-l" title="Click to enlarge">${img}<span class="bp-zoom-hint">Click map to enlarge · click again to close</span></label>`;
  });
  if (n === 0) return html;
  const style = `<style>${ZOOM_CSS}</style>`;
  const head = /<\/head>/i;
  return head.test(wrapped) ? wrapped.replace(head, `${style}</head>`) : style + wrapped;
}
