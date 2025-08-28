export const config = {
  SIMULATION_MODE: true, // turn false when wortking on GCP
  GCP_PROJECT_ID: process.env.GCP_PROJECT_ID || '',
  GCP_SERVICE_ACCOUNT_KEY: process.env.GCP_SERVICE_ACCOUNT_KEY || '',
  
  ETL_POLLING_INTERVAL: 5000, 
  UI_POLLING_INTERVAL: 5000,

  MAX_RECORDS: 100,

  MIN_TEMP: 15,
  MAX_TEMP: 30,
};
