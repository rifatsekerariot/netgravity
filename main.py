import webview
import threading
import uvicorn
import os
import sys
from backend.app import app

def start_backend():
    # Run FastAPI on a separate thread
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="error")

if __name__ == "__main__":
    # Start backend thread
    t = threading.Thread(target=start_backend, daemon=True)
    t.start()

    # Determine if we are running from an EXE (PyInstaller)
    if getattr(sys, 'frozen', False):
        # Path to the frontend build index.html
        base_path = sys._MEIPASS
        url = os.path.join(base_path, "dist", "index.html")
    else:
        # Development mode: point to the local build
        url = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend", "dist", "index.html")

    # Create the window
    window = webview.create_window(
        'NetGravity - Network Management Console',
        url,
        width=1280,
        height=800,
        background_color='#000000'
    )
    
    webview.start()
