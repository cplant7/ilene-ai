"""Source for resources/ai-strategy-playbook.pdf. Run: python3 build/resources/ai_strategy_playbook.py"""
import os, re
from playbook_kit import *

d = Doc("AI Strategy Playbook", "AI Strategy", "Executive playbook", "November 2026")

CSS = """
  .cover-grid { display: grid; grid-template-columns: 3.1in 1fr; gap: 0; margin-top: 0.24in; border-radius: 14px; overflow: hidden; }
  .cover-grid img { width: 100%; height: 3.3in; object-fit: cover; display: block; }
  .cover-grid .ex { background: var(--cream); padding: 18px 20px; }
  .cover-grid .ex .lbl { font-size: 6.6pt; letter-spacing: .16em; text-transform: uppercase; color: var(--bronze); font-weight: 700; }
  .cover-grid .ex h3 { font-size: 15pt; font-weight: 700; margin-top: 6px; }
  .cover-grid .ex p { font-size: 9.4pt; line-height: 1.5; margin-top: 8px; color: #2b2a27; }
  .fw { display: grid; gap: 0; margin-top: 0.18in; }
  .fw .row { display: grid; grid-template-columns: 0.5in 1fr 1.5in; gap: 14px; align-items: start; padding: 11px 0; border-bottom: 1px solid var(--line); }
  .fw .num { width: 0.42in; height: 0.42in; border-radius: 10px; background: var(--char); color: #fff; font-weight: 700; font-size: 11pt; display: grid; place-items: center; }
  .fw h3 { font-size: 12pt; font-weight: 700; }
  .fw .q { font-size: 9.6pt; font-weight: 600; margin-top: 2px; }
  .fw .e { font-size: 8.8pt; color: var(--muted); margin-top: 2px; }
  .fw .own { font-size: 6.8pt; letter-spacing: .14em; text-transform: uppercase; color: var(--bronze); font-weight: 700; padding-top: 4px; }
  .fw .own span { display: block; font-size: 8.6pt; letter-spacing: 0; text-transform: none; color: var(--char); font-weight: 600; margin-top: 2px; }
  .rows .r { display: grid; grid-template-columns: 1.7in 1fr; gap: 16px; padding: 11px 0; border-bottom: 1px solid var(--line); font-size: 9.6pt; line-height: 1.55; }
  .rows .r:first-child { border-top: 1px solid var(--line); }
  .rows .r b { font-weight: 700; }
  .bars { margin-top: 8px; display: grid; gap: 9px; }
  .bar { display: grid; grid-template-columns: 1.7in 1fr 0.45in 0.7in; gap: 12px; align-items: center; font-size: 9.2pt; }
  .bar .track { position: relative; height: 16px; background: var(--cream); border-radius: 4px; }
  .bar .fill { position: absolute; left: 0; top: 0; bottom: 0; background: var(--char); border-radius: 4px; }
  .bar .v { font-weight: 700; text-align: right; }
  .bar .s { color: var(--muted); font-size: 8.4pt; font-variant-numeric: tabular-nums; }
  .cap .bar { grid-template-columns: 0.45in 1fr 0.7in; }
  .cap .track { overflow: visible; }
  .cap .line { position: absolute; top: -6px; bottom: -6px; width: 2px; background: var(--kelly); left: 40%; }
  .legend { font-size: 8.2pt; color: var(--muted); margin-top: 10px; display: flex; gap: 8px; align-items: center; }
  .legend i { display: inline-block; width: 12px; height: 2px; background: var(--kelly); }
  .steps { display: grid; grid-template-columns: 2.4in 1fr; gap: 20px; margin-top: 0.2in; align-items: start; }
  .steps img { width: 100%; height: 2.6in; object-fit: cover; border-radius: 12px; display: block; }
  .steps ol { margin: 6px 0 0; padding-left: 18px; font-size: 9.6pt; line-height: 1.55; display: grid; gap: 7px; }
  .tl { display: grid; gap: 10px; margin-top: 0.2in; }
  .tl .s { display: grid; grid-template-columns: 1.15in 1fr; gap: 16px; }
  .tl .d { background: var(--char); color: #fff; border-radius: 10px; padding: 12px; font-weight: 700; font-size: 10pt; }
  .tl h3 { font-size: 12pt; font-weight: 700; }
  .tl p { font-size: 9.4pt; line-height: 1.5; margin-top: 3px; }
  .tl .g { font-size: 8.6pt; color: var(--bronze); font-weight: 600; margin-top: 5px; }
  .form .f { border-bottom: 1px solid var(--line); padding: 10px 0 0.62in; }
  .form .f h3 { font-size: 11pt; font-weight: 700; }
  .form .f p { font-size: 8.8pt; color: var(--muted); margin-top: 2px; }
  .toc2 { margin-top: 0.12in; }
  .toc2 h3 { font-size: 10.4pt; font-weight: 700; color: var(--bronze); margin: 0.18in 0 4px; }
  .toc2 a { display: flex; justify-content: space-between; text-decoration: none; color: var(--char); border-bottom: 1px solid var(--line); padding: 7px 0; font-size: 10pt; }
  .toc2 a span:last-child { color: var(--muted); font-variant-numeric: tabular-nums; }
  .neg { color: #9b2c1f; font-weight: 600; }
  .tl .tlph { display: block; font-size: 7pt; letter-spacing: .16em; text-transform: uppercase; color: var(--bronze); font-weight: 700; margin-bottom: 2px; }

  .pb .intro { font-size: 11.2pt; line-height: 1.5; margin-top: 0.18in; }
  .pb .sec { margin-top: 0.32in; }
  .pb .sec-h h2 { font-size: 14.4pt; }
  .pb p.body { font-size: 10.4pt; line-height: 1.6; }
  .pb .dots li { font-size: 10.2pt; line-height: 1.55; }
  .pb table.t { font-size: 9.8pt; }
  .pb table.t th { font-size: 9.2pt; padding: 10px 12px; }
  .pb table.t td { padding: 10px 12px; line-height: 1.5; }
  .callout { font-size: 10.4pt; padding: 16px 20px; margin-top: 0.32in; line-height: 1.5; }
  .callout .lbl { font-size: 7pt; margin-bottom: 5px; }
  .small-note { font-size: 8.8pt; }
  .small { font-size: 8.6pt; }
  .rows .r { font-size: 10.4pt; padding: 15px 0; grid-template-columns: 1.8in 1fr; }
  .rows { margin-top: 0.1in; }
  .fw .row { padding: 15px 0; }
  .fw .q { font-size: 10.4pt; } .fw .e { font-size: 9.4pt; } .fw h3 { font-size: 13pt; }
  .bar { font-size: 10pt; } .bar .track { height: 20px; } .bars { gap: 12px; }
  .tl { gap: 14px; } .tl .s { grid-template-columns: 1.3in 1fr; } .tl .d { font-size: 10.4pt; padding: 16px 14px; }
  .tl h3 { font-size: 13pt; } .tl p { font-size: 10.2pt; } .tl .g { font-size: 9.4pt; }
  .steps ol { font-size: 10.2pt; } .steps img { height: 2.9in; }
  .form .f { padding: 14px 0 0.78in; } .form .f h3 { font-size: 12pt; } .form .f p { font-size: 9.6pt; }
  .toc2 a { font-size: 10.6pt; padding: 8px 0; }
  .cover-grid img { height: 3.6in; } .cover-grid .ex p { font-size: 10.2pt; }
  .pb .cta h3 { font-size: 13pt; } .pb .cta p { font-size: 9.6pt; }
"""

