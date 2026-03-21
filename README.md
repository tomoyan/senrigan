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

## 📦 Implementation Guide

### 1. Start the Senrigan Dashboard
```bash
npx senrigan-ui --port 9000
