-- init-db.sql - Database initialization for IoT Temperature System

-- Create database (if not exists)
-- Note: This runs automatically in the postgres container

-- Create temperature readings table
CREATE TABLE IF NOT EXISTS temperature_readings (
    id SERIAL PRIMARY KEY,
    temperature DECIMAL(5,2) NOT NULL,
    timestamp BIGINT NOT NULL,
    sensor_id VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT temp_range CHECK (temperature >= -50 AND temperature <= 100),
    CONSTRAINT positive_timestamp CHECK (timestamp > 0)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_temperature_timestamp ON temperature_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_temperature_sensor ON temperature_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_temperature_created ON temperature_readings(created_at DESC);

-- Create ETL statistics table
CREATE TABLE IF NOT EXISTS etl_stats (
    id SERIAL PRIMARY KEY,
    total_records INTEGER DEFAULT 0,
    valid_records INTEGER DEFAULT 0,
    invalid_records INTEGER DEFAULT 0,
    last_processed BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial ETL stats record
INSERT INTO etl_stats (total_records, valid_records, invalid_records, last_processed) 
VALUES (0, 0, 0, 0) 
ON CONFLICT DO NOTHING;

-- Create sensor metadata table
CREATE TABLE IF NOT EXISTS sensors (
    id SERIAL PRIMARY KEY,
    sensor_id VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(255) NOT NULL,
    sensor_type VARCHAR(50) DEFAULT 'temperature',
    status VARCHAR(20) DEFAULT 'active',
    last_reading BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default sensor
INSERT INTO sensors (sensor_id, location, sensor_type, status) 
VALUES ('TEMP_001', 'Office Building - Floor 1', 'temperature', 'active')
ON CONFLICT (sensor_id) DO NOTHING;

-- Create function to update sensor last_reading
CREATE OR REPLACE FUNCTION update_sensor_last_reading()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sensors 
    SET last_reading = NEW.timestamp, updated_at = CURRENT_TIMESTAMP
    WHERE sensor_id = NEW.sensor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update sensor last_reading
DROP TRIGGER IF EXISTS trigger_update_sensor_reading ON temperature_readings;
CREATE TRIGGER trigger_update_sensor_reading
    AFTER INSERT ON temperature_readings
    FOR EACH ROW
    EXECUTE FUNCTION update_sensor_last_reading();

-- Create view for latest readings per sensor
CREATE OR REPLACE VIEW latest_sensor_readings AS
SELECT DISTINCT ON (sensor_id)
    sensor_id,
    temperature,
    timestamp,
    location,
    created_at
FROM temperature_readings
ORDER BY sensor_id, timestamp DESC;

-- Create view for temperature statistics
CREATE OR REPLACE VIEW temperature_stats AS
SELECT 
    sensor_id,
    location,
    COUNT(*) as total_readings,
    AVG(temperature) as avg_temperature,
    MIN(temperature) as min_temperature,
    MAX(temperature) as max_temperature,
    STDDEV(temperature) as temp_stddev,
    MIN(timestamp) as first_reading,
    MAX(timestamp) as last_reading
FROM temperature_readings
GROUP BY sensor_id, location;

-- Grant permissions (for application user)
-- Note: In production, create a specific user with limited permissions
GRANT SELECT, INSERT, UPDATE ON temperature_readings TO PUBLIC;
GRANT SELECT, INSERT, UPDATE ON etl_stats TO PUBLIC;
GRANT SELECT ON sensors TO PUBLIC;
GRANT SELECT ON latest_sensor_readings TO PUBLIC;
GRANT SELECT ON temperature_stats TO PUBLIC;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO PUBLIC;

-- Sample data for testing (optional)
-- Uncomment the following lines to insert sample data

/*
INSERT INTO temperature_readings (temperature, timestamp, sensor_id, location, processed) VALUES
(22.5, EXTRACT(EPOCH FROM NOW() - INTERVAL '1 hour') * 1000, 'TEMP_001', 'Office Building - Floor 1', true),
(23.1, EXTRACT(EPOCH FROM NOW() - INTERVAL '50 minutes') * 1000, 'TEMP_001', 'Office Building - Floor 1', true),
(21.8, EXTRACT(EPOCH FROM NOW() - INTERVAL '40 minutes') * 1000, 'TEMP_001', 'Office Building - Floor 1', true),
(24.2, EXTRACT(EPOCH FROM NOW() - INTERVAL '30 minutes') * 1000, 'TEMP_001', 'Office Building - Floor 1', true),
(22.9, EXTRACT(EPOCH FROM NOW() - INTERVAL '20 minutes') * 1000, 'TEMP_001', 'Office Building - Floor 1', true);
*/

-- Comments for GCP BigQuery migration:
-- When migrating to GCP BigQuery, this schema can be converted to:
-- 1. BigQuery dataset: iot_data
-- 2. Tables: temperature_readings, etl_stats, sensors
-- 3. Views: latest_sensor_readings, temperature_stats
-- 4. Partitioning: Partition temperature_readings by DATE(TIMESTAMP_MILLIS(timestamp))
-- 5. Clustering: Cluster by sensor_id for better query performance

COMMIT;