def rows(items):
    return '<div class="rows">' + "".join(f'<div class="r"><b>{t(a)}</b><span>{t(b)}</span></div>' for a, b in items) + "</div>"

# ---------- Cover ----------
d.cover("AI strategy",
    "Decide where AI can improve service, what to fund and when to expand.",
    '<p class="intro">For executives, service owners and the teams implementing AI. Each chapter ends with a decision or a usable piece of the strategy.</p>'
    + '<div class="cover-grid"><img src="strategy-cover.jpg" alt="">'
      '<div class="ex"><span class="lbl">The running example</span><h3>A resident needs a reliable answer.</h3>'
      '<p>Follow a municipal service team as it tests AI-assisted replies against its existing process. The same decisions apply to any customer support desk, public or private.</p></div></div>'
    + sec("", "What this playbook gives you", dots([
        "Six phases, from Discover to Measure & Improve, each with a named owner and the evidence it needs.",
        "A worked business case that shows when a pilot pays back and when it does not.",
        "Pilot gates, acceptance tests and a 90-day calendar you can adapt.",
        "An executive decision record to complete for every funding decision."]))
    + note("Version 1.0, November 2026. All figures are illustrative, in Canadian dollars, and are not benchmarks. Replace them with your own baseline before making a funding decision. This guide is not legal or financial advice."))

