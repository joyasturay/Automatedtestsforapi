# ⚡ AutoTest.ai - AI-Powered API Testing Agent

![Project Screenshot](screenshot.png?v=2)


### Stop writing boilerplate. Start validating logic.

**AutoTest.ai** is an intelligent developer tool that autonomously generates, executes, and scaffolds test suites for backend APIs. By leveraging Large Language Models (LLMs) via **Google Gemini**, it transforms raw code snippets into rigorous, executable test cases in seconds.

🔗 **Live Demo:** [https://auto-test-ai.vercel.app](https://auto-test-ai.vercel.app)

---

## 🚀 Key Features

* **🤖 Autonomous Test Generation:** Analyzes TypeScript/Node.js API routes to identify edge cases, validation logic, and success paths automatically.
* **⚡ Live Execution Engine:** Instantly runs generated tests against your live API endpoints (localhost or production) to verify behavior in real-time.
* **🛡️ "Lazy AI" Prevention:** Custom prompt engineering pipeline forces strict JSON object comparison (`.toEqual`) over loose string matching, ensuring 100% accuracy for structured API responses.
* **💾 Export to Jest:** Generates a production-ready, CommonJS-compatible Jest test file that developers can save and add to their CI/CD pipeline.
* **🎨 Developer-Centric UI:** Built with a modern, high-contrast dark mode interface for reduced eye strain during late-night debugging.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **AI Model:** Google Gemini 1.5 Pro / 2.5 Flash
* **Styling:** Tailwind CSS + Framer Motion
* **Testing Engine:** Jest (Generated Code) + Axios (Live Runner)
* **Deployment:** Vercel

---

## 🧩 How It Works

1.  **Input:** The developer pastes their `route.ts` code and targets an endpoint (e.g., `/api/login`).
2.  **Analysis:** The backend acts as an orchestration layer, sending the code to Gemini with a **hardened system prompt**.
3.  **Strategy Generation:** The AI returns a structured JSON plan containing valid inputs, edge cases (e.g., empty passwords), and expected HTTP status codes.
4.  **Execution:** The React frontend iterates through this plan, firing real HTTP requests to the target API.
5.  **Validation:** Actual responses are compared against AI predictions. Discrepancies are flagged immediately.

---

## 🧠 Engineering Challenges Solved

**The "String vs. Object" Hallucination**
* **Problem:** Early versions of the AI would compare a JSON response `{ success: true }` against the string `"success"`, causing false negatives.
* **Solution:** Implemented a "Prompt Hardening" strategy that explicitly forbids string comparisons for object responses and forces the generation of `expect(res.data).toEqual(...)` syntax in the Jest output.

**Secure Execution**
* **Problem:** Running arbitrary AI-generated code is unsafe.
* **Solution:** The "Live Validation" runs in the browser's sandbox using standard HTTP requests, while the "Save File" feature produces static code that must be manually reviewed and run by the developer, ensuring a "Human-in-the-loop" security model.

---

## 📦 Getting Started

Cloning the repo to run locally:

```bash
# 1. Clone the repository
git clone [https://github.com/yourusername/auto-test-ai.git](https://github.com/yourusername/auto-test-ai.git)

# 2. Install dependencies
npm install

# 3. Set up Environment Variables
# Create a .env.local file and add your Google Gemini API Key
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# 4. Run the development server
npm run dev