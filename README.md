# 👁️ Senrigan (千里眼)
**The Universal Code Movement Visualizer.**

Senrigan is a language-agnostic tool designed to visualize the execution flow of web applications in real-time. Unlike traditional profilers that focus on heavy performance metrics, Senrigan focuses on **pathway discovery**—showing you exactly which files and functions are firing as you interact with your app.

---

## 🚀 How It Works
Senrigan operates on a **Client-Server-Agent** architecture:

1.  **The Agent (SDK):** A lightweight library you drop into your existing code (Node.js, Python, Go, etc.). It sends a "Pulse" (a tiny UDP or WebSocket packet) whenever a specific block of code is executed.
2.  **The Collector (Server):** A centralized Node.js server that listens for Pulses from any number of Agents.
3.  **The Visualizer (Dashboard):** A React-based web interface that maps your project's file structure and animates the "Movement" of code execution as glowing pulses between nodes.

---

## 🛠️ Core Features
* **Real-time Visualization:** Watch the "lightning" travel from your Frontend to your Backend and into your Database.
* **Language Agnostic:** Use the same dashboard for your React frontend, Express API, and Python microservices.
* **Zero-Config Mapping:** The dashboard automatically builds a "Map" of your project based on the file paths reported by the Agents.
* **Minimal Overhead:** Designed to send fire-and-forget signals so it doesn't slow down your application logic.

---

## 📦 Getting Started (Local Development)

### 1. Run Senrigan Locally

Senrigan is set up as a monorepo. To run the Visualizer Dashboard and Collector Server locally:

```bash
# Install dependencies for all workspaces
npm install

# Start the CLI and Dashboard in development mode
npm run dev
```

The Dashboard and the Collector WebSocket Server will bind together, serving over port `9000`.
- **Dashboard UI**: `http://localhost:9000`
- **Collector WebSocket**: `ws://localhost:9000`

### 2. Use the App (Node.js SDK Integration)

To visualize your app's code pathway, install the Senrigan Node.js SDK and connect it to your app. For example, in an Express server:

```bash
npm install @senrigan/sdk-node
```

Initialize it, then trigger pulses whenever a specific block of your code executes:

```javascript
const express = require('express');
const senrigan = require('@senrigan/sdk-node');

// 1. Initialize connection to the local Collector
senrigan.init({ url: 'ws://localhost:9000' });

const app = express();

// 2. Send a pulse when specific code executes
app.use((req, res, next) => {
  senrigan.pulse({
    file: 'src/index.js',
    functionName: 'middleware:logger',
    metadata: { method: req.method, path: req.path } // Optional context
  });
  next();
});

app.listen(3000, () => console.log('App connected to Senrigan!'));
```

Check out `examples/demo-app/` for a fully working example demonstrating how to instrument an Express application!