# ---------- Contents ----------
TOC1 = [("The AI strategy framework", 3), ("Discover: Define the ambition", 4), ("Prioritize: Choose the first investment", 5),
        ("Plan & Design: Design the service", 6), ("Plan & Design: Build the investment case", 7),
        ("Implement: Prove it in a pilot", 8), ("Adopt: Scale with accountability", 9),
        ("Measure & Improve: Track value and improve", 10), ("The first 90 days", 11), ("Executive decision record", 12)]
TOC2 = [("Discover: Establish a usable baseline", 13), ("Prioritize: Choose the delivery approach", 14),
        ("Plan & Design: Test the service before launch", 15), ("Plan & Design: Stress-test the investment", 16),
        ("Implement: Read the pilot results", 17), ("Measure & Improve: Convert capacity into value", 18),
        ("Where to go next", 19)]
def toc_list(items):
    return "".join(f'<a href="#p{p}"><span>{t(a)}</span><span>{p}</span></a>' for a, p in items)
d.page("Contents", "Table of contents",
    '<div class="toc2"><h3>Strategy and implementation</h3>' + toc_list(TOC1)
    + '<h3>Worked case and decision tools</h3>' + toc_list(TOC2) + "</div>",
    lede="Select a chapter to jump to it. The first section sets out the strategy, phase by phase. The worked case applies it to the running example with numbers.")

# ---------- Framework ----------
FW = [("01", "Discover", "Which result warrants investment?", "A service outcome, a baseline and a spending limit", "Executive sponsor"),
      ("02", "Prioritize", "Which workflow should go first?", "Ranked options and a non-AI alternative", "Service owner"),
      ("03", "Plan & Design", "Can the team run it responsibly?", "A bounded workflow and a cost model", "Service and IT leads"),
      ("04", "Implement", "Is there enough evidence to release it?", "A comparison of quality, time and cost", "Pilot lead"),
      ("05", "Adopt", "Can each new team run it safely?", "A named owner, a fallback and a monitoring plan", "Service owner"),
      ("06", "Measure & Improve", "Where should the next dollar go?", "Actual costs and redeployed hours against the business case", "Portfolio sponsor")]
fw = '<div class="fw">' + "".join(
    f'<div class="row"><div class="num">{n}</div><div><h3>{t(a)}</h3><p class="q">{t(q)}</p><p class="e">Evidence: {t(e)}</p></div>'
    f'<div class="own">Owner<span>{t(o)}</span></div></div>' for n, a, q, e, o in FW) + "</div>"
d.page("Strategy at a glance", "The AI strategy framework",
    fw + callout("If a test fails, return to the phase that introduced the problem. A source error belongs in Plan & Design. Weak demand belongs in Prioritize.", "When a test fails"),
    lede="This playbook follows the six ilene.ai delivery phases. Use them as a shared map. Each owner brings one piece of evidence to the next phase.")

# ---------- 01 Align ----------
d.page("01 &middot; Discover", "Define the ambition",
    callout("Over 90 days, test whether staff can answer routine resident questions faster while preserving accuracy. Staff approve every reply. Further funding is released only after the sponsor reviews the evidence.", "A strategy statement the sponsor can approve")
    + '<div class="sec">' + rows([
        ("Customer outcome", "Reduce the time a resident waits for a correct answer. Track repeat contacts within seven days so a fast but incomplete reply is visible."),
        ("Business outcome", "Recover staff capacity for complex cases. Record how the manager will use the time, such as clearing a backlog during peak intake."),
        ("Scope and exclusions", "Start with general hours, collection schedules and published service rules. Refer account-specific questions, eligibility decisions and appeals to a specialist."),
        ("Investment appetite", "Name the sponsor, the maximum pilot spend and the decision date. Include staff review time, integration, training and ongoing supervision in the estimate.")]) + "</div>"
    + callout("The sponsor signs off the outcome, budget ceiling and exclusions. If the problem has no baseline, fund measurement first (page 13).", "Decision to record"),
    lede="Agree on one customer outcome before choosing a product. A narrow first commitment gives the team room to learn at a known cost.")

