# 給 Claude 的工作說明

## 每次修改後都要交付兩種檔案

只要修改了網頁（`index.html`），完成後一定要用 SendUserFile 傳給使用者這兩個檔案：

1. `index.html` —— 可直接上傳或用瀏覽器開啟
2. `鏡中番薯的國文世界_程式碼.txt` —— 內容與 `index.html` 完全相同，方便使用者全選複製、貼到協作平台

做法：把 `index.html` 複製成 txt 放在 scratchpad（不要放進 repo，避免重複的大檔案），再把兩個檔案一起傳出。

## 其他

- 使用者以繁體中文溝通，回覆請用繁體中文。
- 網頁是單一 HTML 檔（約 60 萬字元，內嵌作品封面圖），3D 場景從 cdn.jsdelivr.net 載入 three.js 0.160.0。
