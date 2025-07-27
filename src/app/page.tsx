import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            IoT Temperature
            <span className="block text-blue-600">Monitoring System</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Real-time temperature sensor data collection, processing through ETL pipeline, 
            and visualization on a modern web dashboard.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">ETL Pipeline</h3>
              <p className="text-gray-600 text-sm">
                Extract, Transform, and Load sensor data with real-time processing
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-3xl mb-3">🌡️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Live Monitoring</h3>
              <p className="text-gray-600 text-sm">
                Real-time temperature readings with data validation and analytics
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-3xl mb-3">🐳</div>
              <h3 className="font-semibold text-gray-900 mb-2">Containerized</h3>
              <p className="text-gray-600 text-sm">
                Docker-ready application with GCP integration markers
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/temperature"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              View Dashboard
            </Link>
            
            <Link 
              href="/api/temperature"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              API Endpoint
            </Link>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Built with Next.js, TypeScript, and Docker. Ready for GCP integration.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
