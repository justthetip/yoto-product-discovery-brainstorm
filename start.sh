#!/bin/bash

# Yoto Content Browser - Quick Start Script

echo "🎵 Yoto Content Browser"
echo "======================="
echo ""

# Check if data exists
if [ ! -f "data/yoto-content.json" ]; then
    echo "📥 Fetching latest content from Yoto API..."
    python3 src/fetch-content.py
    echo ""
fi

# Check data age
if [ -f "data/yoto-content.json" ]; then
    echo "✅ Data loaded ($(wc -l < data/yoto-content.json) lines)"
    echo ""
fi

echo "🌐 Starting web server..."
echo ""
echo "   Open in your browser:"
echo "   → http://localhost:8000/web/"
echo ""
echo "   Press Ctrl+C to stop"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start server
python3 web/server.py
