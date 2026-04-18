#!/usr/bin/env python3
import http.server, os, sys, socket

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        pass

class ReusableServer(http.server.HTTPServer):
    allow_reuse_address = True

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    try:
        server = ReusableServer(('', port), NoCacheHandler)
    except OSError as e:
        if e.errno == 98:
            print(f'Puerto {port} ocupado. Prueba:  python3 server.py {port + 1}')
            print(f'O libera el puerto:  lsof -ti:{port} | xargs -r kill -9')
            sys.exit(1)
        raise
    print(f'Servidor en http://localhost:{port}  (sin caché)')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nServidor detenido.')
        server.server_close()
