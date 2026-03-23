# 👁️ Senrigan (千里眼)
**The Universal Code Movement Visualizer.**

Senrigan is a language-agnostic tool designed to visualize the execution flow of web applications in real-time. Unlike traditional profilers that focus on heavy performance metrics, Senrigan focuses on **pathway discovery**—showing you exactly which files and functions are firing as you interact with your app.

---

## 🚀 How It Works
Senrigan operates on a **Client-Server-Agent** architecture:

1.  **The Agent (SDK):** A lightweight library you drop into your existing code. It sends a "Pulse" (a tiny WebSocket packet) whenever a specific block of code is executed. It automatically captures your caller file and line numbers natively!
2.  **The Collector (Server):** A centralized Node.js server that listens for Pulses from any number of Agents.
3.  **The Visualizer (Dashboard):** A React-based split-screen web interface. On the left, it seamlessly embeds your working web application. On the right, it prints a sleek **Live Execution Log** detailing exact file line hits and JSON payload arguments in real-time as you click around your app.

---

## 🛠️ Core Features
* **Split-Screen Workflow:** Interact with your fully-functional web app while simultaneously monitoring the backend code firing side-by-side.
* **Terminal Execution Log:** A fast, easily readable terminal interface that logs function sequences rather than cluttered node graphs.
* **Automatic Stack Tracing:** The SDK natively hooks into the V8 Engine stack to grab exact `[file:line]` pathways without you needing to hardcode them!
* **Rich Metadata:** Pass deeply nested JSON objects from your app state straight into the Pulse and watch them render brightly on the dashboard terminal.
* **Language Agnostic:** Built to accept signals from any language over WebSocket.

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

// 2. Send a pulse when specific code executes!
// Note: 'file' and 'line' are completely optional! Senrigan extracts them natively.
app.use((req, res, next) => {
  senrigan.pulse({
    functionName: 'middleware:logger',
    metadata: { method: req.method, path: req.path } // Automatically serialized in the terminal!
  });
  next();
});

app.listen(3000, () => console.log('App connected to Senrigan!'));
```

Check out `examples/demo-app/` for a fully working example demonstrating how to instrument an Express application!
