// src/lib/config.ts
export const config = {
  SIMULATION_MODE: true, // set to false when integrating with GCP
  // For later GCP integration:
  GCP_PROJECT_ID: process.env.GCP_PROJECT_ID || '',
  GCP_SERVICE_ACCOUNT_KEY: process.env.GCP_SERVICE_ACCOUNT_KEY || '',
  
  // Polling intervals
  ETL_POLLING_INTERVAL: 5000, // 5 seconds
  UI_POLLING_INTERVAL: 5000,  // 5 seconds
  
  // Data retention
  MAX_RECORDS: 100,
  
  // Temperature simulation ranges
  MIN_TEMP: 15,
  MAX_TEMP: 30,
};
