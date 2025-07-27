// src/lib/etl.ts
import { getSensorData, getEnhancedSensorData, SensorReading } from './sensor';
import { config } from './config';

export interface TemperatureRecord {
  temperature: number;
  timestamp: number;
  sensorId: string;
  location: string;
  processed: boolean;
}

export interface ETLStats {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  lastProcessed: number;
}

// In-memory data store (replace with BigQuery in GCP integration)
let temperatureData: TemperatureRecord[] = [];
let etlStats: ETLStats = {
  totalRecords: 0,
  validRecords: 0,
  invalidRecords: 0,
  lastProcessed: 0,
};

// Flag to ensure the ETL pipeline starts only once
let etlStarted = false;

/**
 * Extract: Get data from sensor
 * GCP Integration Point: Replace with Pub/Sub message processing
 */
function extractData(): SensorReading {
  return getEnhancedSensorData();
}

/**
 * Transform: Validate and clean the data
 * Apply business rules and data quality checks
 */
function transformData(sensorReading: SensorReading): TemperatureRecord | null {
  try {
    const { temperature, sensorId, location } = sensorReading;
    
    // Data validation rules
    if (temperature < -50 || temperature > 100) {
      console.warn(`Invalid temperature reading: ${temperature}°C`);
      etlStats.invalidRecords++;
      return null;
    }
    
    // Data transformation
    const record: TemperatureRecord = {
      temperature: Math.round(temperature * 100) / 100, // Round to 2 decimal places
      timestamp: Date.now(),
      sensorId,
      location,
      processed: true,
    };
    
    etlStats.validRecords++;
    return record;
  } catch (error) {
    console.error("Error transforming data:", error);
    etlStats.invalidRecords++;
    return null;
  }
}

/**
 * Load: Store the processed data
 * GCP Integration Point: Replace with BigQuery insert
 */
function loadData(record: TemperatureRecord): void {
  try {
    temperatureData.push(record);
    
    // Keep the history limited to prevent memory issues
    if (temperatureData.length > config.MAX_RECORDS) {
      temperatureData.shift();
    }
    
    etlStats.totalRecords++;
    etlStats.lastProcessed = Date.now();
    
    console.log(`Data loaded: ${record.temperature}°C at ${new Date(record.timestamp).toLocaleTimeString()}`);
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

/**
 * Main ETL process
 */
function runETLCycle(): void {
  try {
    // Extract
    const sensorReading = extractData();
    
    // Transform
    const transformedRecord = transformData(sensorReading);
    
    // Load
    if (transformedRecord) {
      loadData(transformedRecord);
    }
  } catch (error) {
    console.error("ETL cycle error:", error);
  }
}

/**
 * Start the ETL pipeline
 */
export function startETL(pollingInterval = config.ETL_POLLING_INTERVAL): void {
  if (etlStarted) {
    console.log("ETL pipeline already running");
    return;
  }
  
  etlStarted = true;
  console.log(`Starting ETL pipeline with ${pollingInterval}ms interval`);
  
  // Run initial cycle
  runETLCycle();
  
  // Schedule recurring cycles
  setInterval(() => {
    runETLCycle();
  }, pollingInterval);
}

/**
 * Get processed temperature data
 */
export function getTemperatureData(): TemperatureRecord[] {
  return [...temperatureData]; // Return a copy to prevent external mutations
}

/**
 * Get ETL statistics
 */
export function getETLStats(): ETLStats {
  return { ...etlStats };
}

/**
 * Get latest temperature reading
 */
export function getLatestTemperature(): TemperatureRecord | null {
  return temperatureData.length > 0 ? temperatureData[temperatureData.length - 1] : null;
}

/**
 * Get temperature data within a time range
 */
export function getTemperatureDataByTimeRange(startTime: number, endTime: number): TemperatureRecord[] {
  return temperatureData.filter(record => 
    record.timestamp >= startTime && record.timestamp <= endTime
  );
}

/**
 * Reset ETL pipeline (useful for testing)
 */
export function resetETL(): void {
  temperatureData = [];
  etlStats = {
    totalRecords: 0,
    validRecords: 0,
    invalidRecords: 0,
    lastProcessed: 0,
  };
  etlStarted = false;
}

/*
GCP Integration Points:

1. Replace extractData() with Pub/Sub message handler:
   - Subscribe to IoT topic
   - Process incoming messages
   - Handle message acknowledgment

2. Replace loadData() with BigQuery operations:
   - Insert records into BigQuery table
   - Handle batch inserts for efficiency
   - Implement error handling and retries

3. Add Cloud Functions integration:
   - Trigger additional processing
   - Send alerts for anomalies
   - Update dashboards

Example BigQuery integration:
```typescript
import { BigQuery } from '@google-cloud/bigquery';

async function loadToBigQuery(record: TemperatureRecord) {
  const bigquery = new BigQuery({
    projectId: config.GCP_PROJECT_ID,
    keyFilename: config.GCP_SERVICE_ACCOUNT_KEY,
  });
  
  const dataset = bigquery.dataset('iot_data');
  const table = dataset.table('temperature_readings');
  
  await table.insert([record]);
}
```
*/
