server {
    server_name btcpricetomorrow.com www.btcpricetomorrow.com;
    listen 443 ssl;
    
    ssl_certificate /etc/letsencrypt/live/btcpricetomorrow.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/btcpricetomorrow.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ml/ {
        proxy_pass http://localhost:8001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    if ($host = www.btcpricetomorrow.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = btcpricetomorrow.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name btcpricetomorrow.com www.btcpricetomorrow.com;
    return 404; # managed by Certbot

}
