# Bitcoin Price Tomorrow

Bitcoin Price Tomorrow is a fully automated web application that publishes a daily prediction of Bitcoin's closing price for the next day.  
The system is built using a microservices architecture, combining machine learning, a backend API, a web frontend, automated workflows, and integrations with external services (Twitter/X, SMTP, CoinGecko).  
The project demonstrates an end-to-end production-ready ML system: data ingestion, preprocessing, prediction, storage, visualization, and automated publishing.

---

## Features

- Daily Bitcoin prediction using an XGBoost-based ML model.  
- Automated pipeline: data fetch → preprocessing → prediction → storage → publication.  
- Web application displaying:
  - Current price and next-day forecast  
  - Historical chart comparing predictions vs. real prices  
  - Voting system for user sentiment (up/down)  
  - Newsletter subscription and automatic email delivery  
- Automated Twitter/X posting of the daily prediction.  
- Microservices deployed via Docker Compose:
  - Webapp (Next.js + TailwindCSS)  
  - API (Express.js + MongoDB)  
  - ML service (Python + Flask + scikit-learn/XGBoost)  
  - MongoDB (local development only; production uses MongoDB Atlas)

---

## Architecture Overview

- **Frontend:** Next.js (React), delivered behind Nginx and Cloudflare CDN.  
- **Backend API:** Express.js orchestrating data storage, ML requests, newsletter delivery, authentication, and integrations.  
- **ML Microservice:** Python Flask service performing preprocessing and generating predictions using the production model.  
- **Database:** MongoDB Atlas (production); Docker container for local development.  
- **Infrastructure:** Docker, Docker Compose, Hetzner Cloud server, Nginx reverse proxy, Certbot SSL, Cloudflare DNS.  
- **CI/CD:** GitHub Actions pipeline that updates the production server on each push to the main branch.

---

## Testing

- API Testing 
- E2E Testing 
---
