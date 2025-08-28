import { NextResponse } from 'next/server';
import { getTemperatureData, startETL, getETLStats, getLatestTemperature } from '@/lib/etl';

startETL();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const latest = searchParams.get('latest');
    const stats = searchParams.get('stats');

    if (stats === 'true') {
      const etlStats = getETLStats();
      return NextResponse.json({ 
        success: true, 
        stats: etlStats 
      });
    }

    if (latest === 'true') {
      const latestReading = getLatestTemperature();
      return NextResponse.json({ 
        success: true, 
        data: latestReading 
      });
    }

    let data = getTemperatureData();
    
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        data = data.slice(-limitNum);
      }
    }

    return NextResponse.json({ 
      success: true, 
      data,
      count: data.length,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error("Error fetching temperature data:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Error retrieving temperature data",
      timestamp: Date.now()
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    return NextResponse.json({ 
      success: true, 
      message: "Data received",
      received: body,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error("Error processing POST request:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Error processing request",
      timestamp: Date.now()
    }, { status: 500 });
  }
}

/* GCP code
import { BigQuery } from '@google-cloud/bigquery';
import { verifyIdToken } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { cache } from '@/lib/cache';


const token = request.headers.get('authorization');
if (!token || !await verifyIdToken(token)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

async function getTemperatureFromBigQuery(limit?: number) {
  const bigquery = new BigQuery({
    projectId: config.GCP_PROJECT_ID,
    keyFilename: config.GCP_SERVICE_ACCOUNT_KEY,
  });
  
  const query = `
    SELECT temperature, timestamp, sensorId, location
    FROM \`${config.GCP_PROJECT_ID}.iot_data.temperature_readings\`
    ORDER BY timestamp DESC
    ${limit ? `LIMIT ${limit}` : ''}
  `;
  
  const [rows] = await bigquery.query(query);
  return rows;
}

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

await limiter.check(request);

*/
