# 🚀 Deployment Guide

Guide for deploying the Kafka Messaging Application to production.

## 🏢 Production Deployment Options

### Option 1: Deploy to Heroku (Easiest)

#### Step 1: Install Heroku CLI
```bash
# Download: https://devcenter.heroku.com/articles/heroku-cli
heroku --version
```

#### Step 2: Create Heroku Account & App
```bash
# Login to Heroku
heroku login

# Create a new app
heroku create your-app-name

# Or set remote if app already exists
heroku git:remote -a your-app-name
```

#### Step 3: Set Up Kafka (Heroku Addon)
```bash
# Add Kafka addon
heroku addons:create heroku-kafka:basic-0

# Check connection strings
heroku config | grep KAFKA
```

#### Step 4: Deploy Code
```bash
# Deploy from Git
git push heroku main

# View logs
heroku logs --tail

# View app
heroku open
```

---

### Option 2: Deploy to AWS EC2

#### Step 1: Launch EC2 Instance
```bash
# 1. Go to AWS Console
# 2. Launch Ubuntu 20.04 LTS instance (t3.micro for free tier)
# 3. Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000
# 4. Create/select key pair
```

#### Step 2: Connect & Setup
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker
sudo apt install -y docker.io docker-compose

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu
```

#### Step 3: Clone & Deploy
```bash
# Clone repository
git clone your-repo-url
cd docker/kafka-node

# Install dependencies
npm install

# Set environment variables
cat > .env << EOF
PORT=3000
NODE_ENV=production
KAFKA_BROKERS=your-kafka-broker:9092
EOF

# Start with PM2 (process manager)
sudo npm install -g pm2
pm2 start server.js --name "kafka-app"
pm2 startup
pm2 save

# View logs
pm2 logs kafka-app
```

#### Step 4: Setup Reverse Proxy (Nginx)
```bash
# Install Nginx
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/default
```

Add this configuration:
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

```bash
# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
```

---

### Option 3: Deploy to Docker Hub + Kubernetes

#### Step 1: Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

#### Step 2: Build & Push Image
```bash
# Build image
docker build -t your-username/kafka-app:1.0 .

# Login to Docker Hub
docker login

# Push image
docker push your-username/kafka-app:1.0
```

#### Step 3: Deploy to Kubernetes
```bash
# Create deployment
kubectl create deployment kafka-app \
  --image=your-username/kafka-app:1.0 \
  --replicas=3 \
  -n default

# Expose service
kubectl expose deployment kafka-app \
  --port=80 \
  --target-port=3000 \
  --type=LoadBalancer
```

---

## 🔒 Security Configuration

### 1. Environment Variables (.env)
```bash
# Create .env file (never commit to Git)
PORT=3000
NODE_ENV=production
KAFKA_BROKERS=kafka.example.com:9092
CORS_ORIGIN=https://yourdomain.com
JWT_SECRET=your-secret-key
LOG_LEVEL=warn
```

### 2. HTTPS/SSL Setup

#### Using Let's Encrypt (Free)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

#### Update Nginx for HTTPS
```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Redirect HTTP to HTTPS
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 3. Rate Limiting (Nginx)
```nginx
# Add to nginx config
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=send:10m rate=5r/s;

server {
    location /api/send {
        limit_req zone=send burst=10 nodelay;
        proxy_pass http://localhost:3000;
    }
    
    location /api/ {
        limit_req zone=general burst=20 nodelay;
        proxy_pass http://localhost:3000;
    }
}
```

### 4. Firewall Rules
```bash
# UFW (Ubuntu Firewall)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 📊 Monitoring & Logging

### 1. Application Monitoring

#### Using PM2 Plus
```bash
# Install PM2 Plus
pm2 install pm2-auto-pull
pm2 plus

# View real-time logs
pm2 monit
```

#### Using New Relic
```bash
# Install agent
npm install newrelic

# Add to server.js (first line)
require('newrelic');

# Set license key
export NEW_RELIC_LICENSE_KEY=your-key
```

### 2. Kafka Monitoring

#### Kafka Metrics Export
```bash
# Enable JMX exporter in docker-compose.yml
environment:
  - KAFKA_JMX_OPTS=-Dcom.sun.management.jmxremote...
  - KAFKA_JMX_PORT=9999
