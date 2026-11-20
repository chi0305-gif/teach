/**
 * 鏡中番薯的國文世界：學生學習紀錄 → Google 試算表
 *
 * 使用方式（只要做一次）：
 *   1. 建立一份新的 Google 試算表 → 上方選單「擴充功能」→「Apps Script」。
 *   2. 把這個檔案的全部內容貼上，取代原本的內容，按「儲存」。
 *   3. 右上角「部署」→「新增部署作業」→ 類型選「網頁應用程式」：
 *        執行身分：我（你的帳號）
 *        誰可以存取：所有人
 *      按「部署」，依畫面授權，複製「網頁應用程式網址」（結尾是 /exec）。
 *   4. 把網址交給 Claude，接到網站上。
 *
 * 網站會送來兩種紀錄，各自放在一個工作表：
 *   houshan → 「後山厚閱讀」：學生蓋印章時
 *   oddq    → 「柴郡貓思辨卡」：學生完成思辨卡時
 */

const SHEETS = {
  houshan: {
    name: '後山厚閱讀',
    header: ['時間', '班級', '座號', '姓名', '主題', '單元', '出口卡', '快問快答一次答對', '心情天氣'],
    row: (d) => [d.cls, d.seat, d.name, d.theme, d.unit, d.exit, d.stars, d.mood]
  },
  oddq: {
    name: '柴郡貓思辨卡',
    header: ['時間', '班級', '座號', '姓名', '冊次', '課次', '問題', '關卡', '思辨卡內容'],
    row: (d) => [d.cls, d.seat, d.name, d.book, d.lesson, d.question, d.level, d.card]
  }
};

// 每一格最多保留的字數，避免有人送來超長內容
const MAX_LEN = 3000;

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const def = SHEETS[d.type];
    if (!def) return reply({ ok: false, error: 'unknown type' });
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(def.name) || ss.insertSheet(def.name);
    if (sh.getLastRow() === 0) {
      sh.appendRow(def.header);
      sh.getRange(1, 1, 1, def.header.length).setFontWeight('bold').setBackground('#f7f2ff');
      sh.setFrozenRows(1);
    }
    sh.appendRow([new Date()].concat(def.row(d).map(clean)));
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// 用瀏覽器打開網址時顯示這行字，代表部署成功
function doGet() {
  return ContentService.createTextOutput('鏡中番薯的國文世界：學習紀錄接收程式已啟用。');
}

// 轉成文字、限制長度；開頭是 = + - @ 的內容前面加 '，避免被試算表當成公式執行
function clean(v) {
  let s = v == null ? '' : String(v);
  if (s.length > MAX_LEN) s = s.slice(0, MAX_LEN) + '…';
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