# ---------- 02 Select ----------
SC = [("Draft routine replies", 4.5, "5 / 4 / 4"), ("Summarize case notes", 3.5, "4 / 3 / 3"), ("Forecast staffing", 3.1, "3 / 4 / 2")]
bars = '<div class="bars">' + "".join(
    f'<div class="bar"><span>{t(a)}</span><div class="track"><div class="fill" style="width:{v/5*100:.0f}%"></div></div><span class="v">{v}</span><span class="s">{s}</span></div>'
    for a, v, s in SC) + "</div>"
d.page("02 &middot; Prioritize", "Choose the first investment",
    sec("", "Opportunity scores", '<p class="small">Illustrative weighted score out of 5. Inputs at right: value / feasibility / readiness.</p>' + bars
        + note("Score each input from 1 to 5. Weight value at 50%, feasibility at 30% and readiness at 20%. Example: 5 × 0.5 + 4 × 0.3 + 4 × 0.2 = 4.5."))
    + '<div class="sec">' + rows([
        ("Scoring anchors", "Value rises with measurable customer impact. Feasibility rises with tool fit and low integration effort. Readiness rises with usable data, a named owner and staff capacity."),
        ("Eligibility check", "Park any option without approved data access or a credible human review path. Revisit it when the owner resolves the dependency."),
        ("Cheaper alternative", "Compare reply drafting with refreshed templates and better policy search. Choose the lower-cost option if it achieves the same service outcome.")]) + "</div>",
    lede="Have the service owner and frontline staff score the same shortlist independently, then discuss the assumptions behind the largest differences.")

# ---------- 03 Design ----------
d.page("03 &middot; Plan &amp; Design", "Design the service",
    '<div class="steps"><img src="strategy-design.jpg" alt=""><div><h3 style="font-size:12pt">A staff-reviewed reply</h3><ol>'
    '<li>A clerk removes personal identifiers and selects an approved question category.</li>'
    '<li>The assistant drafts a reply from current service policies and returns the source passage.</li>'
    '<li>The clerk checks the passage, corrects the draft and sends the reply. Missing or conflicting guidance goes to a specialist.</li>'
    '</ol></div></div>'
    + '<div class="sec">' + rows([
        ("Choose the approach", "Start with approved templates. Test an existing platform's drafting feature if templates fall short. Fund a custom integration only when the pilot shows value and the platform cannot meet a documented need."),
        ("Control the data", "The policy owner approves sources and their expiry dates. IT verifies access, retention, deletion and how the supplier uses prompts. Test a prohibited input and an outdated policy before launch.")]) + "</div>"
    + callout("When a source is missing or the tool is unavailable, staff use the existing policy search and manual reply path. The clerk keeps ownership of the case.", "Fallback"),
    lede="Map one real request from intake to resolution. Show who can see the information, who can act and where a person takes over.")

# ---------- 03 Design: investment case ----------
CAP = [("25%", 25, "$1,125"), ("50%", 50, "$2,250"), ("75%", 75, "$3,375"), ("100%", 100, "$4,500")]
cap = '<div class="bars cap">' + "".join(
    f'<div class="bar"><span>{a}</span><div class="track"><div class="fill" style="width:{w}%"></div><div class="line"></div></div><span class="v">{v}</span></div>'
    for a, w, v in CAP) + '</div><div class="legend"><i></i>Green line = $1,800 monthly running cost (break-even at 40% adoption)</div>'
