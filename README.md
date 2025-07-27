# IoT Temperature Sensor Monitoring System

A comprehensive Internet of Things (IoT) project that simulates temperature sensor data collection, processes it through an ETL pipeline, and displays real-time analytics on a modern web dashboard. Built with Next.js, TypeScript, and Docker, with integration to Google Cloud Platform (GCP) services.

![System Architecture](https://img.shields.io/badge/Architecture-IoT%20%7C%20ETL%20%7C%20Real--time-blue)
![Tech Stack](https://img.shields.io/badge/Tech-Next.js%20%7C%20TypeScript%20%7C%20Docker-green)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   IoT Sensors   │───▶│   ETL Pipeline  │───▶│  Web Dashboard  │
│   (Simulated)   │    │  Extract/Trans/ │    │   (Real-time)   │
│                 │    │     Load        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ MQTT Broker     │    │ Data Storage    │    │ API Gateway     │
│ (Mosquitto)     │    │ (In-Memory/DB)  │    │ (Next.js API)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ✨ Features

### Core Functionality
- **🌡️ Temperature Sensor Simulation**: Generates realistic temperature data (15°C - 30°C)
- **📊 ETL Pipeline**: Extract, Transform, and Load data with validation and error handling
- **📈 Real-time Dashboard**: Live temperature monitoring with 5-second updates
- **🔄 Data Processing**: Automatic data validation, filtering, and statistics
- **📱 Responsive UI**: Modern, clean interface built with Tailwind CSS

### Technical Features
- **🐳 Containerization**: Complete Docker setup with multi-stage builds
- **🔧 Development Tools**: Hot reload, TypeScript support, ESLint configuration
- **📡 API Gateway**: RESTful endpoints for data access and statistics
- **🗄️ Database Ready**: PostgreSQL integration prepared for production
- **🔒 Security**: CORS configuration, input validation, error handling

### Production Ready
- **☁️ GCP Integration Points**: Clearly marked areas for cloud migration
- **📊 Monitoring**: ETL statistics and system health indicators
- **🚀 Scalable Architecture**: Designed for horizontal scaling
- **📝 Comprehensive Logging**: Structured logging throughout the application

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/mani-shashi/IoT-Sensor-Prod.git 
   cd iot-temperature-monitoring
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Main Dashboard: http://localhost:8000
   - Temperature Monitor: http://localhost:8000/temperature
   - API Endpoint: http://localhost:8000/api/temperature

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   npm run docker:compose:up
   ```

2. **View logs**
   ```bash
   npm run docker:compose:logs
   ```

3. **Stop services**
   ```bash
   npm run docker:compose:down
   ```

### Manual Docker Build

```bash
# Build the image
npm run docker:build

# Run the container
npm run docker:run
```

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/temperature/    # API endpoints
│   │   ├── temperature/        # Dashboard page
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx           # Home page
│   ├── lib/                   # Core libraries
│   │   ├── config.ts          # Configuration management
│   │   ├── sensor.ts          # Sensor simulation
│   │   └── etl.ts            # ETL pipeline logic
│   └── components/ui/         # Reusable UI components
├── public/                    # Static assets
├── docker-compose.yml         # Multi-service setup
├── Dockerfile                # Container configuration
├── init-db.sql              # Database initialization
├── mosquitto.conf           # MQTT broker config
└── README.md               # This file
```

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env.local`:

```bash
# Application
NODE_ENV=development
PORT=8000

# ETL Configuration
ETL_POLLING_INTERVAL=5000
MAX_RECORDS=100
TEMPERATURE_MIN=15
TEMPERATURE_MAX=30

# GCP Integration (for production)
GCP_PROJECT_ID=your-project-id
GCP_SERVICE_ACCOUNT_KEY=path/to/key.json
```

### Simulation Parameters

Modify `src/lib/config.ts` to adjust:
- Temperature ranges
- Polling intervals
- Data retention limits
- Validation rules

## 📊 API Documentation

### GET /api/temperature

Retrieve temperature data with optional parameters:

```bash
# Get all data
curl http://localhost:8000/api/temperature

# Get latest 10 records
curl http://localhost:8000/api/temperature?limit=10

# Get only latest reading
curl http://localhost:8000/api/temperature?latest=true

# Get ETL statistics
curl http://localhost:8000/api/temperature?stats=true
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "temperature": 22.5,
      "timestamp": 1703123456789,
      "sensorId": "TEMP_001",
      "location": "Office Building - Floor 1",
      "processed": true
    }
  ],
  "count": 1,
  "timestamp": 1703123456789
}
```

## 🌐 GCP Integration Guide

This project is designed for easy migration to Google Cloud Platform. Here are the integration points:

### 🔄 Current Simulation → GCP Services

| Component | Current Implementation | GCP Integration |
|-----------|----------------------|-----------------|
| **Data Ingestion** | Local sensor simulation | **IoT Core** + **Pub/Sub** |
| **Message Queue** | In-memory processing | **Cloud Pub/Sub** |
| **Data Storage** | In-memory array | **BigQuery** |
| **Processing** | Local ETL pipeline | **Cloud Functions** |
| **Hosting** | Local Docker | **Cloud Run** |
| **Monitoring** | Console logs | **Cloud Monitoring** |

### 📝 Migration Steps

1. **Set up GCP Project**
   ```bash
   gcloud projects create your-iot-project
   gcloud config set project your-iot-project
   ```

2. **Enable Required APIs**
   ```bash
   gcloud services enable iot.googleapis.com
   gcloud services enable pubsub.googleapis.com
   gcloud services enable bigquery.googleapis.com
   gcloud services enable cloudfunctions.googleapis.com
   gcloud services enable run.googleapis.com
   ```

3. **Update Configuration**
   ```typescript
   // src/lib/config.ts
   export const config = {
     SIMULATION_MODE: false, // Enable GCP integration
     GCP_PROJECT_ID: 'your-iot-project',
     GCP_SERVICE_ACCOUNT_KEY: '/path/to/service-account.json',
   };
   ```

4. **Replace Sensor Simulation**
   ```typescript
   // src/lib/sensor.ts - Replace with IoT Core
   import { IoT } from '@google-cloud/iot';
   
   export async function subscribeToIoTCore() {
     // Implementation for IoT Core device data
   }
   ```

5. **Update ETL Pipeline**
   ```typescript
   // src/lib/etl.ts - Replace with Pub/Sub + BigQuery
   import { PubSub } from '@google-cloud/pubsub';
   import { BigQuery } from '@google-cloud/bigquery';
   
   export async function setupPubSubETL() {
     // Implementation for cloud-based ETL
   }
   ```

### 🔧 GCP-Specific Files

When migrating, you'll need to create:
- `cloudbuild.yaml` - Build configuration
- `app.yaml` - App Engine configuration (alternative to Cloud Run)
- `terraform/` - Infrastructure as Code
- `gcp-functions/` - Cloud Functions for processing

## 🧪 Testing

### Manual Testing

1. **Start the application**
   ```bash
   npm run dev
   ```

2. **Verify ETL Pipeline**
   - Check console logs for "Data loaded" messages
   - Visit `/api/temperature?stats=true` for ETL statistics

3. **Test Dashboard**
   - Navigate to `/temperature`
   - Verify real-time updates every 5 seconds
   - Check temperature data display

### API Testing

```bash
# Test API endpoints
curl -X GET http://localhost:8000/api/temperature
curl -X GET http://localhost:8000/api/temperature?limit=5
curl -X GET http://localhost:8000/api/temperature?stats=true
```

## 🐛 Troubleshooting

### Common Issues

1. **Port 8000 already in use**
   ```bash
   # Kill process using port 8000
   fuser -k 8000/tcp
   # Or change port in package.json
   ```

2. **Docker build fails**
   ```bash
   # Clean Docker cache
   docker system prune -a
   # Rebuild without cache
   docker build --no-cache -t iot-temperature-app .
   ```

3. **ETL pipeline not starting**
   - Check console logs for errors
   - Verify API endpoint is being called
   - Ensure no JavaScript errors in browser console

4. **No temperature data showing**
   - Wait 5-10 seconds for initial data generation
   - Check `/api/temperature` endpoint directly
   - Verify ETL statistics at `/api/temperature?stats=true`

### Debug Mode

Enable detailed logging:
```bash
# Set environment variable
export LOG_LEVEL=debug
npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add proper error handling
- Include JSDoc comments for functions
- Test both simulation and integration scenarios
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the excellent React framework
- **Google Cloud** - For comprehensive IoT and data services
- **Docker** - For containerization technology
- **Eclipse Mosquitto** - For MQTT broker implementation

## 📞 Support

For questions and support:
- Create an issue in the repository
- Check the troubleshooting section
- Review GCP integration documentation

---

**Built with ❤️ by @mani-shashi**
