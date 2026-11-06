# serveur de test : si /tmp/xslow existe, chaque page .html met 3 s à répondre
import http.server, os, time, sys
class H(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if os.path.exists('/tmp/xslow') and self.path.split('?')[0].endswith('.html'): time.sleep(3)
        return super().do_GET()
    def log_message(self, *a): pass
os.chdir(sys.argv[1]); http.server.ThreadingHTTPServer(('127.0.0.1', int(sys.argv[2])), H).serve_forever()
