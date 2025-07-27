// src/app/api/temperature/route.ts
import { NextResponse } from 'next/server';
import { getTemperatureData, startETL, getETLStats, getLatestTemperature } from '@/lib/etl';

// Ensure ETL pipeline is started on first API call
startETL();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const latest = searchParams.get('latest');
    const stats = searchParams.get('stats');

    // Return only statistics
    if (stats === 'true') {
      const etlStats = getETLStats();
      return NextResponse.json({ 
        success: true, 
        stats: etlStats 
      });
    }

    // Return only latest reading
    if (latest === 'true') {
      const latestReading = getLatestTemperature();
      return NextResponse.json({ 
        success: true, 
        data: latestReading 
      });
    }

    // Return all or limited data
    let data = getTemperatureData();
    
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        data = data.slice(-limitNum); // Get last N records
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
    // This endpoint could be used for manual data insertion or configuration updates
    const body = await request.json();
    
    // For now, just return the received data (could implement data insertion logic)
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

/*
GCP Integration Points:

1. Replace local data fetching with BigQuery queries:
```typescript
import { BigQuery } from '@google-cloud/bigquery';

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
```

2. Add authentication middleware for production:
```typescript
import { verifyIdToken } from '@/lib/auth';

// Add at the beginning of GET/POST functions
const token = request.headers.get('authorization');
if (!token || !await verifyIdToken(token)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

3. Add rate limiting and caching:
```typescript
import { rateLimit } from '@/lib/rate-limit';
import { cache } from '@/lib/cache';

// Add rate limiting
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

await limiter.check(request);
```
*/
