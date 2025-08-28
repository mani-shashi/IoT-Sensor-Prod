CREATE TABLE IF NOT EXISTS temperature_readings (
    id SERIAL PRIMARY KEY,
    temperature DECIMAL(5,2) NOT NULL,
    timestamp BIGINT NOT NULL,
    sensor_id VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 
    CONSTRAINT temp_range CHECK (temperature >= -50 AND temperature <= 100),
    CONSTRAINT positive_timestamp CHECK (timestamp > 0)
);

CREATE INDEX IF NOT EXISTS idx_temperature_timestamp ON temperature_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_temperature_sensor ON temperature_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_temperature_created ON temperature_readings(created_at DESC);

CREATE TABLE IF NOT EXISTS etl_stats (
    id SERIAL PRIMARY KEY,
    total_records INTEGER DEFAULT 0,
    valid_records INTEGER DEFAULT 0,
    invalid_records INTEGER DEFAULT 0,
    last_processed BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO etl_stats (total_records, valid_records, invalid_records, last_processed) 
VALUES (0, 0, 0, 0) 
ON CONFLICT DO NOTHING;

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

INSERT INTO sensors (sensor_id, location, sensor_type, status) 
VALUES ('TEMP_001', 'Office Building - Floor 1', 'temperature', 'active')
ON CONFLICT (sensor_id) DO NOTHING;

CREATE OR REPLACE FUNCTION update_sensor_last_reading()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sensors 
    SET last_reading = NEW.timestamp, updated_at = CURRENT_TIMESTAMP
    WHERE sensor_id = NEW.sensor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_sensor_reading ON temperature_readings;
CREATE TRIGGER trigger_update_sensor_reading
    AFTER INSERT ON temperature_readings
    FOR EACH ROW
    EXECUTE FUNCTION update_sensor_last_reading();

CREATE OR REPLACE VIEW latest_sensor_readings AS
SELECT DISTINCT ON (sensor_id)
    sensor_id,
    temperature,
    timestamp,
    location,
    created_at
FROM temperature_readings
ORDER BY sensor_id, timestamp DESC;

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
GRANT SELECT, INSERT, UPDATE ON temperature_readings TO PUBLIC;
GRANT SELECT, INSERT, UPDATE ON etl_stats TO PUBLIC;
GRANT SELECT ON sensors TO PUBLIC;
GRANT SELECT ON latest_sensor_readings TO PUBLIC;
GRANT SELECT ON temperature_stats TO PUBLIC;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO PUBLIC;



/* sample data
INSERT INTO temperature_readings (temperature, timestamp, sensor_id, location, processed) VALUES
(22.5, EXTRACT(EPOCH FROM NOW() - INTERVAL '1 hour') * 1000, 'TEMP_001', 'Office Building - Floor 1', true),
(23.1, EXTRACT(EPOCH FROM NOW() - INTERVAL '50 minutes') * 1000, 'TEMP_001', 'Office Building - Floor 1', true),
(21.8, EXTRACT(EPOCH FROM NOW() - INTERVAL '40 minutes') * 1000, 'TEMP_001', 'Office Building - Floor 1', true),
(24.2, EXTRACT(EPOCH FROM NOW() - INTERVAL '30 minutes') * 1000, 'TEMP_001', 'Office Building - Floor 1', true),
(22.9, EXTRACT(EPOCH FROM NOW() - INTERVAL '20 minutes') * 1000, 'TEMP_001', 'Office Building - Floor 1', true);
*/


COMMIT;
