/*
 * ilene.ai resource builder.
 * Renders the resource PDFs with Chromium (Playwright) and the policy template as Word with docx.
 * Usage (from the repo root):  node build/resources/build.js
 * Requires: playwright (with Chromium), docx, pdf-lib, and the Poppins font installed locally.
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { PDFDocument, rgb } = require("pdf-lib");
const POPPINS = "/usr/share/fonts/truetype/google-fonts/Poppins-Regular.ttf";
const policy = require("./policy-content");

const HERE = __dirname;
const OUT = path.join(HERE, "..", "..", "resources");
const fileUrl = (f) => "file://" + path.join(HERE, f);

/* ---------- inline markup ---------- */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function inlineHTML(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\[([^\]]+)\]/g, '<span class="ph">[$1]</span>');
}

/* ---------- policy as HTML ---------- */
const RING = '<svg class="ring" viewBox="0 0 656 700" aria-hidden="true"><path d="M433.1 125.2 A258 258 0 1 1 216.9 125.2"/><line x1="325" y1="78" x2="325" y2="226"/></svg>';

function policyCoverHTML() {
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="brand.css">
<style>
  .notice { margin-top: 0.24in; border: 1.5px solid var(--bronze); border-radius: 14px; padding: 14px 18px; background: #fbf9f4; }
  .notice h2 { font-size: 11.6pt; font-weight: 700; display: flex; gap: 9px; align-items: center; }
  .notice h2 i { width: 20px; height: 20px; border-radius: 50%; background: var(--bronze); color: #fff; font-style: normal; font-size: 9pt; display: grid; place-items: center; }
  .notice ul { list-style: none; margin-top: 8px; display: grid; gap: 6px; }
  .notice li { font-size: 8.3pt; line-height: 1.45; color: #2b2a27; display: grid; grid-template-columns: 12px 1fr; gap: 6px; }
  .notice li::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--bronze); margin-top: 5px; }
  .notice li b { color: var(--char); }
  .how { margin-top: 0.2in; }
  .how ol { list-style: none; display: grid; gap: 6px; margin-top: 6px; }
  .how li { display: grid; grid-template-columns: 24px 1fr; gap: 8px; font-size: 8.5pt; line-height: 1.45; align-items: start; }
  .legend { margin-top: 0.16in; display: flex; gap: 18px; font-size: 7.8pt; color: var(--muted); align-items: center; }
  .legend .note { margin: 0; padding: 4px 10px; }
</style></head><body>
<section class="page">
  <div class="band">${RING}
    <div class="band-top"><img src="ilene-logo-reverse.png" alt="ilene.ai"><span class="meta">Practical AI resource &middot; ${policy.date}</span></div>
    <p class="kicker">${esc(policy.kicker)}</p>
    <h1>${esc(policy.title)}</h1>
    <p class="sub">${esc(policy.subtitle)}</p>
  </div>
  <div class="pad">
    <div class="notice"><h2><i>!</i>${esc(policy.notice.title)}</h2>
      <ul>${policy.notice.items.map((t) => `<li><span>${inlineHTML(t).replace(/<span class="ph">\[|\]<\/span>/g, "")}</span></li>`).join("")}</ul>
    </div>
    <div class="how">
      <div class="sec-h"><h2>How to use this template</h2></div>
      <ol>${policy.howTo.map((t, i) => `<li><span class="n">${i + 1}</span><span>${inlineHTML(t)}</span></li>`).join("")}</ol>
      <div class="legend"><span><span class="ph">[Placeholder]</span> replace with your details</span><span class="note"><b>Guidance note</b> delete before approval</span></div>
    </div>
    <div class="sec" style="margin-top:0.22in">
      <div class="cta"><div><h3>Want help adapting and rolling it out?</h3><p>Through AI Governance, ilene.ai works with your leadership, legal and privacy advisors to set AI policy, approved tools and oversight that fit how your organization operates.</p></div><a href="https://ilene.ai/contact.html">Book a strategy call</a></div>
    </div>
  </div>
  <div class="foot"><span>&copy; 2026 <b>ilene.ai</b> &middot; ${esc(policy.footer)}</span></div>
</section></body></html>`;
}

function blockHTML(b) {
  if (b.p) return `<p class="pp">${inlineHTML(b.p)}</p>`;
  if (b.ul) return `<ul class="dots pl">${b.ul.map((t) => `<li><span>${inlineHTML(t)}</span></li>`).join("")}</ul>`;
  if (b.note) return `<div class="note"><b>Guidance note:</b> ${inlineHTML(b.note)}</div>`;
  if (b.table) {
    const t = b.table;
    return `<table class="t pt"><colgroup>${t.widths.map((w) => `<col style="width:${w}%">`).join("")}</colgroup><thead><tr>${t.cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${t.rows.map((r) => `<tr>${r.map((c) => `<td>${inlineHTML(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  }
  return "";
}

function policyBodyHTML() {
  const secs = policy.sections.map((s, i) => `<section class="ps"><h2><span class="num">${i + 1}</span>${esc(s.title)}</h2>${s.blocks.map(blockHTML).join("")}</section>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="brand.css">
<style>
  @page { size: Letter; margin: 0.95in 0.72in 0.85in; }
  body { font-size: 9.3pt; }
  .doc-title { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid var(--char); padding-bottom: 10px; }
  .doc-title .k { font-size: 6.8pt; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--bronze); }
  .doc-title h1 { font-size: 20pt; font-weight: 700; margin-top: 3px; }
  .control { margin-top: 12px; }
  .control td:first-child { width: 28%; }
  .ps { margin-top: 15px; }
  .ps h2 { font-size: 11.6pt; font-weight: 700; display: flex; gap: 9px; align-items: center; margin-bottom: 6px; break-after: avoid; }
  .ps h2 .num { width: 21px; height: 21px; border-radius: 50%; background: var(--char); color: var(--cream); font-size: 7.6pt; display: grid; place-items: center; flex: 0 0 auto; letter-spacing: 0; }
  .pp { margin-top: 5px; line-height: 1.55; }
  .pl { margin: 5px 0 0 2px; }
  .pl li { font-size: 9pt; line-height: 1.5; }
  .pt { margin-top: 7px; break-inside: auto; }
  .pt tr { break-inside: avoid; }
  .pt td:first-child { font-weight: 500; }
  .note { break-inside: avoid; }
  .appx { break-before: page; }
  .appx h2 { font-size: 13pt; font-weight: 700; margin-bottom: 10px; }
  .appx .checks li { font-size: 9.2pt; padding: 6px 0; border-bottom: 1px solid var(--line); }
  .ack { margin-top: 28px; }
  .ack p { line-height: 1.6; }
  .sign { margin-top: 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 22px 28px; }
  .sign div { border-bottom: 1px solid var(--char); height: 36px; display: flex; align-items: flex-end; }
  .sign span { font-size: 7.6pt; color: var(--muted); display: block; margin-top: 4px; }
</style></head><body>
  <div class="doc-title"><div><span class="k">Policy</span><h1><span class="ph">[Organization]</span> ${esc(policy.title)}</h1></div></div>
  <table class="t control"><tbody>${policy.control.map((r) => `<tr><td>${esc(r[0])}</td><td>${inlineHTML(r[1])}</td></tr>`).join("")}</tbody></table>
  ${secs}
  <section class="appx"><h2>${esc(policy.checklist.title)}</h2><ul class="checks">${policy.checklist.items.map((t) => `<li><span>${inlineHTML(t)}</span></li>`).join("")}</ul>
    <div class="ack"><h2>${esc(policy.acknowledgment.title)}</h2><p>${inlineHTML(policy.acknowledgment.text)}</p>
      <div class="sign">${policy.acknowledgment.fields.map((f) => `<label><div></div><span>${esc(f)}</span></label>`).join("")}</div></div>
  </section>
</body></html>`;
}

const HEADER = `<div style="width:100%;font-family:Poppins,sans-serif;font-size:7pt;color:#7a6544;padding:0 0.72in;display:flex;justify-content:space-between;align-items:center;-webkit-print-color-adjust:exact">
  <span style="letter-spacing:.14em;text-transform:uppercase;font-weight:700">Sample template &middot; ${policy.title}</span>
  <img src="data:image/png;base64,${fs.readFileSync(path.join(HERE, "ilene-logo-dark.png")).toString("base64")}" style="height:0.4in;width:auto"></div>`;
const FOOTER = `<div style="width:100%;font-family:Poppins,sans-serif;font-size:6.6pt;color:#5f5d57;padding:0 0.72in;display:flex;justify-content:space-between;gap:20px">
  <span>${policy.footer}</span></div>`;

/* ---------- policy as Word ---------- */
async function buildDocx() {
  const d = require("docx");
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, AlignmentType, Header, Footer, ImageRun, PageNumber, LevelFormat, PageBreak, HeadingLevel, TabStopType } = d;
  const FONT = "Poppins";
  const C = { char: "0E0E0D", cream: "EEEADE", line: "E6DFCF", kelly: "00703C", deep: "004225", bronze: "7A6544", muted: "5F5D57", notebg: "F6F3EA", zebra: "FAF8F2", phbg: "D9F2E9" };
  const CONTENT = 12240 - 2 * 1080; // Letter, 0.75in margins

  function runs(text, base = {}) {
    const out = [];
    const re = /(\*\*.+?\*\*|\[[^\]]+\])/g;
    let last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) out.push(new TextRun({ text: text.slice(last, m.index), font: FONT, ...base }));
      const tok = m[0];
      if (tok.startsWith("**")) out.push(new TextRun({ text: tok.slice(2, -2), font: FONT, ...base, bold: true }));
      else out.push(new TextRun({ text: tok, font: FONT, ...base, color: C.deep, shading: { type: ShadingType.CLEAR, color: "auto", fill: C.phbg } }));
      last = m.index + tok.length;
    }
    if (last < text.length) out.push(new TextRun({ text: text.slice(last), font: FONT, ...base }));
    return out;
  }
  const para = (text, opts = {}, base = {}) => new Paragraph({ spacing: { after: 100, line: 300 }, ...opts, children: runs(text, { size: 19, ...base }) });
  const bullet = (text, ref = "dots") => new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60, line: 288 }, children: runs(text, { size: 19 }) });
  const border = { style: BorderStyle.SINGLE, size: 4, color: C.line };
  const borders = { top: border, bottom: border, left: border, right: border };

  function table(cols, rows, widthsPct, opts = {}) {
    const widths = widthsPct.map((p) => Math.round((CONTENT * p) / 100));
    widths[widths.length - 1] = CONTENT - widths.slice(0, -1).reduce((a, b) => a + b, 0);
    const cell = (text, i, header, zebra) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA }, borders,
      shading: { type: ShadingType.CLEAR, color: "auto", fill: header ? C.char : zebra ? C.zebra : "FFFFFF" },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ spacing: { after: 0, line: 264 }, children: runs(text, { size: 17, color: header ? "FFFFFF" : C.char, bold: header || (i === 0 && opts.boldFirst !== false) }) })]
    });
    const trs = [];
    if (cols) trs.push(new TableRow({ tableHeader: true, children: cols.map((c, i) => cell(c, i, true)) }));
    rows.forEach((r, ri) => trs.push(new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, i, false, ri % 2 === 1)) })));
    return new Table({ width: { size: CONTENT, type: WidthType.DXA }, columnWidths: widths, rows: trs });
  }
  function box(children, fill, edge) {
    const e = { style: BorderStyle.SINGLE, size: 12, color: edge };
    const n = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    return new Table({ width: { size: CONTENT, type: WidthType.DXA }, columnWidths: [CONTENT], rows: [new TableRow({ children: [new TableCell({
      width: { size: CONTENT, type: WidthType.DXA }, borders: edge ? { top: e, bottom: e, left: e, right: e } : { top: n, bottom: n, left: { style: BorderStyle.SINGLE, size: 24, color: C.bronze }, right: n },
      shading: { type: ShadingType.CLEAR, color: "auto", fill }, margins: { top: 140, bottom: 140, left: 200, right: 200 }, children
    })] })] });
  }
  const note = (t) => box([new Paragraph({ spacing: { after: 0, line: 276 }, children: [new TextRun({ text: "Guidance note: ", bold: true, color: C.bronze, font: FONT, size: 17 }), ...runs(t, { size: 17, color: "4A4843" })] })], C.notebg);
  const spacer = (n = 120) => new Paragraph({ spacing: { after: n, before: 0 }, children: [new TextRun({ text: "", size: 2 })] });
  const h = (text, size = 26, extra = {}) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 280, after: 120 }, keepNext: true, children: [new TextRun({ text, bold: true, font: FONT, size, color: C.char })], ...extra });

  const logoDark = fs.readFileSync(path.join(HERE, "ilene-logo-dark.png"));
  const logo = (w) => new ImageRun({ type: "png", data: logoDark, transformation: { width: w, height: Math.round(w * 622 / 592) }, altText: { title: "ilene.ai", description: "ilene.ai logo", name: "ilene.ai" } });

  // cover section
  const cover = [
    new Paragraph({ spacing: { after: 240 }, children: [logo(64)] }),
    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: policy.kicker.toUpperCase(), bold: true, color: C.kelly, font: FONT, size: 15, characterSpacing: 40 })] }),
    new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: policy.title, bold: true, font: FONT, size: 52, color: C.char })] }),
    new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: policy.subtitle, font: FONT, size: 22, color: C.muted })] }),
    box([
      new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: policy.notice.title, bold: true, font: FONT, size: 23, color: C.char })] }),
      ...policy.notice.items.map((t) => new Paragraph({ numbering: { reference: "notice", level: 0 }, spacing: { after: 90, line: 276 }, children: runs(t.replace(/\[|\]/g, ""), { size: 17 }) }))
    ], "FBF9F4", C.bronze),
    new Paragraph({ spacing: { before: 300, after: 100 }, children: [new TextRun({ text: "How to use this template", bold: true, font: FONT, size: 23 })] }),
    ...policy.howTo.map((t) => new Paragraph({ numbering: { reference: "steps", level: 0 }, spacing: { after: 70, line: 280 }, children: runs(t, { size: 18 }) })),
    new Paragraph({ spacing: { before: 200, after: 0 }, children: [new TextRun({ text: "Want help adapting and rolling it out? ", bold: true, font: FONT, size: 18 }), new TextRun({ text: "Through AI Governance, ilene.ai works with your leadership, legal and privacy advisors to set AI policy, approved tools and oversight. hello@ilene.ai", font: FONT, size: 18, color: C.muted })] })
  ];

  // policy body
  const body = [
    new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "POLICY", bold: true, color: C.bronze, font: FONT, size: 15, characterSpacing: 40 })] }),
    new Paragraph({ spacing: { after: 200 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: C.char, space: 6 } }, children: runs("[Organization] " + policy.title, { size: 40, bold: true }) }),
    table(null, policy.control, [28, 72]),
  ];
  policy.sections.forEach((s, i) => {
    body.push(h(`${i + 1}. ${s.title}`));
    s.blocks.forEach((b) => {
      if (b.p) body.push(para(b.p));
      else if (b.ul) b.ul.forEach((t) => body.push(bullet(t)));
      else if (b.note) { body.push(spacer(60)); body.push(note(b.note)); body.push(spacer(60)); }
      else if (b.table) { body.push(spacer(40)); body.push(table(b.table.cols, b.table.rows, b.table.widths)); body.push(spacer(100)); }
    });
  });
  body.push(new Paragraph({ children: [new PageBreak()] }));
  body.push(h(policy.checklist.title, 28));
  policy.checklist.items.forEach((t) => body.push(new Paragraph({ spacing: { after: 90, line: 288 }, children: [new TextRun({ text: "☐  ", font: "Segoe UI Symbol", size: 22, color: C.kelly }), ...runs(t, { size: 19 })] })));
  body.push(h(policy.acknowledgment.title, 28, { spacing: { before: 480, after: 120 } }));
  body.push(para(policy.acknowledgment.text));
  policy.acknowledgment.fields.forEach((f) => {
    body.push(new Paragraph({ spacing: { before: 360, after: 0 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.char, space: 2 } }, children: [new TextRun({ text: " ", font: FONT })] }));
    body.push(new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: f, font: FONT, size: 15, color: C.muted })] }));
  });

  const footer = new Footer({ children: [new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: CONTENT }], border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.line, space: 6 } }, children: [
    new TextRun({ text: policy.footer, font: FONT, size: 13, color: C.muted }),
    new TextRun({ children: ["\tPage ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES], font: FONT, size: 13, color: C.muted })
  ] })] });
  const header = new Header({ children: [new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: CONTENT }], children: [
    new TextRun({ text: ("Sample template · " + policy.title).toUpperCase(), font: FONT, size: 13, bold: true, color: C.bronze, characterSpacing: 20 }),
    new TextRun({ text: "\t", font: FONT }), logo(30)
  ] })] });
  const page = { size: { width: 12240, height: 15840 }, margin: { top: 1300, bottom: 1150, left: 1080, right: 1080, header: 560, footer: 520 } };
  const numbering = { config: [
    { reference: "dots", levels: [{ level: 0, format: LevelFormat.BULLET, text: "●", alignment: AlignmentType.LEFT, style: { run: { color: C.kelly, size: 14 }, paragraph: { indent: { left: 400, hanging: 260 } } } }] },
    { reference: "notice", levels: [{ level: 0, format: LevelFormat.BULLET, text: "●", alignment: AlignmentType.LEFT, style: { run: { color: C.bronze, size: 14 }, paragraph: { indent: { left: 360, hanging: 240 } } } }] },
    { reference: "steps", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { run: { color: C.kelly, bold: true }, paragraph: { indent: { left: 400, hanging: 300 } } } }] }
  ] };
  const doc = new Document({
    creator: "ilene.ai", title: policy.title + " (sample template)", description: "Sample AI acceptable use policy template from ilene.ai. Not legal advice.",
    styles: { default: { document: { run: { font: FONT, size: 19, color: C.char } } },
      paragraphStyles: [{ id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 26, bold: true, color: C.char }, paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 0 } }] },
    numbering,
    sections: [
      { properties: { page }, footers: { default: footer }, children: cover },
      { properties: { page }, headers: { default: header }, footers: { default: footer }, children: body }
    ]
  });
  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(OUT, "ai-acceptable-use-policy-template.docx"), buf);
}

