#!/bin/bash

# Decorify Railway Status Dashboard
# Проверяет статус всех развернутых сервисов

echo "🚄 Decorify Railway Status Dashboard"
echo "===================================="

services=("api-gateway" "auth" "product" "order" "payment" "vendor" "cart")

for service in "${services[@]}"; do
    echo "📊 $service:"
    railway service use $service > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        # Получаем статус сервиса
        status=$(railway status --json 2>/dev/null | jq -r '.deployments[0].status // "unknown"')
        url=$(railway status --json 2>/dev/null | jq -r '.deployments[0].url // "no-url"')
        updated=$(railway status --json 2>/dev/null | jq -r '.deployments[0].updatedAt // "unknown"')

        case $status in
            "SUCCESS")
                echo "  ✅ Status: $status"
                ;;
            "BUILDING")
                echo "  🔨 Status: $status"
                ;;
            "FAILED")
                echo "  ❌ Status: $status"
                ;;
            *)
                echo "  ⚠️  Status: $status"
                ;;
        esac

        echo "  🌐 URL: $url"
        echo "  📅 Updated: $updated"

        # Проверяем health check для API Gateway
        if [ "$service" = "api-gateway" ] && [ "$url" != "no-url" ]; then
            health_response=$(curl -s -o /dev/null -w "%{http_code}" "$url/health" 2>/dev/null || echo "000")
            if [ "$health_response" = "200" ]; then
                echo "  💚 Health: OK"
            else
                echo "  💔 Health: FAILED ($health_response)"
            fi
        fi
    else
        echo "  ❌ Service not found or not accessible"
    fi
    echo ""
done

echo "🗄️ Database Services:"
echo "===================="

# Проверяем PostgreSQL
railway service use postgresql > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "📊 PostgreSQL:"
    pg_status=$(railway status --json 2>/dev/null | jq -r '.deployments[0].status // "unknown"')
    echo "  Status: $pg_status"
else
    echo "❌ PostgreSQL service not found"
fi

# Проверяем Redis
railway service use redis > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "📊 Redis:"
    redis_status=$(railway status --json 2>/dev/null | jq -r '.deployments[0].status // "unknown"')
    echo "  Status: $redis_status"
else
    echo "❌ Redis service not found"
fi

echo ""
echo "🎯 Quick Commands:"
echo "=================="
echo "📋 View all services: railway status"
echo "📝 View logs: railway logs --follow"
echo "⚙️  Set variables: railway variables set KEY=value"
echo "🔄 Redeploy service: railway up --detach"
