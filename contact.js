/* ilene.ai contact form: field validation and submission.
   Submission goes to HubSpot when FORM_CONFIG is filled in; until then it opens the visitor's email app. */
(function () {
  "use strict";

  // Fill these in after creating a form in HubSpot (Marketing > Forms). Leave blank to use email instead.
  // Field names below (firstname, lastname, email, company, message) must match the fields on your HubSpot form.
  // Endpoint per HubSpot's Forms API v3: POST https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formGuid}
  var FORM_CONFIG = { provider: "hubspot", portalId: "343791525", formGuid: "4881b6ce-de58-4ec3-8df0-2c36296c5bcf" };
  var INBOX = "hello@ilene.ai";

  var form = document.getElementById("contactForm");
  if (!form || !window.IleneEmail) return;
  var fields = {
    name: document.getElementById("name"),
    email: document.getElementById("email"),
    company: document.getElementById("company"),
    interest: document.getElementById("interest"),
    message: document.getElementById("message")
  };
  var statusBox = document.getElementById("formStatus");
  var submitBtn = form.querySelector("button[type=submit]");
  var personalOk = false, typedOk = false;

  // Use ?interest= from links such as the Scorecard page.
  try {
    var want = new URLSearchParams(window.location.search).get("interest");
    if (want && fields.interest) {
      Array.prototype.forEach.call(fields.interest.options, function (o) { if (o.value === want) fields.interest.value = want; });
    }
    // Without a topic list, a Scorecard link starts the message for the visitor.
    if (want === "scorecard" && !fields.interest && fields.message && !fields.message.value) {
      fields.message.value = "I would like to request the AI Operations Maturity Scorecard.";
    }
  } catch (e) { /* no query string available */ }

  function wrapOf(input) { return input.closest(".fld"); }
  function msgOf(input) { return wrapOf(input).querySelector(".fld-msg"); }
  function setState(input, state, html) {
    var w = wrapOf(input), m = msgOf(input);
    w.classList.toggle("invalid", state === "invalid");
    w.classList.toggle("valid", state === "valid");
    input.setAttribute("aria-invalid", state === "invalid" ? "true" : "false");
    // Only re-render when the message changes, so a click on a button inside it is not lost on blur.
    if (m.getAttribute("data-html") !== (html || "")) { m.innerHTML = html || ""; m.setAttribute("data-html", html || ""); }
  }

  function validateEmail(showSuccess) {
    var r = window.IleneEmail.check(fields.email.value);
    if (!r.ok) { setState(fields.email, "invalid", r.error); return false; }
    if (r.suggestion && !typedOk) {
      setState(fields.email, "invalid", 'Did you mean <button type="button" data-fix="' + r.suggestion.replace(/"/g, "") + '">' + escapeHtml(r.suggestion) + '</button>? <button type="button" data-typed="1">Keep it as typed</button>');
      return false;
    }
    if (r.personal && !personalOk) {
      setState(fields.email, "", 'This looks like a personal address. A work email helps us reply faster. <button type="button" data-keep="1">Use this one anyway</button>');
      return "personal";
    }
    setState(fields.email, showSuccess ? "valid" : "", "");
    return true;
  }
  function validateRequired(input, message) {
    if (!input.value.trim()) { setState(input, "invalid", message); return false; }
    setState(input, "", ""); return true;
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  fields.email.addEventListener("blur", function () { if (fields.email.value.trim()) validateEmail(true); });
  fields.email.addEventListener("input", function () { personalOk = false; typedOk = false; if (wrapOf(fields.email).classList.contains("invalid")) validateEmail(false); });
  fields.name.addEventListener("blur", function () { if (wrapOf(fields.name).classList.contains("invalid")) validateRequired(fields.name, "Enter your name."); });
  fields.message.addEventListener("blur", function () { if (wrapOf(fields.message).classList.contains("invalid")) validateRequired(fields.message, "Tell us briefly what you want to improve."); });
  msgOf(fields.email).addEventListener("click", function (e) {
    var fix = e.target.getAttribute && e.target.getAttribute("data-fix");
    if (fix) { fields.email.value = fix; validateEmail(true); fields.email.focus(); }
    if (e.target.getAttribute && e.target.getAttribute("data-keep")) { personalOk = true; validateEmail(true); }
    if (e.target.getAttribute && e.target.getAttribute("data-typed")) { typedOk = true; validateEmail(true); }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.querySelector(".hp input").value) return; // spam trap
    var okName = validateRequired(fields.name, "Enter your name.");
    var okEmail = validateEmail(true);
    var okMsg = validateRequired(fields.message, "Tell us briefly what you want to improve.");
    if (!okName || okEmail !== true || !okMsg) {
      var first = form.querySelector(".fld.invalid input, .fld.invalid textarea") || (okEmail === "personal" ? fields.email : null);
      if (first) first.focus();
      return;
    }
    var data = {
      name: fields.name.value.trim(), email: fields.email.value.trim(), company: fields.company.value.trim(),
      interest: fields.interest ? fields.interest.value : "", message: fields.message.value.trim()
    };
    if (FORM_CONFIG.portalId && FORM_CONFIG.formGuid) sendToHubSpot(data);
    else sendByEmail(data);
  });

  function sendToHubSpot(d) {
    submitBtn.disabled = true;
    var parts = d.name.split(/\s+/);
    var body = {
      fields: [
        { objectTypeId: "0-1", name: "firstname", value: parts[0] || d.name },
        { objectTypeId: "0-1", name: "lastname", value: parts.slice(1).join(" ") },
        { objectTypeId: "0-1", name: "email", value: d.email },
        { objectTypeId: "0-1", name: "company", value: d.company },
        { objectTypeId: "0-1", name: "message", value: (d.interest ? "Interested in: " + d.interest + "\n\n" : "") + d.message }
      ],
      context: { pageUri: window.location.href, pageName: document.title }
    };
    fetch("https://api.hsforms.com/submissions/v3/integration/submit/" + encodeURIComponent(FORM_CONFIG.portalId) + "/" + encodeURIComponent(FORM_CONFIG.formGuid), {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    }).then(function (res) {
      if (!res.ok) throw new Error("status " + res.status);
      showStatus("ok", "Inquiry sent", "Thanks. We will reply to " + escapeHtml(d.email) + ".");
      form.reset();
    }).catch(function () {
      showStatus("error", "Your inquiry did not go through", "Please try again, or email us directly at " + INBOX + ".");
    }).then(function () { submitBtn.disabled = false; });
  }

  function sendByEmail(d) {
    var subject = "ilene.ai inquiry" + (d.company ? " | " + d.company : "");
    var body = "Name: " + d.name + "\nWork email: " + d.email + "\nCompany: " + (d.company || "Not provided") + (d.interest ? "\nInterested in: " + d.interest : "") + "\n\nWhat we are trying to improve:\n" + d.message;
    showStatus("ok", "Your email app should open with this inquiry filled in", "Press send there to reach us. If nothing opened, email <strong>" + INBOX + "</strong> directly.");
    window.location.href = "mailto:" + INBOX + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  function showStatus(kind, title, text) {
    statusBox.hidden = false;
    statusBox.className = "form-status" + (kind === "error" ? " error" : "");
    statusBox.innerHTML = "<b>" + title + "</b><span>" + text + "</span>";
  }
})();