d.page("03 &middot; Plan &amp; Design", "Build the investment case",
    sec("", "Monthly capacity value at different adoption levels", '<p class="small">Illustrative, CAD. 2,000 eligible cases per month.</p>' + cap)
    + '<div class="sec">' + rows([
        ("Assumptions", "Three net minutes recovered per assisted case, including review, at $45 per staff hour, or $2.25 per case. At 50% adoption: 1,000 cases × 3 minutes ÷ 60 × $45 = $2,250 per month."),
        ("Break-even", "At $2.25 per assisted case, 800 cases (40% adoption) cover the monthly running cost. A $9,000 setup cost takes 20 months to recover at 50% adoption, assuming stable volume and costs."),
        ("Funding decision", "At 50% adoption the margin is $450 per month in capacity value. Before recording a financial benefit, Finance must identify usable hours, avoided overtime or an actual budget reduction.")]) + "</div>",
    lede="A pilot can save minutes and still cost more than the capacity it frees. Model the volume of eligible work and the share staff will actually use.")

# ---------- 04 Prove ----------
d.page("04 &middot; Implement", "Prove it in a pilot",
    rows([
        ("Test design", "Compare AI-assisted drafting with improved templates. Assign eligible cases to both groups during the same weeks. Balance request types and staff experience. Keep human approval in both groups."),
        ("Time and quality", "Record median handling time, including review. Have a second reviewer check replies against the policy in force without knowing which group produced them. Also track seven-day repeat contacts."),
        ("Illustrative gates", "At least 3 minutes saved per case on average (the cost model assumption), at least 98% policy accuracy, and repeat contacts no higher than the comparison group. Any critical disclosure pauses the pilot."),
        ("Evidence sufficiency", "Start with 100 replies per group for a first read. Check variation and results for each request type. Extend the test if rare errors, a small subgroup or a close result could change the decision.")])
    + callout("Scale one queue if the quality gates hold and measured time, volume and adoption support the cost model. Redesign if a correctable failure dominates. Stop if the simpler alternative delivers comparable value.", "Decision at the pilot review"),
    lede="Agree on release thresholds before customers see any change. The figures below are sample targets for the service desk example.")

# ---------- 05 Scale ----------
d.page("05 &middot; Adopt", "Scale with accountability",
    rows([
        ("Daily: team lead", "Review flagged replies and failed source retrieval. Give staff one place to report a bad answer with its source and case reference. Route urgent incidents to the service owner immediately."),
        ("Weekly: service owner", "Sample sent replies, including low-volume categories. Review adoption, correction time and repeat contacts by queue. Coach staff on recurring errors and update the source policy where needed."),
        ("On change: IT lead", "Version the tool, prompt and approved sources. Re-run a reference set of routine, ambiguous and prohibited requests after each change. Restore the prior version if quality drops.")])
    + callout("Pause the affected workflow. Preserve the relevant version and case record, identify affected recipients, assign corrections and test the fix. The service owner documents the restart decision.", "When an answer causes harm"),
    lede="Release to one additional team at a time. Assign a service owner with the authority to pause the tool and restore the manual process.")

# ---------- 06 Measure & Improve ----------
d.page("06 &middot; Measure &amp; Improve", "Track value and improve",
    rows([
        ("Monthly: sponsor", "Compare actual costs and redeployed hours with the business case. Decide whether the next investment goes to a wider rollout, a bottleneck fix or another opportunity."),
        ("Three measures", "Adoption: the share of eligible cases that staff assist with the tool. Value: the hours redeployed and what they were used for. Risk: policy accuracy, repeat contacts and incidents."),
        ("Count value once", "Report capacity value and cash savings separately. Finance records a cash saving only when spend actually falls. The worked case on page 18 shows the numbers."),
        ("Improve the service", "Feed recurring errors back into the approved sources and staff coaching. Re-run the reference tests after each change, and compare the result with the pilot baseline.")])
    + callout("At each review the sponsor continues, changes or stops the funding and records the reason in the executive decision record (page 12).", "Decision to record"),
    lede="Compare what the service delivers with what the business case assumed. Use each review to decide where the next dollar goes.")

