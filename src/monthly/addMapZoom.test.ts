import { describe, expect, it } from "vitest";
import { addMapZoom } from "./addMapZoom";

describe("addMapZoom", () => {
  it("returns html unchanged when there is no heat-map image", () => {
    const html = '<html><head></head><body><img class="logo" src="a.png"></body></html>';
    expect(addMapZoom(html)).toBe(html);
  });

  it("wraps each heat-map image with numbered checkbox and label and adds css before </head>", () => {
    const html =
      '<html><head><title>R</title></head><body><img class="x pipeline-heatmap" src="1.png"><img class="logo" src="l.png"><img src="2.png" class="pipeline-heatmap-current"></body></html>';
    const out = addMapZoom(html);
    expect(out).toContain(
      '<input type="checkbox" id="bp-zoom-1" class="bp-zoom-t" aria-label="Enlarge map"><label for="bp-zoom-1" class="bp-zoom-l" title="Click to enlarge"><img class="x pipeline-heatmap" src="1.png"><span class="bp-zoom-hint">Click map to enlarge · click again to close</span></label>',
    );
    expect(out).toContain('for="bp-zoom-2"');
    expect(out).not.toContain("bp-zoom-3");
    expect(out).toContain('<img class="logo" src="l.png"><input');
    expect(out.indexOf("<style>.bp-zoom-t{")).toBeLessThan(out.indexOf("</head>"));
    expect(out.match(/<style>/g)?.length).toBe(1);
  });
});
