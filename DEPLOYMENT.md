# Deployment Guide

## Firebase Deployment

### 1. Initialize Firebase
```bash
npm install -g firebase-tools
firebase login
firebase init
```

### 2. Deploy Backend (Cloud Functions)
```bash
# Create index.js in backend
cd backend
firebase deploy --only functions
```

### 3. Deploy Frontend
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

## Docker Deployment

### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ .

EXPOSE 5000
CMD ["node", "server.js"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
      - GOOGLE_GEMINI_API_KEY=${GOOGLE_GEMINI_API_KEY}
      - GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

## Kubernetes Deployment

### Backend Service
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: disaster-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: disaster-backend
  template:
    metadata:
      labels:
        app: disaster-backend
    spec:
      containers:
      - name: backend
        image: your-registry/disaster-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: FIREBASE_PROJECT_ID
          valueFrom:
            secretKeyRef:
              name: disaster-secrets
              key: firebase-project-id
---
apiVersion: v1
kind: Service
metadata:
  name: disaster-backend-service
spec:
  selector:
    app: disaster-backend
  ports:
  - port: 5000
    targetPort: 5000
  type: LoadBalancer
```

## Cloud Functions Deployment

### Deploy as Google Cloud Function
```bash
gcloud functions deploy disasterAlert \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point=handleRequest \
  --env-vars-file .env.yml
```

## Environment Variables

### Production (.env.production)
```env
FIREBASE_PROJECT_ID=prod-project-id
FIREBASE_DATABASE_URL=https://prod-db.firebaseio.com
GOOGLE_GEMINI_API_KEY=prod-gemini-key
GOOGLE_MAPS_API_KEY=prod-maps-key
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com
```

## Monitoring & Logging

### Firebase Analytics
```javascript
import { analytics } from './services/firebaseService.js';

// Log custom events
analytics.logEvent('disaster_reported', {
  type: 'building_collapse',
  location: { lat, lng }
});
```

### Cloud Logging
```bash
# View logs
gcloud functions logs read disasterAlert --limit 50

# Stream logs
gcloud functions logs read disasterAlert --follow
```

## Database Backups

### Automated Backups
```bash
# Enable in Firebase Console
# Settings > Backups > Enable automated backups
```

### Manual Backup
```bash
gcloud firestore export gs://your-bucket/backup-$(date +%Y%m%d)
```

## SSL/TLS Configuration

### Firebase Hosting (automatic)
- Free SSL certificates
- Auto-renewal

### Custom Domain
```bash
firebase hosting:channel:deploy preview-ch \
  --expires 7d
```

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install dependencies
        run: |
          cd backend && npm install
          cd ../frontend && npm install
      
      - name: Build frontend
        run: cd frontend && npm run build
      
      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

## Performance Optimization

### Frontend
```javascript
// Lazy load Google Maps
const loadGoogleMaps = async () => {
  const { Loader } = await import('@react-google-maps/api');
  // ...
};
```

### Backend
```javascript
// Implement caching
const cache = new Map();
const getCachedAggregation = (key, ttl = 60000) => {
  if (cache.has(key) && Date.now() - cache.get(key).time < ttl) {
    return cache.get(key).data;
  }
  return null;
};
```

### Database
- Enable indexes for frequent queries
- Set retention policies for old data
- Use database rules to optimize reads

## Scaling Strategy

1. **Vertical Scaling**
   - Upgrade Cloud Functions memory
   - Use larger VM instances

2. **Horizontal Scaling**
   - Add more Cloud Function instances
   - Use Kubernetes auto-scaling
   - Add load balancer

3. **Data Scaling**
   - Implement database sharding
   - Archive old data to Cloud Storage
   - Use Firestore for document queries

## Cost Optimization

- Firebase Spark plan (free) for development
- Blaze plan for production with usage-based pricing
- Set budget alerts
- Optimize API calls
- Use CDN for static assets

## Disaster Recovery

1. **Data Backup**
   - Daily automated backups
   - Cross-region replication
   - Test restore procedures

2. **High Availability**
   - Multi-region deployment
   - Database replication
   - Failover mechanisms

3. **Incident Response**
   - Have rollback plan
   - Monitor error rates
   - Quick deployment procedures

## Security Hardening

1. **Firebase Rules**
```javascript
rules_version = '2';
service cloud.firebaseio.com {
  match /databases/{database}/refs {
    // Only users can read their own data
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    // Volunteers can update their location
    match /volunteers/{vid} {
      allow read: if request.auth != null;
      allow update: if request.auth.uid == vid;
    }
  }
}
```

2. **API Security**
   - Validate all inputs
   - Use HTTPS only
   - Implement rate limiting
   - Add CORS restrictions

3. **Secrets Management**
   - Use Cloud Secret Manager
   - Never commit secrets to git
   - Rotate keys regularly

## Checklist

- [ ] Firebase project created and configured
- [ ] Google Cloud APIs enabled
- [ ] Environment variables set
- [ ] Database security rules configured
- [ ] SSL certificates installed
- [ ] Monitoring and logging enabled
- [ ] Backup strategy implemented
- [ ] CI/CD pipeline configured
- [ ] Load testing completed
- [ ] Disaster recovery plan created
