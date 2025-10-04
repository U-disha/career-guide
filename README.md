# Pathfinder – Career Guide

A local-first, privacy-friendly web app to help students and early-career professionals discover roles, analyze skill gaps, build a learning plan, and navigate job searches.

## Features
- **Discover**: Short quiz maps your interests/strengths to recommended roles.
- **Plan**: Skill gap analysis versus target roles; auto-generated learning plan with curated resources and mini-projects.
- **Navigate**: Basic resume/ATS analysis, tips, and a milestones tracker.
- **Local-first**: Uses `localStorage` to save progress on your device. No server required for MVP.

## Project Structure
- `index.html` – App layout: Discover, Plan, Navigate panels and footer.
- `style.css` – Modern UI styling with CSS variables and responsive layout.
- `app.js` – All client-side logic: quiz, recommendations, gap analysis, plan generation, resume analysis, and milestones.

## Getting Started
1. Clone or download this folder: `career-guide/`.
2. Open `index.html` directly OR start a simple local server for best results.

### Option A: Python (recommended)
- Python 3 installed:
  - Windows (PowerShell):
    ```powershell
    python -m http.server 5173
    ```
  - If `python` doesn’t work:
    ```powershell
    py -m http.server 5173
    ```
- Open: http://localhost:5173

### Option B: Node (if you have Node.js)
```bash
npx serve -l 5173 .
```
Open: http://localhost:5173

### Option C: VS Code Live Server
- Install the "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

## How to Use
- **Discover**: Fill the quiz and click "Get Recommendations" → role cards appear with skills and resources.
- **Plan**: Pick a target role, enter your current skills (comma-separated), click "Analyze Gaps" → strengths, gaps, and a generated plan.
- **Navigate**: Paste resume text or upload a `.txt` file and click "Analyze Resume" → keyword coverage and ATS tips.
- **Milestones**: Add, remove, and persist milestones for your job search.

## Security & Privacy
- External links that open in new tabs include `rel="noopener noreferrer"` to prevent reverse tabnabbing.
- All data is stored locally in your browser via `localStorage` (`pf_state`). No cloud sync by default.

## Troubleshooting
- If styles look broken, ensure `style.css` is loaded via the `<link>` tag in `index.html`.
- Header blur effect: Safari/iOS requires `-webkit-backdrop-filter`; this is included.
- Port conflicts: If `5173` is in use, change the port (e.g., `python -m http.server 5500`) and update the URL.

## Roadmap Ideas
- Embedding-based role matching for more accurate recommendations.
- Richer resume parsing and scoring.
- Portfolio builder and artifact hosting integration.
- Optional cloud sync with explicit consent.

## License
This project is intended for educational/demo use. Review external resource links for their respective licenses.