import { config } from './config';

export interface SensorReading {
  temperature: number;
  humidity?: number;
  sensorId: string;
  location: string;
}


export function getSensorData(): number {
  try {
    const temperature = (Math.random() * (config.MAX_TEMP - config.MIN_TEMP) + config.MIN_TEMP);
    return parseFloat(temperature.toFixed(2));
  } catch (error) {
    console.error("Error generating sensor data:", error);
    return 20;
  }
}

export function getEnhancedSensorData(): SensorReading {
  try {
    return {
      temperature: getSensorData(),
      sensorId: 'TEMP_001',
      location: 'Office Building - Floor 1',
      
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



/*
 GCP code
export async function subscribeToSensorData(subscriptionName: string) {
  const { PubSub } = require('@google-cloud/pubsub');
  const pubsub = new PubSub({
    projectId: config.GCP_PROJECT_ID,
    keyFilename: config.GCP_SERVICE_ACCOUNT_KEY,
  });
  
  const subscription = pubsub.subscription(subscriptionName);
  
  subscription.on('message', (message) => {
    const data = JSON.parse(message.data.toString());
   
    message.ack();
  });
}


export async function getIoTCoreData(deviceId: string) {
  //replace from above
}
*/
