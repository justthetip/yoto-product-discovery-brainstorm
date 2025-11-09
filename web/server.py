#!/usr/bin/env python3
"""
Simple HTTP server for the Yoto web interface
"""
import http.server
import socketserver
import os
import sys

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def log_message(self, format, *args):
        # Simplified logging
        print(f"[{self.log_date_time_string()}] {format % args}")

def start_server():
    # Change to the project root directory
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(project_root)

    print(f"Starting server at http://localhost:{PORT}")
    print(f"Serving from: {os.getcwd()}")
    print(f"\nOpen in your browser:")
    print(f"  http://localhost:{PORT}/web/")
    print(f"\nPress Ctrl+C to stop the server\n")

    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nShutting down server...")
            sys.exit(0)

if __name__ == '__main__':
    start_server()
