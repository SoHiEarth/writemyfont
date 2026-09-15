# Version history / 履歴

## 0.594 - 2025/9/11

- If the user manually adds custom full-width characters, those characters will no longer have full-width glyphs generated automatically.<br>
  ユーザーが手動で追加した全角文字は自動的に全角グリフを生成しません。
- (Japanese version only) Added vertical-layout bracket characters (the reason most environments do not rotate them according to UAX#50 Tr is unclear).<br>
  （日本語版のみ）括弧類の縦組みグリフを追加（多くの環境でUAX#50のTr定義通りに回転しない理由は不明）

---

## 0.59 - 2025/8/3

- Added background grid options and slightly lowered the Latin reference line position.<br>
  背景グリッドの選択肢を追加。欧文の参考線位置を少し下げました。
- Fixed the issue where double-tapping buttons in iOS Safari could accidentally zoom the viewport.<br>
  iOS Safari でボタンを2回タップすると画面が拡大されてしまう問題を修正。

## 0.58 - 2025/8/3

- Changed outline conversion to a delayed execution flow to reduce canvas interaction lag (= fixed the iOS paint-stalling issue).<br>
  アウトライン変換を遅延実行に変更し、キャンバス操作時の遅延を軽減。（=iOSの描画中断問題を解決）
- Added a stronger pressure sensitivity response.<br>
  さらに新しい筆圧感度を追加。
- Reduced the tendency for circular dots and line trailing at the beginning of strokes with a stylus.<br>
  タッチペンで描画開始時に発生しやすい円形の点や直線の糸引き問題を軽減しました。
- Switched full-width glyphs to use the original position values.<br>
  全角グリフの位置をオリジナル値に変更。

---

## 0.57 - 2025/7/25

- Added a Procreate-like two-finger quick-tap undo feature.<br>
  Procreate のような2本指でのタップによる復元機能。
- Fixed the issue where pressure sensitivity could fail for overly light strokes with Apple Pencil.<br>
  Apple Pencil の筆圧が軽すぎる場合に描画が正常に行われない問題を修正しました。

---

## 0.56 - 2025/7/23

本日調整的功能均為實驗中，未來都可能還會微調，不保證相容性。<br>
本日調整した機能は全て実験中であり、変更する可能性アリ。互換性は保証できない。

- 針對沒有筆壓感應的裝置，加上模擬筆壓功能。<br>
  筆圧非対応デバイスに対し、疑似的な筆圧機能を追加。
- 對於真實筆壓裝置，加上筆壓敏感度設定。本功能應該可以解決Apple Pencil寫字要很用力的問題。<br>
  筆圧対応デバイスに対し、筆圧感度設定機能を追加。Apple Pencilの省力化。

---

## 0.55 - 2025/7/22

- 「我的字就是小」選項。<br>
  「小さく書きたい！」オプション。
- 介面設計微調（放大一些按鈕）<br>
  UI微調整（ボタンサイズなど）
- 清除功能可以復原。<br>
  クリア操作も復元可能に。

---

## 0.54 - 2025/7/21

- 自訂字符功能。<br>
  ユーザー文字リスト。
- 程式設定值讀取機制重構（本修改不影響功能，可提高程式可維護性）

---

## 0.52 - 2025/7/20

- 修改一些事件捕捉機制，嘗試提高設備相容性。<br>
  イベント処理の調整によりデバイスの互換性の向上。
- 字型下載頁面獨立。<br>
  フォントダウンロード機能のページ化。

## 0.50 - 2025/7/20

- 筆壓功能微調<br>
  筆圧対応の微調整。
- （日本語版）般若心経リスト追加。括弧系の縦組みグリフ廃止。

---

## 0.48 - 2025/7/19

- 支援筆刷切換，並支援感壓模式（不支援模擬，需要設備實際傳入筆壓值，如Apple Pencil，或支援手指感壓的裝置）<br>
  ブラシ機能。筆圧に対応（筆圧対応のデバイスが必須）。

---

## 0.40 - 2025/7/18
- 支援鍵盤操作：<br>
  キーボード操作をサポート：
  - 允許使用者使用方向鍵移動字型。<br>
    ユーザーが方向キーを使用して文字を移動できるようにしました。
  - `Z` 鍵復原、`V` 鍵切換畫筆、`C` 鍵切換橡皮擦、`X` 鍵清除。<br>
    `Z` キーで元に戻す、`V` キーでペンに切り替え、`C` キーで消しゴムに切り替え、`X` キーでクリア。
  - `PageDown`、`]`、`Enter`、`Space` 鍵移至下個字。<br>
    `PageDown`、`]`、`Enter`、`Space` キーで次の文字に移動。
  - `PageUp`、`[`、`Shift+Enter` 和 `Shift+Space` 鍵移至上個字。<br>
    `PageUp`、`[`、`Shift+Enter`、`Shift+Space` キーで前の文字に移動。

## 0.39 - 2025/7/18
- 修復非同步操作導致SVG最後筆畫消失問題。<br>
  非同期操作による SVG の最後のストロークが消える問題を修正しました。

---

## 0.38 - 2025/7/17
- 字符列表改為顯示SVG資料，並縮放至產出字型時預期的大小。<br>
  文字リストを SVG データを表示する形式に変更し、生成されるフォントの期待サイズにスケーリングしました。
- 調整[說明文件](README.md)中關於授權、商標的相關註記。<br>
  [README.md](README.md) のライセンスおよび商標に関する注記を調整しました。

---

## 0.37 - 2025/7/11
- 調整筆壓模式。<br>
  筆圧モードを微調整しました。

## 0.35 - 2025/7/11
- 版面調整（解決部分對話框出界問題）。<br>
レイアウトを調整し、一部のダイアログが画面外に出る問題を解決しました。
- （中文版）增加台文全羅與心經附表。

## 0.33 - 2025/7/11
- 新增以測試模式輸出字型檔的功能，並作為預設值。<br>
  テストモードによるフォント生成の機能を追加。これをデフォルト状態とします。

---

## 0.32 - 2025/7/10
- 新增筆壓模式。<br>
  筆圧モードに対応しました。

## 0.26 - 2025/7/10
- 獨立此 Repository，並處理 Action 自動佈版機制。<br>
  GitHub Repositoryを分離。

---

## 0.25 - 2025/7/9
- 依照縮放率設定，調整字身框顯示大小。<br>
  拡大率の設定に従い、仮想ボディーの枠を表示します。
- 橡皮擦功能。<br>
  消しゴム機能。
- （日本語版）縦書き `uni308E.vert` グリフ追加。

---

## 0.20 - 2025/7/8
- 繁中版與日文版同時正式公開。<br>
  繁体字中国語版と日本語版を同時に正式公開。
