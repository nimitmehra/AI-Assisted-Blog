<h1 align="center">AI-Assisted-Blog</h1>
<p align="center"><i>Personal journaling / blog-drafting app — all in the browser, built with React 19.</i></p>

---

## ✨ What’s implemented right now
| Area | Details |
|------|---------|
| **Dashboard** | • Lists all posts with search box and **status filters** (All / Published / Draft) • Sorts by last-updated date • Shows word-count, tags and privacy badge (public 🔓 or private 🔒) :contentReference[oaicite:0]{index=0} |
| **Rich-text Editor** | • Inline toolbar for **bold / italic / underline / lists / quotes / alignment** • Insert **links** and **images** (PNG/JPG) • Resize images (25 % → 100 %) • Live **word + character** counter :contentReference[oaicite:1]{index=1} |
| **Save logic** | • “Save draft” keeps the post private and tagged *draft* • “Publish” flips status to *published* and (optionally) public • Autosets timestamps and word-counts on every save :contentReference[oaicite:2]{index=2} |
| **Global state** | Managed inside `AppOrchestrator` with React hooks — no backend yet; data resets on refresh. :contentReference[oaicite:3]{index=3} |
| **Utilities** | Shared helpers for stripping HTML, word-counting, date formatting, simple ID generation and in-memory search. :contentReference[oaicite:4]{index=4} |

> **Note:** The “AI” part is still a placeholder—the groundwork (editor, dashboard, utils) is here and ready for model integration.

---

## 🏗 Tech stack
* **React 19** (Create React App scaffold) :contentReference[oaicite:5]{index=5}  
* **lucide-react** icons  
* **Jest + @testing-library** (testing setup scaffolded)  
* No database / server yet — everything runs client-side.

---

## 🚀 Getting started

```bash
# 1. Clone
git clone https://github.com/nimitmehra/AI-Assisted-Blog.git
cd AI-Assisted-Blog

# 2. Install deps
npm install            # or yarn

# 3. Run in dev mode
npm start              # opens http://localhost:3000