/* ---------- render ---------- */
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const block = (r) => r.abort();
  await page.route(/fonts\.(googleapis|gstatic)/, block);

  // KPI guide: fixed pages, full bleed
  await page.goto(fileUrl("measuring-ai-value.html"));
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: path.join(OUT, "measuring-ai-value.pdf"), format: "Letter", printBackground: true, preferCSSPageSize: true });

  // Policy: full-bleed cover, then flowing body with running header and footer
  fs.writeFileSync(path.join(HERE, "_policy-cover.html"), policyCoverHTML());
  fs.writeFileSync(path.join(HERE, "_policy-body.html"), policyBodyHTML());
  await page.goto(fileUrl("_policy-cover.html"));
  await page.evaluate(() => document.fonts.ready);
  const cover = await page.pdf({ format: "Letter", printBackground: true, preferCSSPageSize: true });
  await page.goto(fileUrl("_policy-body.html"));
  await page.evaluate(() => document.fonts.ready);
  const body = await page.pdf({ format: "Letter", printBackground: true, displayHeaderFooter: true, headerTemplate: HEADER, footerTemplate: FOOTER, margin: { top: "0.95in", bottom: "0.85in", left: "0.72in", right: "0.72in" } });
  await browser.close();

  const merged = await PDFDocument.create();
  for (const src of [cover, body]) {
    const doc = await PDFDocument.load(src);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  // page numbers across the whole document (cover included), in Poppins
  merged.registerFontkit(require("@pdf-lib/fontkit"));
  const font = await merged.embedFont(fs.readFileSync(POPPINS), { subset: true });
  const all = merged.getPages();
  all.forEach((pg, i) => {
    if (i === 0) return;
    const label = `Page ${i + 1} of ${all.length}`;
    const size = 6.6, w = font.widthOfTextAtSize(label, size);
    pg.drawText(label, { x: pg.getWidth() - 0.72 * 72 - w, y: 18.6, size, font, color: rgb(0x5f / 255, 0x5d / 255, 0x57 / 255) });
  });
  merged.setTitle("AI Acceptable Use Policy (sample template) | ilene.ai");
  merged.setAuthor("ilene.ai");
  fs.writeFileSync(path.join(OUT, "ai-acceptable-use-policy-template.pdf"), await merged.save());
  fs.unlinkSync(path.join(HERE, "_policy-cover.html"));
  fs.unlinkSync(path.join(HERE, "_policy-body.html"));

  await buildDocx();
  console.log("Built: measuring-ai-value.pdf, ai-acceptable-use-policy-template.pdf, ai-acceptable-use-policy-template.docx");
})().catch((e) => { console.error(e); process.exit(1); });
