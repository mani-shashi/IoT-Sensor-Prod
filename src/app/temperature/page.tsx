'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface TemperatureRecord {
  temperature: number;
  timestamp: number;
  sensorId: string;
  location: string;
  processed: boolean;
}

interface ETLStats {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  lastProcessed: number;
}

export default function TemperatureDashboard() {
  const [data, setData] = useState<TemperatureRecord[]>([]);
  const [stats, setStats] = useState<ETLStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  const fetchData = async () => {
    try {
      const [dataRes, statsRes] = await Promise.all([
        fetch('/api/temperature?limit=20'),
        fetch('/api/temperature?stats=true')
      ]);
      
      const dataJson = await dataRes.json();
      const statsJson = await statsRes.json();
      
      if (dataJson.success) {
        setData(dataJson.data || []);
        setError(null);
      } else {
        setError("Failed to load temperature data");
      }
      
      if (statsJson.success) {
        setStats(statsJson.stats);
      }
      
      setLastUpdate(Date.now());
      setLoading(false);
    } catch (err) {
      console.error("Error fetching temperature data:", err);
      setError("Error fetching data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getTemperatureColor = (temp: number) => {
    if (temp < 18) return 'text-blue-600';
    if (temp < 22) return 'text-green-600';
    if (temp < 26) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTemperatureStatus = (temp: number) => {
    if (temp < 18) return 'Cold';
    if (temp < 22) return 'Cool';
    if (temp < 26) return 'Comfortable';
    return 'Warm';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Temperature Dashboard</h1>
              <p className="text-sm text-gray-600">Real-time IoT sensor monitoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date(lastUpdate).toLocaleTimeString()}
              </div>
              <Link 
                href="/"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                ← Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl">📊</div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl">✅</div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Valid Records</p>
                  <p className="text-2xl font-bold text-green-600">{stats.validRecords}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl">❌</div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Invalid Records</p>
                  <p className="text-2xl font-bold text-red-600">{stats.invalidRecords}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl">🕒</div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Last Processed</p>
                  <p className="text-sm font-bold text-gray-900">
                    {stats.lastProcessed ? new Date(stats.lastProcessed).toLocaleTimeString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Temperature */}
        {data.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8 p-8">
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Current Temperature</h2>
              <div className={`text-6xl font-bold mb-2 ${getTemperatureColor(data[data.length - 1].temperature)}`}>
                {data[data.length - 1].temperature}°C
              </div>
              <div className="text-lg text-gray-600 mb-2">
                {getTemperatureStatus(data[data.length - 1].temperature)}
              </div>
              <div className="text-sm text-gray-500">
                Sensor: {data[data.length - 1].sensorId} • {data[data.length - 1].location}
              </div>
            </div>
          </div>
        )}

        {/* Temperature History */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Temperature History</h2>
            <p className="text-sm text-gray-600">Latest 20 readings</p>
          </div>
          
          <div className="p-6">
            {loading && (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading temperature data...</div>
              </div>
            )}
            
            {error && (
              <div className="text-center py-8">
                <div className="text-red-600 bg-red-50 rounded-lg p-4">
                  {error}
                </div>
              </div>
            )}
            
            {!loading && !error && data.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-500">No temperature data available yet.</div>
                <div className="text-sm text-gray-400 mt-2">
                  The ETL pipeline is starting up. Data will appear shortly.
                </div>
              </div>
            )}
            
            {data.length > 0 && (
              <div className="space-y-3">
                {data.slice().reverse().map((record, index) => (
                  <div 
                    key={`${record.timestamp}-${index}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`text-2xl font-bold ${getTemperatureColor(record.temperature)}`}>
                        {record.temperature}°C
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getTemperatureStatus(record.temperature)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {record.sensorId} • {record.location}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-900">
                        {new Date(record.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">ETL Pipeline: Running</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Sensor Simulation: Active</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Mode: Local Simulation</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-700">GCP Integration: Ready</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
