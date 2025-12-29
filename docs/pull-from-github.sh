#!/bin/bash

# Script pull code từ GitHub xuống VPS

echo "=========================================="
echo "⬇️  PULL CODE TỪ GITHUB"
echo "=========================================="
echo ""

# Kiểm tra xem có thay đổi chưa commit không
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  CẢNH BÁO: Có thay đổi chưa commit!"
    echo ""
    echo "Các file đã thay đổi:"
    git status --short
    echo ""
    read -p "Bạn có muốn stash các thay đổi này không? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "💾 Đang stash thay đổi..."
        git stash
        echo "✅ Đã stash xong"
    else
        echo "❌ Hủy pull. Vui lòng commit hoặc stash thay đổi trước."
        exit 1
    fi
fi

# Fetch code mới nhất
echo ""
echo "📡 Đang fetch code mới nhất từ GitHub..."
git fetch origin
if [ $? -ne 0 ]; then
    echo "❌ Lỗi khi fetch. Kiểm tra kết nối mạng và quyền truy cập."
    exit 1
fi
echo "✅ Đã fetch xong"
echo ""

# Hiển thị các commit mới
NEW_COMMITS=$(git log HEAD..origin/main --oneline 2>/dev/null | wc -l)
if [ "$NEW_COMMITS" -gt 0 ]; then
    echo "📋 Có $NEW_COMMITS commit mới sẽ được pull:"
    git log HEAD..origin/main --oneline -10
    echo ""
    read -p "Bạn có muốn tiếp tục pull không? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Đã hủy pull."
        exit 0
    fi
else
    echo "ℹ️  Không có commit mới trên GitHub."
    echo ""
fi

# Pull code
echo "⬇️  Đang pull code..."
git pull origin main
PULL_STATUS=$?

if [ $PULL_STATUS -eq 0 ]; then
    echo ""
    echo "✅ Pull thành công!"
    echo ""
    
    # Nếu có stash, hỏi có muốn apply lại không
    if [ -n "$(git stash list)" ]; then
        read -p "Bạn có muốn apply lại các thay đổi đã stash không? (y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🔄 Đang apply stash..."
            git stash pop
            echo "✅ Đã apply stash xong"
        fi
    fi
    
    echo ""
    echo "📊 Trạng thái sau khi pull:"
    git status
    echo ""
    echo "=========================================="
    echo "✅ Hoàn thành!"
    echo "=========================================="
else
    echo ""
    echo "❌ Có lỗi xảy ra khi pull!"
    echo ""
    echo "Có thể có conflict. Kiểm tra:"
    echo "  git status"
    echo "  git log --merge"
    echo ""
    exit 1
fi






