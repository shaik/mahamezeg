#!/bin/sh
PORT=8080
echo "Starting mahamezeg at http://localhost:$PORT"
echo "Demo mode: http://localhost:$PORT/?demo=1"
open "http://localhost:$PORT" 2>/dev/null || true
python3 -m http.server $PORT
