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

### Prerequisites
- **Node.js**: Version 18.0 or higher is recommended (required for modern Vite builds used in the dashboard).
- **Package Manager**: npm (to manage the monorepo workspaces and handle standard installations).

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

## 🔌 Using Senrigan With Any Other Project

Senrigan operates as a completely independent, standalone server. You do **not** need to copy or place the Senrigan repository inside your actual project folder! 

Here is the simple 3-step process to visualize **any** project:

### 1. Start Senrigan (The Server)
Keep the `senrigan` folder anywhere on your computer. Open it and run the dev script. This spins up the Dashboard UI and the background data listener.
```bash
# Inside the standalone senrigan folder
npm run dev
```

### 2. Install the SDK
Head over to your own project's folder. If you are using Node.js, install the official SDK:
```bash
# Inside your actual project folder
npm install @senrigan/sdk-node
```
*(If you are using Python, Go, or another language, Senrigan is fully language-agnostic! Because the server uses standard WebSockets, you can simply write a tiny WebSocket client in your language of choice to connect to `ws://localhost:9000` and beam JSON `pulse` payloads!)*

### 3. Connect and Pulse
You need to do two things in your project: Connect when your app boots up, and "Pulse" when your code executes.

**A. Connect:** The cleanest way to connect is using Node's Preload Module flag (`--require`). This injects Senrigan without ever modifying your app's main file!

1. **Copy the `senrigan.js` file** out of the `examples/demo-app/` folder and place it directly into your own project's root directory (or just create a file manually with the following code). Don't forget to add it to your `.gitignore`!
```javascript
const senrigan = require('@senrigan/sdk-node');
// Connect to the standalone Senrigan server running in the background
senrigan.init({ url: 'ws://localhost:9000' });
```
2. Start your app with the `-r` flag to preload the connection:
```bash
node -r ./senrigan.js src/index.js # (or whatever your entry file is)
```
*(Alternatively, you can just paste the `senrigan.init()` code directly at the very top of your `index.js` file if you prefer).*

**B. Pulse:** Sprinkle the `pulse` command deep inside your functions, endpoints, or critical logic blocks. Whenever that code runs, it fires a signal over to your Terminal log!
```javascript
app.get('/users/profile', (req, res) => {
  
  // Send the signal! (The exact file path and line number are automatically captured!)
  senrigan.pulse({
    functionName: 'fetchUserProfile',
    metadata: { userId: req.query.id } // Automatically serialized in the Dashboard
  });

  const user = db.getUser(req.query.id);
  res.json(user);
});
```

Check out `examples/demo-app/` for a fully working example demonstrating how to easily instrument an application!
