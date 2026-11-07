"""Shared helpers for the ilene.ai playbook resources (HTML sources rendered to PDF by build.js)."""
import html, re

EXTRA_CSS = """
  .runhead .k { color: var(--bronze); }
  .pb p.body { font-size: 9.8pt; line-height: 1.55; color: #2b2a27; margin-top: 4px; }
  .pb p.body + p.body { margin-top: 6px; }
  .pb .sec { margin-top: 0.24in; }
  .pb .sec-h { margin-bottom: 8px; }
  .pb .sec-h h2 { font-size: 13.4pt; }
  .pb .intro { font-size: 10.6pt; color: var(--muted); margin-top: 0.14in; max-width: 6.9in; }
  .pb table.t { font-size: 8.9pt; }
  .pb table.t th { font-size: 8.6pt; padding: 8px 10px; }
  .pb table.t td { padding: 7px 10px; line-height: 1.45; }
  .pb .dots { gap: 6px; }
  .pb .dots li { font-size: 9.5pt; line-height: 1.5; }
  .pb .dots li::before { margin-top: 6px; }
  .callout { background: var(--cream); border-radius: 12px; padding: 12px 16px; font-size: 9.8pt; font-weight: 600; line-height: 1.45; margin-top: 0.24in; }
  .callout .lbl { display: block; font-size: 6.6pt; letter-spacing: .16em; text-transform: uppercase; color: var(--bronze); font-weight: 700; margin-bottom: 2px; }
  .quote { border-left: 3px solid var(--kelly); padding: 6px 0 6px 14px; font-size: 9.6pt; line-height: 1.5; color: #2b2a27; font-style: italic; }
  .boxes { white-space: nowrap; letter-spacing: 4px; color: var(--muted); font-size: 11pt; }
  .pb .cta h3 { font-size: 12.6pt; } .pb .cta p { font-size: 9pt; } .pb .cta a { font-size: 9pt; }
  .toc { columns: 2; column-gap: 0.4in; font-size: 9.2pt; margin-top: 4px; }
  .toc div { display: flex; justify-content: space-between; border-bottom: 1px dotted var(--line); padding: 3px 0; break-inside: avoid; }
  .toc span.p { color: var(--muted); font-variant-numeric: tabular-nums; }
  .fill td { height: 0.42in; }
  .fill.tight td { height: 0.3in; padding-top: 4px; padding-bottom: 4px; }
  .formrow { display: grid; grid-template-columns: 1.9in 1fr; gap: 10px; border-bottom: 1px solid var(--line); padding: 14px 0; font-size: 9.6pt; }
  .formrow b { font-weight: 600; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .src { font-size: 8.8pt; line-height: 1.5; display: grid; gap: 3px; }
  .src a { color: var(--char); }
  .src b { color: var(--bronze); }
  .small-note { font-size: 8.2pt; color: var(--muted); margin-top: 8px; line-height: 1.45; }
"""

def t(s):
    """Escape text and turn **bold** into <b>."""
    s = html.escape(s, quote=False)
    return re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)

def sec(num, title, inner):
    tag = f'<span class="tag">{num}</span>' if num else ""
    return f'<div class="sec"><div class="sec-h">{tag}<h2>{t(title)}</h2></div>{inner}</div>'

def body(*paras):
    return "".join(f'<p class="body">{t(p)}</p>' for p in paras)

def dots(items):
    return '<ul class="dots">' + "".join(f"<li><span>{t(i)}</span></li>" for i in items) + "</ul>"

def table(head, rows, widths=None):
    cols = ""
    if widths:
        cols = "<colgroup>" + "".join(f'<col style="width:{w}">' for w in widths) + "</colgroup>"
    h = "<tr>" + "".join(f"<th>{t(c)}</th>" for c in head) + "</tr>"
    r = "".join("<tr>" + "".join(f"<td>{c if c.startswith('<') else t(c)}</td>" for c in row) + "</tr>" for row in rows)
    return f'<table class="t">{cols}{h}{r}</table>'

def callout(text, label=None):
    lbl = f'<span class="lbl">{t(label)}</span>' if label else ""
    return f'<div class="callout">{lbl}{t(text)}</div>'

def note(text):
    return f'<p class="small-note">{t(text)}</p>'

def cta(title, text, link_text="Book a strategy call", href="https://ilene.ai/contact.html"):
    return (f'<div class="sec" style="margin-top:0.16in"><div class="cta"><div><h3>{t(title)}</h3>'
            f'<p>{t(text)}</p></div><a href="{href}">{t(link_text)}</a></div></div>')

class Doc:
    def __init__(self, title, short, kicker_series, date_label):
        self.title, self.short, self.series, self.date = title, short, kicker_series, date_label
        self.pages = []

    def cover(self, kicker, subtitle, inner):
        self.pages.append(("cover", kicker, subtitle, inner))

    def page(self, num, title, inner, lede=None):
        self.pages.append(("page", num, title, inner, lede))

    def render(self):
        n = len(self.pages)
        out = []
        for i, p in enumerate(self.pages, 1):
            foot_left = "&copy; 2026 <b>ilene.ai</b> &middot; AI to ROI" if i < n else "&copy; 2026 <b>ilene.ai</b> &middot; hello@ilene.ai"
            foot = f'<div class="foot"><span>{foot_left}</span><span>{t(self.short)} &middot; {i} of {n}</span></div>'
            if p[0] == "cover":
                _, kicker, sub, inner = p
                out.append(f'''<section class="page pb">
  <div class="band">
    <svg class="ring" viewBox="0 0 656 700" aria-hidden="true"><path d="M433.1 125.2 A258 258 0 1 1 216.9 125.2"/><line x1="325" y1="78" x2="325" y2="226"/></svg>
    <div class="band-top"><img src="ilene-logo-reverse.png" alt="ilene.ai"><span class="meta">{t(self.series)} &middot; {t(self.date)}</span></div>
    <p class="kicker">{t(kicker)}</p>
    <h1>{t(self.title)}</h1>
    <p class="sub">{t(sub)}</p>
  </div>
  <div class="pad">{inner}</div>
  {foot}
</section>''')
            else:
                _, num, title, inner, lede = p
                ld = f'<p class="intro">{t(lede)}</p>' if lede else ""
                out.append(f'''<section class="page pb">
  <div class="runhead"><div><span class="k">{num} &middot; {t(self.short)}</span><h2>{t(title)}</h2></div><img src="ilene-logo-dark.png" alt="ilene.ai"></div>
  <div class="pad">{ld}{inner}</div>
  {foot}
</section>''')
        return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{t(self.title)} | ilene.ai</title>
<link rel="stylesheet" href="brand.css">
<style>{EXTRA_CSS}</style>
</head>
<body>
{chr(10).join(out)}
</body>
</html>
'''
