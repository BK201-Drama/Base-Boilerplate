#!/bin/bash

# 数据库配置脚本
# 此脚本帮助配置本地 PostgreSQL 数据库

set -e

echo "🚀 开始配置本地数据库..."

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "📝 创建 .env 文件..."
    cp env.example .env
    echo "✅ .env 文件已创建"
else
    echo "✅ .env 文件已存在"
fi

# 检查 Docker 是否可用
if command -v docker &> /dev/null; then
    echo "🐳 检测到 Docker，尝试使用 Docker Compose 启动 PostgreSQL..."

    # 检查容器是否已运行
    if docker compose ps postgres 2>/dev/null | grep -q "Up"; then
        echo "✅ PostgreSQL 容器已在运行"
    else
        echo "📦 启动 PostgreSQL 容器..."
        cd ..
        docker compose up -d postgres

        echo "⏳ 等待数据库就绪..."
        sleep 5

        # 检查容器状态
        if docker compose ps postgres | grep -q "Up"; then
            echo "✅ PostgreSQL 容器已启动"
        else
            echo "❌ PostgreSQL 容器启动失败"
            echo "💡 提示：如果网络问题导致无法拉取镜像，请尝试："
            echo "   1. 检查网络连接"
            echo "   2. 配置 Docker 镜像源"
            echo "   3. 或使用本地安装的 PostgreSQL"
            exit 1
        fi
    fi
    cd backend
else
    echo "⚠️  未检测到 Docker"
    echo "💡 请选择以下方案之一："
    echo "   1. 安装 Docker 并使用 Docker Compose"
    echo "   2. 本地安装 PostgreSQL"
fi

# 检查数据库连接
echo "🔍 检查数据库连接..."
if command -v psql &> /dev/null; then
    if PGPASSWORD=postgres psql -h localhost -U postgres -d base_boilerplate -c "SELECT 1;" &>/dev/null; then
        echo "✅ 数据库连接成功"
    else
        echo "⚠️  无法连接到数据库，但将继续尝试迁移..."
    fi
fi

# 运行 Prisma 迁移
echo "📊 运行 Prisma 迁移..."
if command -v npx &> /dev/null; then
    npx prisma migrate dev --name init || echo "⚠️  迁移可能已存在或失败"
else
    echo "⚠️  未找到 npx，请手动运行: npx prisma migrate dev"
fi

# 生成 Prisma Client
echo "🔧 生成 Prisma Client..."
if command -v npx &> /dev/null; then
    npx prisma generate
    echo "✅ Prisma Client 已生成"
else
    echo "⚠️  未找到 npx，请手动运行: npx prisma generate"
fi

echo ""
echo "🎉 数据库配置完成！"
echo ""
echo "📋 连接信息："
echo "   主机: localhost"
echo "   端口: 5432"
echo "   数据库: base_boilerplate"
echo "   用户名: postgres"
echo "   密码: postgres"
echo ""
echo "💡 使用 Prisma Studio 查看数据: npx prisma studio"

