#!/bin/bash
# ClosetOS Local & Mobile Runner Script

WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_BIN="$WORKSPACE_DIR/.venv/bin/python"
UVICORN_BIN="$WORKSPACE_DIR/.venv/bin/uvicorn"
NODE_DIR="$WORKSPACE_DIR/tools/node/bin"
export PATH="$NODE_DIR:$PATH"
export PYTHONPATH="$WORKSPACE_DIR/backend"

# Determine Local Network IP for Mobile Access
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}')
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="127.0.0.1"
fi

echo "=========================================================="
echo "          CLOSETOS - AI WARDROBE & STYLING AGENT          "
echo "=========================================================="

# Check if Backend is running
if curl -s http://127.0.0.1:8000/health | grep -q "healthy"; then
    echo "✔ Backend server is already running on port 8000"
else
    echo "➜ Starting FastAPI Backend on http://127.0.0.1:8000..."
    nohup "$UVICORN_BIN" app.main:app --host 127.0.0.1 --port 8000 > /tmp/closetos_backend.log 2>&1 &
    sleep 2
fi

# Check if Frontend is running
if curl -s http://127.0.0.1:3000 | grep -q "ClosetOS"; then
    echo "✔ Frontend dev server is already running on port 3000"
else
    echo "➜ Starting Frontend server on 0.0.0.0:3000..."
    cd "$WORKSPACE_DIR/frontend"
    nohup ./node_modules/.bin/vite --host 0.0.0.0 --port 3000 > /tmp/closetos_frontend.log 2>&1 &
    sleep 2
fi

echo ""
echo "🚀 CLOSETOS IS READY TO USE!"
echo "----------------------------------------------------------"
echo "💻 ON YOUR PC / MAC (Open in Chrome, Safari, or Brave):"
echo "   ▶ http://localhost:3000"
echo "   ▶ http://127.0.0.1:3000"
echo ""
echo "📱 ON YOUR MOBILE (iPhone / Android on same Wi-Fi network):"
echo "   ▶ http://${LOCAL_IP}:3000"
echo ""
echo "   💡 Mobile Tip: In Safari / Chrome on your phone, tap"
echo "      'Share' -> 'Add to Home Screen' to install ClosetOS"
echo "      as a full-screen native PWA app with camera support!"
echo "----------------------------------------------------------"
