/* Email validation for the ilene.ai contact form. Works in the browser (window.IleneEmail) and in Node (module.exports). */
(function (root) {
  "use strict";

  // Common consumer providers. A personal address is allowed, but the visitor is asked to confirm it.
  var PERSONAL = ["gmail.com", "googlemail.com", "yahoo.com", "yahoo.ca", "ymail.com", "hotmail.com", "hotmail.ca", "outlook.com", "live.com", "live.ca", "msn.com", "icloud.com", "me.com", "mac.com", "aol.com", "proton.me", "protonmail.com", "gmx.com", "mail.com", "shaw.ca", "telus.net", "rogers.com", "sympatico.ca", "bell.net"];

  // Domains people often mistype, mapped to what they almost certainly meant.
  var TYPOS = {
    "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gmal.com": "gmail.com", "gamil.com": "gmail.com", "gnail.com": "gmail.com", "gmail.co": "gmail.com", "gmail.con": "gmail.com", "gmail.cm": "gmail.com",
    "hotmial.com": "hotmail.com", "hotmal.com": "hotmail.com", "hotmail.co": "hotmail.com", "hotmail.con": "hotmail.com",
    "outlok.com": "outlook.com", "outlook.co": "outlook.com", "outlook.con": "outlook.com",
    "yaho.com": "yahoo.com", "yahooo.com": "yahoo.com", "yahoo.co": "yahoo.com", "yahoo.con": "yahoo.com",
    "icloud.co": "icloud.com", "iclod.com": "icloud.com"
  };
  // Top-level domain slips on any domain.
  var TLD_FIX = { "con": "com", "cmo": "com", "comm": "com", "c0m": "com", "nte": "net", "ent": "net", "ogr": "org", "orgg": "org" };

  var LOCAL = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
  var LABEL = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;

  function check(raw) {
    var value = String(raw == null ? "" : raw).trim();
    var result = { ok: false, value: value, error: "", suggestion: "", personal: false };
    if (!value) { result.error = "Enter your work email so we can reply."; return result; }
    if (/\s/.test(value)) { result.error = "Email addresses cannot contain spaces."; return result; }
    var at = value.lastIndexOf("@");
    if (at < 1 || value.indexOf("@") !== at) { result.error = "Include a single @, like name@company.com."; return result; }
    var local = value.slice(0, at), domain = value.slice(at + 1).toLowerCase();
    if (local.length > 64 || value.length > 254) { result.error = "That email address is too long."; return result; }
    if (!LOCAL.test(local)) { result.error = "The part before the @ has a character email addresses do not allow."; return result; }
    if (!domain) { result.error = "Add the domain after the @, like company.com."; return result; }
    var labels = domain.split(".");
    if (labels.length < 2) { result.error = "The domain needs an ending, like .com or .ca."; return result; }
    for (var i = 0; i < labels.length; i++) {
      if (!LABEL.test(labels[i])) { result.error = "The domain after the @ does not look right."; return result; }
    }
    var tld = labels[labels.length - 1];
    if (!/^[a-z]{2,24}$/.test(tld)) { result.error = "The domain ending (like .com) does not look right."; return result; }

    var suggested = "";
    if (TYPOS[domain]) suggested = TYPOS[domain];
    else if (TLD_FIX[tld]) suggested = labels.slice(0, -1).join(".") + "." + TLD_FIX[tld];
    if (suggested) result.suggestion = local + "@" + suggested;

    result.personal = PERSONAL.indexOf(domain) !== -1;
    result.ok = true;
    return result;
  }

  var api = { check: check, PERSONAL: PERSONAL };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.IleneEmail = api;
})(this);
