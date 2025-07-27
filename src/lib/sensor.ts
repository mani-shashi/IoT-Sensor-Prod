// src/lib/sensor.ts
import { config } from './config';

export interface SensorReading {
  temperature: number;
  humidity?: number; // Optional for future expansion
  sensorId: string;
  location: string;
}

/**
 * Simulates temperature sensor readings
 * GCP Integration Point: Replace this with Pub/Sub subscription or IoT Core device data
 */
export function getSensorData(): number {
  try {
    // Simulate temperature values between configured min and max
    const temperature = (Math.random() * (config.MAX_TEMP - config.MIN_TEMP) + config.MIN_TEMP);
    return parseFloat(temperature.toFixed(2));
  } catch (error) {
    console.error("Error generating sensor data:", error);
    return 20; // fallback value (room temperature)
  }
}

/**
 * Enhanced sensor data with metadata
 * GCP Integration Point: This structure matches what you'd receive from IoT Core
 */
export function getEnhancedSensorData(): SensorReading {
  try {
    return {
      temperature: getSensorData(),
      sensorId: 'TEMP_001',
      location: 'Office Building - Floor 1',
      // humidity: Math.random() * 100, // Uncomment for humidity simulation
    };
  } catch (error) {
    console.error("Error generating enhanced sensor data:", error);
    return {
      temperature: 20,
      sensorId: 'TEMP_001',
      location: 'Office Building - Floor 1',
    };
  }
}

/**
 * GCP Integration Helper Functions
 * Uncomment and modify when integrating with GCP
 */

/*
// For GCP Pub/Sub integration
export async function subscribeToSensorData(subscriptionName: string) {
  const { PubSub } = require('@google-cloud/pubsub');
  const pubsub = new PubSub({
    projectId: config.GCP_PROJECT_ID,
    keyFilename: config.GCP_SERVICE_ACCOUNT_KEY,
  });
  
  const subscription = pubsub.subscription(subscriptionName);
  
  subscription.on('message', (message) => {
    const data = JSON.parse(message.data.toString());
    // Process sensor data from IoT devices
    message.ack();
  });
}

// For IoT Core integration
export async function getIoTCoreData(deviceId: string) {
  // Implementation for IoT Core device data retrieval
}
*/
