/*
 * ilene.ai — AI Acceptable Use Policy (sample template). Single source for the Word and PDF versions.
 * Inline markup: **bold**. Anything in [square brackets] is treated as a placeholder and highlighted.
 * Copy rules: no contractions, no promises.
 */
module.exports = {
  title: "AI Acceptable Use Policy",
  kicker: "Sample policy template",
  subtitle: "A starting point for setting clear rules on how your people use AI tools at work.",
  date: "October 2026",
  footer: "Sample template only. Not legal advice. Your organization is responsible for its review, adaptation and use.",

  notice: {
    title: "Important: read before using this template",
    items: [
      "**This is a sample only.** It is provided for general information and illustration. It is not legal, privacy, employment, regulatory or other professional advice, and it does not create an advisory, client or other relationship with ilene.ai.",
      "**It was not written for your organization.** It may not reflect the laws, regulations, collective agreements, contracts, industry standards or public sector directives that apply to you. These vary by jurisdiction and sector, and they change over time.",
      "**You are responsible for its use.** Your organization is solely responsible for reviewing, adapting, approving, implementing and enforcing any policy based on this template, and for confirming that it complies with all applicable laws and obligations. Have it reviewed by qualified legal counsel and your privacy and security advisors before adoption.",
      "**No warranty or liability.** ilene.ai makes no representation or warranty that this template is complete, accurate, current or suitable for any purpose. To the fullest extent permitted by law, ilene.ai accepts no liability for any loss, damage or claim arising from its use or from reliance on it.",
      "**Current as of October 2026.** AI tools, vendor terms and regulation are changing quickly. Check the policy against current requirements at each review."
    ]
  },

  howTo: [
    "Replace every item in [square brackets] with your own details, and delete any that do not apply.",
    "Shaded guidance notes explain choices you need to make. Delete them before the policy is approved.",
    "Align the data rules in Section 6 with your existing information classification scheme.",
    "Replace the ilene.ai branding with your own, and remove this page, before you publish the final policy."
  ],

  control: [
    ["Policy owner", "[Role, for example Chief Operating Officer]"],
    ["Approved by", "[Name, title or governing body]"],
    ["Effective date", "[Date]"],
    ["Next review date", "[Date, no later than 12 months after the effective date]"],
    ["Version", "[1.0]"],
    ["Related policies", "[Information security, privacy, records management, code of conduct, acceptable use of technology]"]
  ],

  sections: [
    {
      title: "Purpose",
      blocks: [
        { p: "This policy sets out how people working for or on behalf of [Organization] may use artificial intelligence (AI) tools, including generative AI, in their work. Its aim is to support productive, responsible use of AI while protecting [Organization]'s information, people, clients and reputation." }
      ]
    },
    {
      title: "Scope",
      blocks: [
        { p: "This policy applies to all employees, contractors, temporary staff, volunteers and [other groups] who use AI tools for [Organization] work, on any device, including personal devices and personal accounts when they are used for work." },
        { p: "It covers:" },
        { ul: [
          "standalone generative AI tools, such as chat assistants and image, audio, video or code generators",
          "AI features built into software [Organization] already uses, such as email, office, meeting, customer relationship management or finance systems",
          "AI tools that [Organization] builds, configures or customizes"
        ] },
        { p: "This policy works alongside [Organization]'s related policies listed above. Where requirements differ, the stricter requirement applies." }
      ]
    },
    {
      title: "Definitions",
      blocks: [
        { table: { cols: ["Term", "Meaning"], widths: [28, 72], rows: [
          ["AI tool", "Software that uses machine learning or similar techniques to generate content, make predictions, classify information or recommend actions."],
          ["Generative AI", "AI tools that create new text, images, audio, video or code in response to a prompt."],
          ["Approved AI tool", "An AI tool, and the configuration of it, that [Organization] has assessed and listed as approved under Section 5."],
          ["Output", "Anything an AI tool produces, including text, summaries, images, code, analysis and recommendations."],
          ["Personal information", "Information about an identifiable individual, as defined in applicable privacy law."],
          ["Confidential information", "Non-public information about [Organization], its clients, partners or people, as defined in [information classification policy]."]
        ] } }
      ]
    },
    {
      title: "Guiding principles",
      blocks: [
        { ul: [
          "**People stay accountable.** The person who uses an AI tool is responsible for the work it helps produce.",
          "**Protect information.** Only put information into an AI tool when this policy allows it.",
          "**Verify before relying.** AI output can be wrong, incomplete, outdated or biased. Check it before you use it.",
          "**Be transparent.** Be open about AI use where people would reasonably expect to know.",
          "**Treat people fairly.** Do not use AI in ways that could unfairly disadvantage individuals or groups.",
          "**Use approved tools.** Work information belongs in tools [Organization] has assessed."
        ] }
      ]
    },
    {
      title: "Approved AI tools",
      blocks: [
        { p: "[Organization] maintains a list of approved AI tools at [location, for example the intranet page]. The list states what each tool may be used for and the highest classification of information it may receive." },
        { table: { cols: ["Approved tool", "Approved uses", "Highest information permitted", "Tool owner"], widths: [24, 32, 24, 20], rows: [
          ["[Tool name and plan]", "[For example, drafting, summarizing, analysis]", "[For example, Internal]", "[Role]"],
          ["[Tool name and plan]", "[Approved uses]", "[Classification]", "[Role]"]
        ] } },
        { p: "To request a new tool or a new use, submit a request to [team or role] describing the business purpose, the information involved and the vendor. Requests are assessed for security, privacy, legal, cost and operational fit before approval." },
        { note: "Before approving a tool, review the vendor's terms on data retention, use of your data to train models, where data is stored and processed, and security certifications. Business or enterprise plans often have different terms from free or personal plans. Confirm the terms that apply to the plan you are buying." }
      ]
    },
    {
      title: "Information you may use with AI tools",
      blocks: [
        { p: "Use the table below to decide what information may be entered into, uploaded to or connected with an AI tool." },
        { table: { cols: ["Information classification", "Approved AI tools", "Unapproved or public AI tools"], widths: [30, 40, 30], rows: [
          ["**Public**: approved for public release", "Permitted", "Permitted"],
          ["**Internal**: general business information not intended for the public", "Permitted", "Not permitted"],
          ["**Confidential**: sensitive business, client or partner information", "Permitted only in tools approved for confidential information", "Not permitted"],
          ["**Personal information**: about clients, employees or others", "Permitted only in tools approved for personal information, for a purpose covered by a completed privacy review", "Not permitted"],
          ["**Restricted**: [for example, legal privilege, security credentials, health or financial account information]", "Not permitted unless approved in writing by [role]", "Not permitted"]
        ] } },
        { p: "If you are unsure how information is classified, treat it as Confidential and ask [contact]." },
        { note: "Replace these categories with your own classification scheme. Privacy legislation may set specific rules for personal information, including consent, purpose, retention and where information may be stored or accessed. Public bodies may have additional obligations under privacy, information access and records legislation. Confirm the rules that apply to you with counsel." }
      ]
    },
    {
      title: "Acceptable uses",
      blocks: [
        { p: "Subject to Sections 5 and 6, AI tools may be used to:" },
        { ul: [
          "draft, edit and improve the clarity of documents, emails and presentations",
          "summarize documents and meetings the user is entitled to access",
          "generate ideas, outlines and options for discussion",
          "find a starting point for research, with sources checked independently",
          "write, review and explain code, with review before it is deployed",
          "analyze data the user is permitted to use in that tool",
          "translate content for internal understanding, with review before any external use",
          "[other uses specific to your organization]"
        ] }
      ]
    },
    {
      title: "Prohibited uses",
      blocks: [
        { p: "AI tools must not be used to:" },
        { ul: [
          "enter, upload or connect information above the classification permitted in Section 6",
          "make, or materially influence, decisions about individuals, such as hiring, discipline, pay, eligibility, credit or access to services, unless the use has been specifically approved, assessed and includes meaningful human review",
          "create content that is discriminatory, harassing, defamatory, deceptive or unlawful",
          "impersonate a real person, or create synthetic images, audio or video of a real person without their consent and approval from [role]",
          "present output as verified fact, professional advice or original work without the review required in Section 9",
          "bypass security controls, tool safeguards or this policy",
          "monitor or evaluate employees, except as authorized under [policy]",
          "enter content that [Organization] does not have the right to use in that way, such as material under confidentiality or licence restrictions",
          "[other prohibited uses specific to your organization]"
        ] }
      ]
    },
    {
      title: "Human review and accountability",
      blocks: [
        { p: "The person using an AI tool is responsible for the accuracy and appropriateness of anything produced with it. Before relying on or sharing output, review it for:" },
        { ul: [
          "factual errors, invented facts, references or citations",
          "outdated information",
          "bias, unfair assumptions or inappropriate language",
          "confidential or personal information that should not be included",
          "consistency with [Organization]'s policies, standards and tone"
        ] },
        { p: "Higher-impact uses, including content for clients, regulators, the public or legal and financial matters, require review by [role or a qualified person] before release. An AI tool cannot be recorded as the author, reviewer or approver of any [Organization] decision or document." }
      ]
    },
    {
      title: "Transparency and disclosure",
      blocks: [
        { ul: [
          "Disclose AI use in external content when [Organization] requires it or when a reasonable reader would expect to know.",
          "When an AI system interacts directly with clients or the public on [Organization]'s behalf, make clear that they are dealing with an AI system and offer a route to a person.",
          "Label AI-generated or materially AI-altered images, audio and video when they are shared outside [Organization]."
        ] },
        { note: "Decide your disclosure threshold, for example any externally published content where AI generated a substantial part. Some jurisdictions, sectors and publishers set their own disclosure requirements." }
      ]
    },
    {
      title: "Intellectual property and third-party rights",
      blocks: [
        { ul: [
          "AI output may resemble existing protected works and may not be protected by copyright in the way human-created work is. Check significant external content before publication.",
          "Respect the licence and usage terms of each AI tool.",
          "Ownership of work created with AI tools for [Organization] is governed by [employment agreements, contractor agreements or intellectual property policy]."
        ] }
      ]
    },
    {
      title: "Security",
      blocks: [
        { ul: [
          "Use [Organization] accounts and single sign-on for approved tools where available. Do not share credentials.",
          "Apply the privacy and data settings required for each approved tool, such as turning off chat history or model training where [Organization] requires it.",
          "Do not connect AI tools to [Organization] systems, files or mailboxes unless the connection is approved.",
          "Be alert to AI-enabled phishing, voice cloning and deepfakes. Verify unusual requests for payments, credentials or information through a known, separate channel."
        ] }
      ]
    },
    {
      title: "Reporting incidents and concerns",
      blocks: [
        { p: "Report the following to [contact or channel] as soon as possible:" },
        { ul: [
          "information entered into an AI tool that this policy does not permit",
          "output that has caused, or could cause, harm, a complaint or a material error",
          "an AI tool behaving unexpectedly or outside its approved use",
          "suspected fraud, impersonation or security incidents involving AI"
        ] },
        { p: "Report in good faith. [Organization] does not tolerate retaliation against anyone who raises a concern under this policy." }
      ]
    },
    {
      title: "Roles and responsibilities",
      blocks: [
        { table: { cols: ["Role", "Responsibilities"], widths: [28, 72], rows: [
          ["Policy owner: [role]", "Maintains this policy, approves exceptions and reports on AI use to [leadership or board]."],
          ["[Information technology and security]", "Assesses tools, manages the approved tool list and configures security settings."],
          ["[Privacy officer]", "Completes privacy reviews and advises on personal information."],
          ["[Legal]", "Reviews vendor terms, intellectual property and regulatory obligations."],
          ["People leaders", "Make sure their teams know this policy, complete training and use AI within approved uses."],
          ["Everyone in scope", "Follows this policy, completes training, reviews output and reports incidents."]
        ] } }
      ]
    },
    {
      title: "Training",
      blocks: [
        { p: "Everyone in scope must complete [Organization]'s AI awareness training before using approved AI tools for work, and [annually] after that. Additional training may be required for specific tools or higher-impact uses." }
      ]
    },
    {
      title: "Exceptions",
      blocks: [
        { p: "Requests for an exception must be made in writing to the policy owner, with the business reason, the information involved and the controls proposed. Approved exceptions are documented, time-limited and reviewed before they are renewed." }
      ]
    },
    {
      title: "Compliance",
      blocks: [
        { p: "Breaches of this policy are handled under [disciplinary policy, contractor agreements or applicable collective agreements]. [Organization] may suspend access to AI tools while a concern is reviewed." },
        { note: "Make sure the consequences described here are consistent with your existing employment policies, contracts and any collective agreements." }
      ]
    },
    {
      title: "Review",
      blocks: [
        { p: "This policy is reviewed at least every [12 months], and sooner if there is a significant change in applicable law, the AI tools in use or the way [Organization] uses AI." }
      ]
    }
  ],

  checklist: {
    title: "Appendix A: Rollout checklist",
    items: [
      "A policy owner is named and accountable.",
      "Current AI use across teams is mapped, including tools staff already use.",
      "Data rules are aligned with your information classification scheme.",
      "Legal, privacy and security reviews of the adapted policy are complete.",
      "The approved tool list is published, with uses and data limits for each tool.",
      "Related policies are cross-referenced and any conflicts are resolved.",
      "The policy is communicated, with practical examples for each team.",
      "Training is available and completion is tracked.",
      "Acknowledgments are collected, if you use Appendix B.",
      "The incident reporting route is tested.",
      "The first review date is set."
    ]
  },

  acknowledgment: {
    title: "Appendix B: Acknowledgment (optional)",
    text: "I confirm that I have read and understood the [Organization] AI Acceptable Use Policy, version [x.x], and that I will follow it. I understand that I am responsible for work I produce with AI tools, and that I should ask [contact] if I am unsure how the policy applies.",
    fields: ["Name", "Role or team", "Signature", "Date"]
  }
};
