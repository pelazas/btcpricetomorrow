# /etc/nginx/sites-available/btcpricetomorrow.pelazas.com
# btcpricetomorrow.pelazas.com — Cloudflare-proxied (zone SSL mode: Full).
# The origin reuses the existing pelazas.com-0001 Let's Encrypt cert. Cloudflare
# "Full" (non-strict) does not validate the origin cert hostname, so the SAN
# mismatch (cert has no btcpricetomorrow.pelazas.com SAN) is fine.
# Backends (bound to 127.0.0.1): webapp :3001, api :8000, ml :8001.

server {
    listen 80;
    server_name btcpricetomorrow.pelazas.com;

    # Allow future Let's Encrypt http-01 (e.g. if you later move to Full-strict).
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name btcpricetomorrow.pelazas.com;

    ssl_certificate     /etc/letsencrypt/live/pelazas.com-0001/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pelazas.com-0001/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    proxy_http_version 1.1;

    # Express API — routes are mounted at /api/*, so preserve the /api prefix.
    location /api {
        proxy_pass http://127.0.0.1:8000;

        proxy_cookie_path ~*^/.* /;
        proxy_pass_header Set-Cookie;

        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_hide_header X-Powered-By;
    }

    # Flask ML service — strip the /ml/ prefix.
    location /ml/ {
        proxy_pass http://127.0.0.1:8001/;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Next.js webapp.
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