# ---------- 90 days ----------
TL = [("Days 1–15", "Discover", "Agree on the problem", "Observe live work, sample past requests and establish current handling time, accuracy and repeat contacts.", "Gate: the sponsor approves the mandate and pilot ceiling."),
      ("Days 16–30", "Prioritize · Plan & Design", "Select and design", "Score the options, improve the template baseline and map the proposed service. Check approved sources, controls and costs.", "Gate: the service owner authorizes a bounded test."),
      ("Days 31–60", "Implement", "Run the comparison", "Train reviewers, assign cases and hold a weekly error review. Capture staff effort and follow up on repeat contacts.", "Gate: the pilot lead submits results and material exceptions."),
      ("Days 61–90", "Adopt · Measure & Improve", "Decide and transfer", "Compare outcomes and costs, run a fallback exercise and give the receiving team a named owner, budget and review date.", "Gate: the sponsor funds the rollout, requests changes or closes the work.")]
tl = '<div class="tl">' + "".join(f'<div class="s"><div class="d">{t(a)}</div><div><span class="tlph">{t(ph)}</span><h3>{t(b)}</h3><p>{t(c)}</p><p class="g">{t(g)}</p></div></div>' for a, ph, b, c, g in TL) + "</div>"
d.page("Implementation", "The first 90 days", tl,
    lede="Use this calendar to reserve people and decision time across the six phases. Move ahead only when the named owner can show the evidence for the next commitment.")

# ---------- Decision record ----------
FORM = [("Outcome and owner", "Who owns the service result? Which customer group will benefit?"),
        ("Options considered", "What did the simpler alternative achieve? Why is AI justified here?"),
        ("Evidence and economics", "Record the baseline, observed outcome, adoption, full cost and usable hours."),
        ("Limits and safeguards", "Name the excluded cases, unresolved risks, reviewer and fallback."),
        ("Decision and next review", "Fund, revise or stop. Enter the amount, accountable owner and review date.")]
d.page("Working template", "Executive decision record",
    '<div class="form">' + "".join(f'<div class="f"><h3>{t(a)}</h3><p>{t(b)}</p></div>' for a, b in FORM) + "</div>"
    + callout("What evidence would change this decision, and who will bring it back?", "Review question"),
    lede="Complete this page for each funding decision. Use a short statement and a reference to the underlying evidence.")

# ---------- Worked case 01 ----------
d.page("Worked case 01 &middot; Discover", "Establish a usable baseline",
    sec("", "Define the unit of work", body("Use the original enquiry as the unit. Link any repeat contact within seven days to the original case and count the time spent on both. Allow the final week of cases seven more days to mature before comparing repeat rates."))
    + '<div class="sec">' + table(["Measure", "Working definition"], [
        ["Eligibility", "Tag every incoming case by category before assignment. Exclude account changes, disputes and cases that require an identity check. Record the exclusion reason."],
        ["Active handling time", "Start when a clerk opens the case. Include lookup, drafting, approval, correction and linked rework. Record queue wait separately."],
        ["Policy accuracy", "An independent reviewer compares the sent answer with the policy in effect on the date of contact. Materially wrong or unsupported guidance fails."],
        ["Customer outcome", "Measure elapsed time from intake to the first correct answer. Segment by request type so a shift toward easy cases is visible."]], ["1.8in", "auto"]) + "</div>"
    + callout("The analyst reconciles eligible plus excluded cases to total intake, reports missing timestamps and checks a sample against the original tickets. Flag unreliable measures before they are used in a funding decision.", "Evidence to bring to Prioritize"),
    lede="A resident writes twice about the same missed collection. The desk counts two closed tickets. The resident experienced one unresolved problem.")

# ---------- Worked case 02 ----------
d.page("Worked case 02 &middot; Prioritize", "Choose the delivery approach",
    table(["Option", "Run this test", "What would justify more spend?"], [
        ["A. Improve templates", "Give clerks current policy links and three approved reply patterns. Time representative cases.", "A measurable delay remains in adapting replies or locating the correct exception."],
        ["B. Use an existing platform", "Compare its source-linked drafts with option A on the same cases. Include review, rejected drafts and rework.", "The incremental time saving covers the incremental cost, and answers meet the quality gates."],
        ["C. Build an integration", "Trace the remaining manual handoff. Estimate volume, effort, failure handling and maintenance.", "A material platform limitation persists, and removing it is worth the added build and support cost."]], ["1.5in", "auto", "auto"])
    + sec("", "Challenge the ranking", body("In the example on page 5, routine replies score 4.5. If the policy owner finds that key exceptions have no maintained source, suspend that candidate. A weighted score helps prioritize eligible work. It cannot authorize an unowned source."))
    + callout("Fund a time-limited comparison of A and B. Defer custom integration. The service owner returns with the incremental minutes saved, the repeat-contact rate and the cost per assisted case.", "A decision the sponsor can sign"),
    lede="Start with the cheapest credible way to remove the delay. A better policy lookup may remove most of the work before a model drafts a single sentence.")

