#!/bin/bash

# Redis Monitoring Script for Laravel Application
# Usage: ./monitor-redis.sh [interval_seconds]

INTERVAL=${1:-5}  # Default 5 seconds
API_BASE="http://localhost:8201/api"

echo "🔴 Redis Monitoring Dashboard"
echo "================================"
echo "Refresh interval: ${INTERVAL} seconds"
echo "Press Ctrl+C to stop"
echo ""

# Function to get Redis stats
get_redis_stats() {
    curl -s -H "Accept: application/json" "$API_BASE/redis/stats" 2>/dev/null
}

# Function to format and display stats
display_stats() {
    local stats=$1

    if [ -z "$stats" ]; then
        echo "❌ Could not fetch Redis stats"
        return
    fi

    # Parse JSON manually for basic stats
    version=$(echo "$stats" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    uptime=$(echo "$stats" | grep -o '"uptime_human":"[^"]*"' | cut -d'"' -f4)
    memory=$(echo "$stats" | grep -o '"used_memory_human":"[^"]*"' | cut -d'"' -f4)
    hit_rate=$(echo "$stats" | grep -o '"hit_rate":"[^"]*"' | cut -d'"' -f4)
    total_keys=$(echo "$stats" | grep -o '"total_keys":[0-9]*' | cut -d':' -f2)
    ops_per_sec=$(echo "$stats" | grep -o '"instantaneous_ops_per_sec":[0-9]*' | cut -d':' -f2)

    # Clear screen and display
    clear
    echo "🔴 Redis Monitoring Dashboard - $(date)"
    echo "========================================"
    echo "📊 Status: ✅ Connected"
    echo "🏷️  Version: $version"
    echo "⏱️  Uptime: $uptime"
    echo "💾 Memory: $memory"
    echo "🎯 Hit Rate: $hit_rate"
    echo "🔑 Total Keys: $total_keys"
    echo "⚡ Ops/sec: $ops_per_sec"
    echo ""
    echo "🔄 Auto-refresh in ${INTERVAL}s... (Ctrl+C to stop)"
}

# Function to test cache performance
test_cache_performance() {
    echo ""
    echo "🧪 Testing Cache Performance..."

    # Test cache write
    start_time=$(date +%s%3N)
    curl -s "$API_BASE/categories" > /dev/null
    end_time=$(date +%s%3N)

    first_request_time=$((end_time - start_time))

    # Test cache read
    start_time=$(date +%s%3N)
    curl -s "$API_BASE/categories" > /dev/null
    end_time=$(date +%s%3N)

    second_request_time=$((end_time - start_time))

    echo "📈 First request (cache miss): ${first_request_time}ms"
    echo "📈 Second request (cache hit): ${second_request_time}ms"

    if [ $second_request_time -lt $first_request_time ]; then
        echo "✅ Caching is working! Speedup: $((first_request_time - second_request_time))ms"
    else
        echo "⚠️  Cache performance unclear"
    fi
}

# Initial performance test
test_cache_performance

# Main monitoring loop
while true; do
    stats=$(get_redis_stats)
    display_stats "$stats"
    sleep $INTERVAL
done