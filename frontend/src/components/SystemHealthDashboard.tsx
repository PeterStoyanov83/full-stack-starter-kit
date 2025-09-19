'use client';

import React, { useState, useEffect } from 'react';
import RedisMonitor from './RedisMonitor';
import { Database, Server, Activity, Clock, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

interface SystemHealth {
  status: string;
  message: string;
  timestamp: string;
  services: {
    database: {
      status: string;
      name: string;
      connection_time?: string;
    };
    cache: {
      status: string;
      driver: string;
    };
    redis: {
      status: string;
      host: string;
      port: number;
      response_time?: string;
    };
    authentication: {
      status: string;
      driver: string;
    };
  };
  metrics: {
    database: Record<string, number | string>;
    cache: {
      write_time: string;
      read_time: string;
      driver: string;
    };
  };
}

export default function SystemHealthDashboard() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchSystemHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8201/api/status');
      if (response.ok) {
        const data = await response.json();
        setSystemHealth(data);
        setLastUpdate(new Date());
        setError('');
      } else {
        throw new Error('Failed to fetch system health');
      }
    } catch (err) {
      setError('System health unavailable');
      console.error('System health error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'offline':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'active':
        return '●';
      case 'degraded':
        return '◐';
      case 'error':
      case 'offline':
        return '●';
      default:
        return '○';
    }
  };

  if (loading && !systemHealth) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main System Health Status */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-3">
            <Server className="w-5 h-5 text-blue-600" />
            <span className="font-medium">System Health</span>
            {systemHealth && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemHealth.status)}`}>
                {getStatusIcon(systemHealth.status)} {systemHealth.status}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetchSystemHealth();
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{lastUpdate.toLocaleTimeString('bg-BG')}</span>
            </div>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>

        {isExpanded && systemHealth && (
          <div className="mt-4 space-y-4">
            {/* Services Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Database</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(systemHealth.services.database.status)}`}>
                    {systemHealth.services.database.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <div>{systemHealth.services.database.name}</div>
                  {systemHealth.services.database.connection_time && (
                    <div>Response: {systemHealth.services.database.connection_time}</div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Cache</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(systemHealth.services.cache.status)}`}>
                    {systemHealth.services.cache.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <div>{systemHealth.services.cache.driver}</div>
                  {systemHealth.metrics.cache && (
                    <div>Read: {systemHealth.metrics.cache.read_time}</div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium">Redis</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(systemHealth.services.redis.status)}`}>
                    {systemHealth.services.redis.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <div>{systemHealth.services.redis.host}:{systemHealth.services.redis.port}</div>
                  {systemHealth.services.redis.response_time && (
                    <div>Ping: {systemHealth.services.redis.response_time}</div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Server className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium">Auth</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(systemHealth.services.authentication.status)}`}>
                    {systemHealth.services.authentication.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <div>{systemHealth.services.authentication.driver}</div>
                </div>
              </div>
            </div>

            {/* Database Metrics */}
            {systemHealth.metrics.database && Object.keys(systemHealth.metrics.database).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-800 mb-3">Database Records</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                  {Object.entries(systemHealth.metrics.database).map(([table, count]) => (
                    <div key={table} className="text-center">
                      <div className="text-gray-500 capitalize">{table}</div>
                      <div className="font-medium text-gray-800">
                        {typeof count === 'number' ? count.toLocaleString() : count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* System Info */}
            <div className="text-xs text-gray-500 border-t pt-3">
              <div>Environment: {systemHealth.services ? 'Production Ready' : 'Development'}</div>
              <div>Last Updated: {new Date(systemHealth.timestamp).toLocaleString('bg-BG')}</div>
            </div>
          </div>
        )}
      </div>

      {/* Redis Detailed Monitoring */}
      <RedisMonitor />
    </div>
  );
}