# ---------- Worked case 03 ----------
d.page("Worked case 03 &middot; Plan &amp; Design", "Test the service before launch",
    table(["Test case", "Expected behaviour", "Release evidence"], [
        ["Current rule", "A routine collection enquiry cites the current approved schedule.", "The reviewer opens the citation and verifies the answer against the effective date."],
        ["Conflicting rules", "A temporary holiday notice conflicts with the standard schedule.", "The draft cites the applicable exception or routes to a person. An unsupported choice fails."],
        ["Outside scope", "A resident includes an account number and requests a billing adjustment.", "The clerk routes the case to the existing account process before any information reaches the drafting tool."],
        ["Source unavailable", "The approved policy lookup is unavailable during a live shift.", "The clerk completes the case manually. The team lead can switch the queue back and reconcile pending cases."],
        ["Policy changes", "A new schedule takes effect after an earlier test passed.", "The owner retires the old version and reruns affected cases before the revised source is released."]], ["1.4in", "auto", "auto"])
    + callout("Keep the expected answer and actual result for each test. A failed boundary or fallback test keeps the affected category on the manual path. The service owner signs the retest and records the version released.", "Release rule"),
    lede="Run these acceptance tests with a clerk, a policy owner and the person who can disable drafting. Record the policy version, actual response, reviewer and outcome.")

# ---------- Worked case 04 ----------
NEG = lambda s: f'<span class="neg">{s}</span>'
d.page("Worked case 04 &middot; Plan &amp; Design", "Stress-test the investment",
    '<p class="small" style="margin-top:0.14in">Illustrative, CAD. 2,000 eligible cases per month at $45 per staff hour.</p>'
    + table(["Case", "Adoption", "Net min. saved", "Monthly capacity value", "After $1,800 running cost", "Setup recovery*"], [
        ["Downside", "40%", "2.0", "$1,200", NEG("−$600"), "Not recovered"],
        ["Base", "50%", "3.0", "$2,250", "$450", "20 months"],
        ["Upside", "75%", "3.0", "$3,375", "$1,575", "5.7 months"]])
    + note("* $9,000 setup cost divided by the positive monthly margin. Assumes steady volume and full use of recovered capacity from month one. A slower ramp-up delays recovery.")
    + sec("", "Set the hurdle before funding", body("To recover setup within 12 months, the service must cover the $1,800 running cost plus $750 of setup recovery each month. At $2.25 per assisted case, that requires 1,134 cases per month, or about 57% adoption. At 50% adoption, first-year capacity value after all costs is −$3,600."))
    + callout("At 50% adoption the service frees 50 hours a month. If only 30 hours can be redeployed, recognized capacity value is $1,350, a $450 monthly shortfall against running cost. Finance records a cash saving only when spend actually falls.", "Check what the hours are worth"),
    lede="A positive monthly margin can still miss the funding horizon. Test the setup cost and the share of recovered time the team can actually use.")

