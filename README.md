# 👟 ShoeSync — Parallel Sneaker Intelligence Platform

[![Hugging Face Space](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Spaces-blue)](https://huggingface.co/spaces/msumar2011/Parallel_Shoe_Sync)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A premium, high-performance sneaker price aggregator built with a **Luxury Cyberpunk** aesthetic. ShoeSync leverages a parallel distributed scraping engine to query multiple retailers simultaneously, providing real-time pricing intelligence with a cinematic user experience.

![Hero Preview](https://github.com/user-attachments/assets/your-screenshot-here)

## ✨ Key Features
- **Parallel Scraping Engine:** Utilizes Python's `ThreadPoolExecutor` to query Bata, Ndure, and Servis in parallel threads.
- **Cinematic UI:** Luxury matte-black aesthetic with neon magenta and electric violet accents.
- **3D Motion Design:** Parallax sneaker assets integrated directly into the scene with physics-based floating animations.
- **Real-Time Execution Map:** A visual SVG HUD that tracks worker node activity and data flow during scraping.
- **Performance Optimized:** GPU-accelerated animations and layout-containment for a silky-smooth 60fps experience.

## 🛠️ Tech Stack
- **Backend:** Python, Flask, Concurrent Futures (Multi-threading)
- **Frontend:** Vanilla JS (ES6+), HTML5 Semantic HUD, Custom CSS3 Design System
- **Deployment:** Docker, Hugging Face Spaces

## 🚀 Quick Start (Local)

### Prerequisites
- Python 3.8+
- pip

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/msumar7426/shoesync.git
   cd shoesync
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the application:
   ```bash
   python app.py
   ```
4. Open **http://127.0.0.1:5001** in your browser.

## 🐳 Docker Deployment
```bash
docker build -t shoesync .
docker run -p 7860:7860 shoesync
```

---
Developed by [msumar7426](https://github.com/msumar7426)
