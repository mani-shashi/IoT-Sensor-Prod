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

let temperatureData: TemperatureRecord[] = [];
let etlStats: ETLStats = {
  totalRecords: 0,
  validRecords: 0,
  invalidRecords: 0,
  lastProcessed: 0,
};

let etlStarted = false;


function extractData(): SensorReading {
  return getEnhancedSensorData();
}

function transformData(sensorReading: SensorReading): TemperatureRecord | null {
  try {
    const { temperature, sensorId, location } = sensorReading;
    
    // Data validation rules
    if (temperature < -50 || temperature > 100) {
      console.warn(`Invalid temperature reading: ${temperature}°C`);
      etlStats.invalidRecords++;
      return null;
    }
    
    const record: TemperatureRecord = {
      temperature: Math.round(temperature * 100) / 100, 
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

function loadData(record: TemperatureRecord): void {
  try {
    temperatureData.push(record);
  
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

function runETLCycle(): void {
  try {
    const sensorReading = extractData();
  
    const transformedRecord = transformData(sensorReading);

    if (transformedRecord) {
      loadData(transformedRecord);
    }
  } catch (error) {
    console.error("ETL cycle error:", error);
  }
}

export function startETL(pollingInterval = config.ETL_POLLING_INTERVAL): void {
  if (etlStarted) {
    console.log("ETL pipeline already running");
    return;
  }
  
  etlStarted = true;
  console.log(`Starting ETL pipeline with ${pollingInterval}ms interval`);

  runETLCycle();
  
  setInterval(() => {
    runETLCycle();
  }, pollingInterval);
}

export function getTemperatureData(): TemperatureRecord[] {
  return [...temperatureData];
}

export function getETLStats(): ETLStats {
  return { ...etlStats };
}

export function getLatestTemperature(): TemperatureRecord | null {
  return temperatureData.length > 0 ? temperatureData[temperatureData.length - 1] : null;
}

export function getTemperatureDataByTimeRange(startTime: number, endTime: number): TemperatureRecord[] {
  return temperatureData.filter(record => 
    record.timestamp >= startTime && record.timestamp <= endTime
  );
}

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
GCP code
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
*/
