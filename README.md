# 部首（Bushou）

手機優先的漢字部首解構／合成遊戲：先揀結構，再合成中間字（木+木=林），用發現嘅字繼續砌謎題。

## 本機預覽

用任何靜態伺服器開啟根目錄（因為使用 ES modules）：

```bash
npx serve .
```

然後用手機或瀏覽器裝置模擬器開啟。

## 結構

- `index.html` — 單頁骨架
- `css/app.css` — 禁止左右滑動、安全區與觸控細節
- `js/data.js` — 題庫與虛擬鍵盤
- `js/game.js` — 純邏輯（不碰 DOM）
- `js/ui.js` — 畫面綁定
- `js/app.js` — 啟動與流程

之後若要用 Capacitor 打包，把這個資料夾當 web 根目錄即可，不必改遊戲邏輯。

## GitHub

https://github.com/win2094/bushou