# ---------- Worked case 05 ----------
d.page("Worked case 05 &middot; Implement", "Read the pilot results",
    table(["Measure", "Templates", "AI-assisted", "Decision signal"], [
        ["Mean active time", "12.0 min", "8.8 min", "3.2 minutes recovered per assigned case. Meets the 3-minute gate."],
        ["Policy-correct replies", "99 / 100", "98 / 100", "Meets the illustrative 98% threshold overall."],
        ["Repeat within 7 days", "5 / 100", "7 / 100", "Misses the gate of no increase."],
        ["Critical disclosures", "0", "0", "None observed in this sample."]], ["1.6in", "0.9in", "0.9in", "auto"])
    + sec("", "Find the failure hidden by the average", body("In the 20 holiday-exception cases in each group, there were 4 repeats with AI and 1 with templates. Across the other 80 cases, there were 3 repeats with AI and 4 with templates. Read all seven AI-group repeat cases before attributing the difference to the tool."))
    + sec("", "Keep the denominator consistent", body("The 3.2-minute result is per case assigned to AI, including cases where the clerk rejected the draft. Apply it to the expected number of assigned cases under the same usage conditions. Multiplying again by the draft acceptance rate would discount the saving twice."))
    + callout("Hold expansion. Route holiday exceptions to the existing process, investigate the repeat contacts and rerun the comparison after the source is fixed. The small subgroup shows where to investigate. It cannot establish the cause.", "Sponsor decision: revise and retest"),
    lede="Illustrative results from 100 eligible cases per group. Both groups receive staff review. The AI group includes assigned cases where the clerk rejected the draft.")

# ---------- Worked case 06 ----------
d.page("Worked case 06 &middot; Measure &amp; Improve", "Convert capacity into value",
    table(["Benefit record", "Worked example and evidence"], [
        ["Operational capacity", "At base adoption, 1,000 assisted cases × 3 minutes = 50 hours per month. Validate against case and time records."],
        ["Committed use", "The manager schedules 30 hours for backlog work. At 30 minutes per case, the planning estimate is 60 additional completions. Log actual completions and case mix."],
        ["Financial treatment", "Value the 30 redeployed hours at $1,350 for capacity reporting. Count cash separately, using a verified change in payroll or contractor spend. Count each hour once."],
        ["Owner and review", "The queue manager reviews use weekly. Finance reconciles costs monthly. The sponsor assesses the funding hurdle after the first full month at planned volume."]], ["1.7in", "auto"])
    + sec("", "Before transferring to another queue", body("The receiving lead demonstrates the fallback, names the policy owner, validates local volume and signs the staffing plan. Recalculate the economics using that queue's case mix, review time and incremental costs."))
    + callout("Use the executive decision record on page 12. Record the amount released, the categories still excluded, the person responsible for the next evidence and the review date. If redeployment falls short, revise the staffing plan or reduce the spend.", "Close the loop"),
    lede="The service owner needs a plan for where the recovered hours go. A monthly total on a dashboard does not clear a backlog or change an overtime bill.")

# ---------- Next steps ----------
d.page("Next steps", "Where to go next",
    sec("", "Use this playbook on your own first investment", dots([
        "**This week:** name the executive sponsor and write a one-paragraph strategy statement (page 4).",
        "**This month:** score three candidate workflows with the people who do the work (page 5), and define the baseline (page 13).",
        "**Before funding:** build the investment case and set the hurdle (pages 7 and 16), then complete the decision record (page 12)."]))
    + sec("", "Free tools from ilene.ai", table(["Resource", "Use it to"], [
        ["AI Use Case Prioritization Tool", "Score and rank candidate workflows for value, feasibility and readiness."],
        ["AI Cost & ROI Calculator", "Estimate what an AI initiative costs and returns before you commit funding."],
        ["Measuring AI Value", "Set up the baseline and benefit tracking behind every funding decision."]], ["2in", "auto"])
        + note("All are available at ilene.ai/resources."))
    + sec("", "When you want support", body(
        "**AI Audits & Assessments** gives you a readiness verdict, a ranked use case list, a preliminary ROI case and a 90-day action plan for your organization.",
        "**The AI Operations Maturity Scorecard** shows where you stand today, dimension by dimension, and what it takes to reach the next stage."))
    + cta("Turn your AI strategy into a funded plan", "Talk to ilene.ai about your first investment decision.", "Book a strategy call"),
    lede="Most AI initiatives stall between strategy and execution. Start small, measure honestly and fund what the evidence supports.")

out = d.render().replace("</style>", CSS + "</style>", 1)
# anchors for the table of contents
i = 0
def anchor(m):
    global i; i += 1
    return f'<section id="p{i}" class="page pb">'
out = re.sub(r'<section class="page pb">', anchor, out)
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "ai-strategy-playbook.html"), "w").write(out)
print("Wrote ai-strategy-playbook.html,", i, "pages")
