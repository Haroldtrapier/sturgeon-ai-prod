# 🚀 Production Launch Checklist

**Status:** Pre-Launch  
**Target:** First 3 Agency Pilots  
**Rule:** No new features until pilots complete

---

## 🔒 SCOPE FREEZE (LOCKED FOR LAUNCH)

### ✅ Included in Launch:
- Multi-agent research, proposal, compliance
- SAM.gov ingestion + alerts + email digests
- Proposal generator + compliance matrix
- DOCX export + submission ZIP
- Human review workflow
- Teams, roles, audit logs
- FedRAMP-aligned security pack

### ❌ Excluded (Post-Launch):
- PDF export polish
- Advanced ML scoring
- Mobile UI optimization
- Full JAB P-ATO certification

**Rule: No new features until first 3 pilots complete.**

---

## ✅ PRODUCTION LAUNCH CHECKLIST

### 1️⃣ Code & Infrastructure

- [ ] `npm run build` passes (frontend)
- [ ] `/health` returns 200
- [ ] `/agents` endpoint returns agent list
- [ ] `/chat` processes messages
- [ ] `/opportunities/ingest` ingests SAM.gov data
- [ ] Cron job runs (alerts) and sends test email
- [ ] RLS verified (cross-team access blocked)
- [ ] Audit logs populated on key actions (login, export, edit)
- [ ] Secrets only in env vars (no `.env` committed to repo)
- [ ] Railway backend auto-deploys from main
- [ ] Vercel frontend auto-deploys from main

### 2️⃣ Security

- [ ] MFA enforced (Supabase Auth)
- [ ] Signed URLs for sensitive exports (not public)
- [ ] Data retention defaults set (7 years)
- [ ] Legal hold toggle tested (blocks deletion)
- [ ] Cross-team RLS policy blocks unauthorized access
- [ ] TLS enforced everywhere (Vercel/Railway/Supabase)
- [ ] No secrets in repo (verified with `git log --all --full-history --source -- '*env*'`)
- [ ] Audit logs immutable

### 3️⃣ User Experience

- [ ] Nav consistent on all pages
- [ ] Agent Console shows active agent + routing reason
- [ ] Dashboard shows real metrics (not placeholder)
- [ ] Export blocked until readiness score = 100%
- [ ] Checklist toggles work in proposal UI
- [ ] Submission ZIP generates with all artifacts
- [ ] Error messages are user-friendly (not stack traces)
- [ ] Loading states on all async actions

### 4️⃣ Documentation

- [ ] SSP finalized with real system details
- [ ] Control Matrix maps to actual implementation
- [ ] All 6 policies reviewed (Access, IR, Config, Change, Data, Risk)
- [ ] ConMon metrics defined and measurable
- [ ] Architecture diagrams accurate (logical + dataflow)
- [ ] Risk register populated with real risks
- [ ] IR Playbook includes contact info + SLAs

### 5️⃣ Go/No-Go Criteria

- [ ] **Internal dry run completed:**
  - Create fake opportunity
  - Generate proposal
  - Export compliance matrix
  - Generate submission ZIP
  - Verify all files in ZIP
- [ ] **Pilot onboarding checklist ready:**
  - Account creation flow tested
  - Onboarding email drafted
  - Demo script prepared
  - Support escalation path defined
- [ ] **Legal/Terms reviewed:**
  - Terms of Service finalized
  - Privacy Policy updated
  - Data Processing Agreement ready (for agencies)

---

## 🚦 GO/NO-GO DECISION

**All checkboxes must be checked before pilot outreach begins.**

| Criteria | Status |
|----------|--------|
| All code checkboxes | ⏳ |
| All security checkboxes | ⏳ |
| All UX checkboxes | ⏳ |
| All docs checkboxes | ⏳ |
| Dry run successful | ⏳ |

**Decision:** ⏳ NOT READY / 🔴 GO

---

## 📅 LAUNCH TIMELINE

**Week 1:**
- [ ] Complete checklist
- [ ] Internal dry run
- [ ] Fix critical issues

**Week 2:**
- [ ] Select 3 pilot agencies
- [ ] Prepare pilot deck (10 slides)
- [ ] Draft outreach emails

**Week 3:**
- [ ] Begin pilot outreach
- [ ] Schedule demo calls
- [ ] Onboard first pilot

**Week 4-16:**
- [ ] Run 90-day pilots
- [ ] Weekly feedback loops
- [ ] Collect metrics
- [ ] Iterate based on feedback

---

## 👥 LAUNCH TEAM ROLES

| Role | Responsible For |
|------|----------------|
| **Product Lead** | Checklist completion, go/no-go decision |
| **Engineering** | Code/infra checklist, bug fixes |
| **Security** | Security checklist, docs review |
| **Sales/BD** | Pilot targeting, outreach, demos |
| **Support** | Onboarding, pilot support, feedback collection |

---

## 📊 SUCCESS METRICS (PILOT PHASE)

**Quantitative:**
- 3 pilots onboarded within 30 days
- 80%+ pilot retention through 90 days
- 50%+ reduction in proposal prep time (self-reported)
- 90%+ compliance requirement capture accuracy
- <5 critical bugs during pilot

**Qualitative:**
- Positive feedback from pilot users
- ATO sponsorship interest from at least 1 agency
- Reference-able customer quotes
- Product-market fit validation

---

## ❗ BLOCKERS & RISKS

| Risk | Mitigation |
|------|------------|
| Slow pilot signup | Expand outreach list to 10 agencies |
| Security concerns delay adoption | Provide security pack upfront, schedule CISO calls |
| Feature gaps discovered | Prioritize based on pilot feedback, fast iteration |
| Competition enters market | Emphasize FedRAMP-alignment, audit trail, compliance focus |

---

## 📞 CONTACT

**Launch Lead:** [Your Name]  
**Email:** [your-email]  
**Slack:** #sturgeon-launch  

---

**REMEMBER: Launch is not the goal. Validated pilots are the goal.**