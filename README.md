# MathVoice — AI Math Tutor with Socratic Engine

**This AI doesn't give you answers. It teaches you how to think.**

MathVoice is a voice-first AI math tutor that uses the **Socratic method** to guide you through math concepts — from Pre-Algebra to Differential Equations. No memorization. No answer-dumping. Just real learning.

It works as a **3-agent system**:
1. **Brain** — A Socratic reasoning engine powered by Claude that asks guiding questions instead of giving answers
2. **Whiteboard** — Live rendering of equations (KaTeX), interactive graphs (Mafs), and step-by-step solutions
3. **Voice** — Natural speech input/output using the Web Speech API so you can talk to your tutor like a real person

> **Video walkthrough**: [This AI Taught Me Calculus in 5 Minutes](https://youtube.com/@sirajraval)
>
> **Try it instantly (no setup)**: [MuleRun Template](https://mulerun.com/chat?template=265)

---

## Table of Contents

- [How It Works](#how-it-works)
- [Quick Start (5 minutes)](#quick-start)
- [Prerequisites](#prerequisites)
- [Step-by-Step Setup](#step-by-step-setup)
- [Using MathVoice](#using-mathvoice)
- [Architecture Deep Dive](#architecture-deep-dive)
- [The Socratic Engine](#the-socratic-engine)
- [The Whiteboard System](#the-whiteboard-system)
- [The Voice System](#the-voice-system)
- [Knowledge Tracking](#knowledge-tracking)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## How It Works

```
You speak: "How do derivatives work?"
         |
         v
  ┌─────────────────────────────────────────────┐
  │           SOCRATIC ENGINE (Claude)           │
  │                                              │
  │  Doesn't answer directly. Instead asks:      │
  │  "What happens to a curve's slope as you     │
  │   zoom in closer and closer to a point?"     │
  │                                              │
  │  Generates:                                  │
  │  - Spoken response (no LaTeX, natural speech)│
  │  - Whiteboard commands (equations + graphs)  │
  │  - Error analysis (if you make mistakes)     │
  │  - Mastery updates (tracks your progress)    │
  └──────────┬──────────────┬───────────────────┘
             │              │
             v              v
     ┌──────────┐   ┌──────────────┐
     │  VOICE   │   │  WHITEBOARD  │
     │          │   │              │
     │ Speaks   │   │ Shows:       │
     │ response │   │ - Equations  │
     │ aloud    │   │ - Graphs     │
     │          │   │ - Step-by-   │
     │          │   │   step work  │
     └──────────┘   └──────────────┘
```

---

## Quick Start

If you just want to get it running as fast as possible:

```bash
git clone https://github.com/llSourcell/mathvoice.git
cd mathvoice
npm install
echo "ANTHROPIC_API_KEY=your-key-here" > .env.local
npm run dev
```

Open **http://localhost:3000** in Chrome or Edge. That's it.

---

## Prerequisites

Before you begin, make sure you have:

| Requirement | How to get it |
|---|---|
| **Node.js 18+** | Download from [nodejs.org](https://nodejs.org). Run `node --version` to check. |
| **npm** | Comes with Node.js. Run `npm --version` to check. |
| **Anthropic API Key** | Sign up at [console.anthropic.com](https://console.anthropic.com), go to **API Keys**, and create one. It starts with `sk-ant-`. |
| **Chrome or Edge** | Required for voice features. Safari has limited support (no speech recognition). |

> **New to programming?** Node.js is a tool that runs JavaScript on your computer (not just in browsers). npm is its package manager — think of it like an app store for code libraries. An API key is like a password that lets your app talk to Claude.

---

## Step-by-Step Setup

### 1. Clone the repository

```bash
git clone https://github.com/llSourcell/mathvoice.git
cd mathvoice
```

This downloads the code to your computer and enters the project folder.

### 2. Install dependencies

```bash
npm install
```

This downloads all the libraries MathVoice needs (React, Next.js, KaTeX, etc.). It may take a minute or two.

### 3. Set up your API key

Create a file called `.env.local` in the project root:

```bash
echo "ANTHROPIC_API_KEY=your-key-here" > .env.local
```

Replace `your-key-here` with your actual Anthropic API key (the one starting with `sk-ant-`).

> **Important**: The `.env.local` file is already in `.gitignore`, so your key will NEVER be uploaded to GitHub. Keep it secret.

### 4. Start the development server

```bash
npm run dev
```

### 5. Open the app

Go to **http://localhost:3000** in **Chrome** or **Edge**.

You should see the MathVoice welcome screen. Click "Get Started" and pick a topic!

---

## Using MathVoice

### Keyboard Shortcuts

| Key | Action |
|---|---|
| **Space** | Start/stop listening (or interrupt the tutor while it's speaking) |
| **Escape** | Stop listening or speaking |
| **D** | Open the knowledge dashboard |

### Session Modes

MathVoice has 4 tutoring modes — pick one from the tabs at the top:

| Mode | What it does |
|---|---|
| **Teach Me** | The tutor explains concepts step by step, checking your understanding as it goes |
| **Practice** | You get problems to solve. The tutor gives hints if you're stuck, then walks through the solution |
| **Diagnose** | The tutor asks probing questions to find gaps in your understanding |
| **Quick Drill** | Rapid-fire problems for speed and pattern recognition |

### Topics Covered (34 total)

- **Pre-Algebra** — Fractions, Integers, Ratios, Exponents, Order of Operations
- **Algebra** — Expressions, Linear Equations, Inequalities, Systems, Quadratics, Polynomials
- **Precalculus** — Functions, Trigonometry, Exponentials/Logs, Sequences, Complex Numbers
- **Calculus** — Limits, Derivatives, Differentiation Rules, Applications, Integrals
- **Linear Algebra** — Vectors, Matrices, Determinants, Eigenvalues
- **Differential Equations** — Intro to ODEs, First/Second-Order, Laplace Transforms

Topics have **prerequisites** — you'll unlock advanced topics as you build mastery in foundational ones.

### No Mic? No Problem

If your browser doesn't support speech recognition (or you prefer typing), a text input appears automatically as a fallback.

---

## Architecture Deep Dive

### The Socratic Engine

The core of MathVoice lives in two files:

**`src/lib/prompts/system-prompt.ts`** — The system prompt that makes Claude a Socratic tutor. Key rules:
- **Never give direct answers.** Always ask a guiding question first.
- **Adapt to difficulty level** — beginner (simple language, small steps), intermediate (proper terminology), advanced (proofs, edge cases).
- **Analyze errors** — When students make mistakes, Claude identifies the type (sign error, conceptual misunderstanding, incomplete solution, etc.) and addresses the root cause.
- **Everything spoken aloud** — Responses use natural English, never raw LaTeX symbols.

**`src/app/api/tutor/route.ts`** — The API endpoint. Sends the conversation + student context to Claude, which responds with:
```typescript
{
  message: string,           // What the tutor says (spoken aloud)
  whiteboard: [...],         // Equations, graphs, steps to display
  errorAnalysis?: {...},     // If the student made a mistake
  topicUpdate?: {...},       // Mastery score change (+/-)
  expectsResponse: boolean   // Should the mic auto-listen again?
}
```

Claude is forced to use a **tool call** (`respond_to_student`) to ensure structured output every time.

### The Whiteboard System

The whiteboard (`src/components/whiteboard/`) renders 5 types of commands:

| Command | What it shows | Library |
|---|---|---|
| `equation` | LaTeX math notation with optional labels | KaTeX |
| `graph` | 2D function plots, points, and animations | Mafs + mathjs |
| `step` | Step-by-step solutions with animated reveal | Custom + KaTeX |
| `annotation` | Color-coded text notes | Custom |
| `clear` | Clears the board for new content | — |

**Graph animations** include tangent lines (derivatives), approaching points (limits), and area accumulation (Riemann sums for integrals).

**Whiteboard sync** (`src/hooks/use-whiteboard-sync.ts`) times commands to appear during speech — so the equation shows up right when the tutor mentions it.

### The Voice System

Two custom hooks handle voice:

- **`src/hooks/use-speech-recognition.ts`** — Listens via the Web Speech API, streams interim results in real-time
- **`src/hooks/use-speech-synthesis.ts`** — Speaks responses with configurable rate (0.5x–2x speed), prefers natural-sounding voices (Samantha on Mac, Google US English on Chrome)

The voice state machine cycles through: `idle` → `listening` → `processing` → `speaking` → back to `idle` (or auto-listen if the tutor expects a response).

### Knowledge Tracking

MathVoice tracks your progress locally (in your browser's localStorage):

- **Mastery scores** (0–100%) per topic, updated after each interaction
- **Error history** — what types of mistakes you make and how often
- **Adaptive difficulty** — automatically adjusts based on your mastery level
- **Weakness detection** — identifies your top 5 weak areas and tells the tutor to focus on them
- **Streak tracking** — counts consecutive days of practice

Open the **Dashboard** (press **D**) to see your knowledge map and progress stats.

---

## Project Structure

```
src/
├── app/
│   ├── api/tutor/route.ts          # Claude API endpoint
│   ├── layout.tsx                   # App metadata & fonts
│   ├── page.tsx                     # Main page (assembles everything)
│   └── globals.css                  # Global styles
│
├── components/
│   ├── whiteboard/                  # Equation, graph, step rendering
│   ├── conversation/               # Chat messages + live transcript
│   ├── dashboard/                  # Knowledge map + progress stats
│   ├── voice/                      # Mic button, volume, indicators
│   ├── session/                    # Topic selector + welcome screen
│   ├── layout/                     # Main layout + header with mode tabs
│   └── ui/                         # Reusable UI primitives (Radix-based)
│
├── hooks/
│   ├── use-tutor-api.ts            # Sends messages to /api/tutor
│   ├── use-speech-recognition.ts   # Browser speech-to-text
│   ├── use-speech-synthesis.ts     # Browser text-to-speech
│   └── use-whiteboard-sync.ts      # Times whiteboard with speech
│
└── lib/
    ├── prompts/system-prompt.ts    # The Socratic system prompt
    ├── stores/tutor-store.ts       # Zustand state management
    ├── knowledge/                  # Student model + adaptive difficulty
    │   ├── student-model.ts        # Profile management + persistence
    │   ├── adaptive-difficulty.ts  # Difficulty scaling algorithm
    │   └── topic-graph.ts          # 34-topic curriculum with prerequisites
    ├── types/tutor.ts              # TypeScript interfaces
    └── constants.ts                # Config values + thresholds
```

---

## Tech Stack

| Library | What it does | Why we use it |
|---|---|---|
| [Next.js 14](https://nextjs.org) | Full-stack React framework | Server-side API routes + fast client rendering |
| [React 18](https://react.dev) | UI library | Component-based UI |
| [TypeScript](https://www.typescriptlang.org) | Typed JavaScript | Catches bugs before they happen |
| [Anthropic SDK](https://docs.anthropic.com) | Claude API client | Powers the Socratic engine |
| [Zustand](https://zustand.docs.pmnd.rs) | State management | Tiny (~1KB), simple, no boilerplate |
| [KaTeX](https://katex.org) | LaTeX math rendering | Fast, beautiful equation display |
| [Mafs](https://mafs.dev) | Interactive math visualizations | 2D graphs with animations |
| [mathjs](https://mathjs.org) | Math expression parser | Evaluates functions for graphing |
| [Radix UI](https://www.radix-ui.com) | Accessible UI components | Dialogs, sliders, tabs, tooltips |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first CSS | Rapid styling without writing CSS files |
| [Framer Motion](https://www.framer.com/motion) | Animations | Smooth transitions and reveals |
| [Lucide](https://lucide.dev) | Icons | Clean, consistent iconography |

---

## Troubleshooting

### "ANTHROPIC_API_KEY is not set"
Make sure your `.env.local` file exists in the project root (same folder as `package.json`) and contains:
```
ANTHROPIC_API_KEY=sk-ant-your-actual-key
```
Then restart the dev server (`Ctrl+C`, then `npm run dev`).

### Voice isn't working
- **Use Chrome or Edge.** Firefox and Safari don't fully support the Web Speech API.
- **Allow microphone access** when the browser prompts you.
- If you denied mic access previously: click the lock icon in the address bar → Site Settings → Microphone → Allow.

### Equations look broken
If KaTeX equations aren't rendering, try a hard refresh (`Ctrl+Shift+R` or `Cmd+Shift+R`).

### "Module not found" errors
Run `npm install` again — you may be missing dependencies.

### The app says "designed for desktop"
MathVoice is optimized for desktop browsers. Open it on a computer for the best experience.

---

## Built With

Built with [MuleRun](https://mulerun.com) — an AI agent platform where you can run multiple agents in parallel. No coding or prompt engineering required.

---

## License

MIT — use it, learn from it, build on it.

---

**Made by [Siraj Raval](https://x.com/sirajraval)**
