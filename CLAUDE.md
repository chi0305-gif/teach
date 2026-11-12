# 給 Claude 的工作規則

## 每次修改網頁後，一定要交付兩種檔案
只要修改了 `index.html`，完成後都要把下面兩個檔案傳給使用者：

1. `index.html` — 完整網頁檔，可直接開啟或上傳。
2. `index-程式碼.txt` — 內容與 `index.html` 完全相同的純文字檔，方便使用者全選複製、貼到協作平台。

兩個檔案都必須是修改後的完整內容，不是只有修改的片段。

## 網站發布：每次修改都要更新 main 分支
網站用 GitHub Pages 從 `main` 分支發布（https://chi0305-gif.github.io/teach/），Google 協作平台以網址嵌入這個網站。
每次修改 `index.html` 並在自己的工作分支 commit、push 之後，也要把同一版本推送到 `main`（`git push origin HEAD:main`），網站才會更新。
推送前先確認 `main` 沒有自己工作分支以外的新修改；若有，先合併再推送，不要覆蓋掉別人的修改。