```

#### Prometheus + Grafana
```bash
# Add to docker-compose.yml
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

### 3. Centralized Logging

#### Using ELK Stack (Elasticsearch, Logstash, Kibana)
```bash
# Add to docker-compose.yml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:7.14.0
  environment:
    - discovery.type=single-node

logstash:
  image: docker.elastic.co/logstash/logstash:7.14.0
  volumes:
    - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

kibana:
  image: docker.elastic.co/kibana/kibana:7.14.0
  ports:
    - "5601:5601"
```

---

## 🎯 Performance Optimization

### 1. Enable Compression
```javascript
// server.js
const compression = require('compression');
app.use(compression());
```

### 2. Kafka Configuration
```javascript
const kafka = new Kafka({
  brokers: ['kafka1:9092', 'kafka2:9092', 'kafka3:9092'], // Multiple brokers
  connectionTimeout: 1000,
  requestTimeout: 30000,
  retry: {
    initialRetryTime: 100,
    retries: 8,
    multiplier: 2,
    randomizationFactor: 0.2,
    maxRetryTime: 30000,
  },
});

const producer = kafka.producer({
  allowAutoTopicCreation: false,
  transactionTimeout: 30000,
  compressionCodec: CompressionCodecs.GZIP,
  timeout: 30000,
  maxInFlightRequests: 5,
});
```

### 3. Database Connection Pool
```javascript
// If using database for persistence
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 4. Caching Strategy
```javascript
// Add Redis for message caching
const redis = require('redis');
const client = redis.createClient({ host: 'localhost', port: 6379 });

// Cache messages
app.get('/api/messages', async (req, res) => {
  const cached = await client.get('messages');
  if (cached) return res.json(JSON.parse(cached));
  
  const messages = await getMessages();
  await client.setex('messages', 60, JSON.stringify(messages)); // 60 second TTL
  res.json(messages);
});
```

---

## 📋 Pre-Deployment Checklist

- [ ] Environment variables configured (.env file)
- [ ] SSL/HTTPS certificate installed
- [ ] CORS properly configured for your domain
- [ ] Database backups configured
- [ ] Logs aggregation set up
- [ ] Monitoring and alerting enabled
- [ ] Kafka replication factor ≥ 2
- [ ] Rate limiting configured
- [ ] Security headers added
- [ ] Error tracking set up (Sentry)
- [ ] Performance monitoring active
- [ ] Disaster recovery plan documented
- [ ] Load balancing configured
- [ ] Auto-scaling policies set

---

## 🚨 Troubleshooting Production

### High CPU Usage
```bash
# Check what's consuming CPU
top
ps aux | grep node

# Profile with clinic
npm install -g clinic
clinic doctor -- node server.js
```

### Memory Leaks
```bash
# Use heap snapshots
node --inspect server.js

# Connect Chrome DevTools: chrome://inspect
```

### Kafka Connection Issues
```bash
# Test Kafka connectivity
telnet kafka-broker 9092

# Check Kafka logs
docker logs kafka

# Verify broker configuration
docker-compose exec kafka kafka-broker-api-versions.sh --bootstrap-server localhost:9092
```

### WebSocket Failures
```bash
# Check proxy configuration
# Ensure `Upgrade` header is forwarded in Nginx:
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "Upgrade";
```

---

## 📊 Scaling Strategy

### Horizontal Scaling
1. Run multiple Node.js instances behind load balancer
2. Use Kafka consumer groups for parallel processing
3. Configure Kafka with multiple brokers
4. Use Redis for shared session management

### Vertical Scaling
1. Increase server resources (CPU, RAM)
2. Optimize Kafka configuration
3. Enable message compression
4. Use connection pooling

### Database Scaling
1. Read replicas for message retrieval
2. Write replication for message storage
3. Partitioning for large datasets
4. Caching layer (Redis/Memcached)

---

## 📞 Support & Resources

- [Kafka Production Checklist](https://kafka.apache.org/documentation/#deployment)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express Production](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [AWS Best Practices](https://docs.aws.amazon.com/whitepapers/latest/aws-well-architected-framework/)

---

**Last Updated:** January 2024
