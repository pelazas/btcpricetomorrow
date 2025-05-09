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
        
        # Critical headers for session cookies
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Required for cross-domain cookies
        proxy_cookie_domain ~^(.*)$ $host; # Preserve cookie domain
        proxy_pass_header Set-Cookie;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://btcpricetomorrow.com' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Expose-Headers' 'Set-Cookie' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        
        # Security headers
        proxy_hide_header X-Powered-By;
        add_header X-Frame-Options SAMEORIGIN;
        add_header X-Content-Type-Options nosniff;
        
        # Cache control for API endpoints
        proxy_no_cache 1;
        proxy_cache_bypass 1;
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
