server {
    server_name btcpricetomorrow.com www.btcpricetomorrow.com;
    location / {
        proxy_pass http://localhost:3000;  # Your app's port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/btcpricetomorrow.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/btcpricetomorrow.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot


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