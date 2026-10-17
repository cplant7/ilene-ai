# ilene.ai website

Static site for GitHub Pages. No build step is needed to publish: copy these files to the root of the `cplant7/ilene-ai` repo (replacing the old pages) and push to the branch GitHub Pages serves.

## Pages
- `index.html`: home (tile power-symbol hero, five-solution carousel, data section, Scorecard, method, resources)
- `solutions.html`: the five solutions, data foundations, AI journey stages, where we apply the work
- `scorecard.html`: the AI Operations Maturity Scorecard (product page)
- `resources.html`, `stalled-ai-calculator.html`, `resources/*.pdf`: free resources
- `about.html`, `contact.html`
- `products.html`: redirects to `scorecard.html`

## Contact form
`email-check.js` validates addresses (format, common typos such as `gmial.com` or `.con`, and a prompt to confirm personal addresses like Gmail). A real deliverability check (does the mailbox exist?) needs a server or your CRM.

Submissions open the visitor's email app until a CRM form is connected. To send them to HubSpot instead, create a form in HubSpot, then fill in `portalId` and `formGuid` at the top of `contact.js`. Check that the field names in `contact.js` (firstname, lastname, email, company, message) match your HubSpot form.

## Editing
Pages are generated from `build/` (shared header, footer and content). Edit the Python files there and run `python3 build/build.py`, or edit the HTML directly for small changes. The calculator page is rebuilt from the previous calculator source; if that source path isn't available, edit `stalled-ai-calculator.html` directly.

## Motion
All animation respects the visitor's reduced-motion setting. Motion pieces: hero tiles assembling into the power symbol, the solution carousel, the data-flow canvas, the maturity radar, the method progress line and the practice-area marquee.
