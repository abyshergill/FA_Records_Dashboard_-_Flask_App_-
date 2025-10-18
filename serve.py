from waitress import serve
from app import app  


HOST = '0.0.0.0'
PORT = 8086

print(f"Serving Flask app '{app.name}' with Waitress on http://{HOST}:{PORT}")

serve(app, host=HOST, port=PORT)