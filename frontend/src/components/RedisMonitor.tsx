'use client';

import React, { useState, useEffect } from 'react';
import { Database, Activity, TrendingUp, Clock, Zap, HardDrive } from 'lucide-react';

interface RedisMetrics {
  connection: {
    connected_clients: number;
    total_connections_received: number;
    rejected_connections: number;
  };
  memory: {
    used_memory: string;
    used_memory_human: string;
    used_memory_peak: string;
    used_memory_peak_human: string;
    memory_fragmentation_ratio: number;
  };
  stats: {
    total_commands_processed: number;
    instantaneous_ops_per_sec: number;
    keyspace_hits: number;
    keyspace_misses: number;
    hit_rate: number;
  };
  keyspace: {
    total_keys: number;
    databases: Record<string, any>;
  };
  server: {
    redis_version: string;
    uptime_in_seconds: number;
    uptime_in_days: number;
  };
}

interface RedisStatus {
  status: string;
  host: string;
  port: number;
  response_time: string;
}

export default function RedisMonitor() {
  const [metrics, setMetrics] = useState<RedisMetrics | null>(null);
  const [status, setStatus] = useState<RedisStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchRedisData = async () => {
    try {
      // Fetch comprehensive system status
      const statusResponse = await fetch('http://localhost:8201/api/status');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setStatus(statusData.services?.redis);
        setMetrics(statusData.metrics?.redis);
      }

      // Fetch real-time Redis metrics
      const metricsResponse = await fetch('http://localhost:8201/api/health/redis');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.redis);
      }

      setError('');
    } catch (err) {
      setError('Failed to fetch Redis metrics');
      console.error('Redis monitoring error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedisData();
    const interval = setInterval(fetchRedisData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-2 text-red-600">
          <Database className="w-5 h-5" />
          <span className="font-medium">Redis Monitor</span>
        </div>
        <p className="text-red-500 text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-red-500" />
          <span className="font-medium">Redis Monitor</span>
          {status && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
              {status.status}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          {status?.response_time && (
            <span>{status.response_time}</span>
          )}
          <span className="transform transition-transform duration-200 text-gray-400">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </div>

      {isExpanded && metrics && (
        <div className="mt-4 space-y-4">
          {/* Connection Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Connections</span>
              </div>
              <div className="text-lg font-semibold text-blue-900">
                {metrics.connection.connected_clients}
              </div>
              <div className="text-xs text-blue-600">
                {metrics.connection.total_connections_received.toLocaleString()} total
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Hit Rate</span>
              </div>
              <div className="text-lg font-semibold text-green-900">
                {metrics.stats.hit_rate}%
              </div>
              <div className="text-xs text-green-600">
                {metrics.stats.keyspace_hits.toLocaleString()} hits
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Ops/sec</span>
              </div>
              <div className="text-lg font-semibold text-purple-900">
                {metrics.stats.instantaneous_ops_per_sec}
              </div>
              <div className="text-xs text-purple-600">
                {metrics.stats.total_commands_processed.toLocaleString()} total
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <HardDrive className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-800">Memory Usage</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Current</div>
                <div className="font-medium">{metrics.memory.used_memory_human}</div>
              </div>
              <div>
                <div className="text-gray-500">Peak</div>
                <div className="font-medium">{metrics.memory.used_memory_peak_human}</div>
              </div>
              <div>
                <div className="text-gray-500">Fragmentation</div>
                <div className="font-medium">{metrics.memory.memory_fragmentation_ratio}</div>
              </div>
              <div>
                <div className="text-gray-500">Keys</div>
                <div className="font-medium">{metrics.keyspace.total_keys.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Server Info */}
          <div className="border-t pt-3">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-800">Server Info</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Version</div>
                <div className="font-medium">{metrics.server.redis_version}</div>
              </div>
              <div>
                <div className="text-gray-500">Uptime</div>
                <div className="font-medium">{formatUptime(metrics.server.uptime_in_seconds)}</div>
              </div>
              <div>
                <div className="text-gray-500">Host</div>
                <div className="font-medium">{status?.host}:{status?.port}</div>
              </div>
            </div>
          </div>

          {/* Database Info */}
          {Object.keys(metrics.keyspace.databases).length > 0 && (
            <div className="border-t pt-3">
              <div className="text-sm font-medium text-gray-800 mb-2">Databases</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(metrics.keyspace.databases).map(([db, info]: [string, any]) => (
                  <div key={db} className="bg-gray-50 rounded p-2 text-xs">
                    <div className="font-medium text-gray-800">{db.toUpperCase()}</div>
                    <div className="text-gray-600">
                      Keys: {info.keys?.toLocaleString() || 0} |
                      Expires: {info.expires?.toLocaleString() || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}