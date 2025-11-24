#!/bin/bash

# Script kiểm tra trạng thái GitHub và so sánh với local

echo "=========================================="
echo "🔍 KIỂM TRA TRẠNG THÁI GITHUB"
echo "=========================================="
echo ""

# 1. Kiểm tra remote
echo "📡 Remote repository:"
git remote -v
echo ""

# 2. Fetch thông tin mới nhất
echo "⬇️  Đang fetch thông tin từ GitHub..."
git fetch origin
echo "✅ Đã fetch xong"
echo ""

# 3. Kiểm tra branch hiện tại
echo "🌿 Branch hiện tại:"
git branch --show-current
echo ""

# 4. So sánh local với remote
echo "📊 So sánh local với GitHub:"
LOCAL_COMMITS=$(git log HEAD..origin/main --oneline 2>/dev/null | wc -l)
REMOTE_COMMITS=$(git log origin/main..HEAD --oneline 2>/dev/null | wc -l)

if [ "$LOCAL_COMMITS" -gt 0 ]; then
    echo "⚠️  Có $LOCAL_COMMITS commit trên GitHub chưa có ở local:"
    git log HEAD..origin/main --oneline -10
    echo ""
fi

if [ "$REMOTE_COMMITS" -gt 0 ]; then
    echo "📤 Có $REMOTE_COMMITS commit ở local chưa push lên GitHub:"
    git log origin/main..HEAD --oneline -10
    echo ""
fi

if [ "$LOCAL_COMMITS" -eq 0 ] && [ "$REMOTE_COMMITS" -eq 0 ]; then
    echo "✅ Local và GitHub đã đồng bộ!"
    echo ""
fi

# 5. Kiểm tra thay đổi chưa commit
echo "📝 Thay đổi chưa commit:"
git status --short
echo ""

# 6. Commit mới nhất
echo "📌 Commit mới nhất trên GitHub:"
git log origin/main --oneline -5
echo ""

# 7. Commit mới nhất ở local
echo "📌 Commit mới nhất ở local:"
git log HEAD --oneline -5
echo ""

echo "=========================================="
echo "✅ Hoàn thành kiểm tra!"
echo "=========================================="






