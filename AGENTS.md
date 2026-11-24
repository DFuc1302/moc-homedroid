# AGENTS.md — Shared Project Memory & Operational Runbook (DataLab / HomeDroid)

Tài liệu này là bộ nhớ dùng chung cho tất cả AI Agents (Antigravity, Claude Code, Codex, Orca, Copilot) khi làm việc trên repository `C:\PERSONAL_PROJECT\HomeDroid`.

---

## 1. Tổng quan dự án
- **Tên ứng dụng:** **DataLab** (`datalab-homedroid`) — Ứng dụng tự học Data Science, Deep Learning và LLM bằng tiếng Việt trong 9 tháng (36 tuần cốt lõi + 9 bài Assessment cuối mỗi module + 3 tuần Buffer 37–39).
- **Kiến trúc:**
  - Zero-dependency backend (`server.mjs` dùng thuần Node.js HTTP server, yêu cầu Node $\ge 20$).
  - Frontend SPA thuần (`index.html`, `styles.css`, `app.js`, `curriculum.mjs`).
  - Python runner chạy trực tiếp trên trình duyệt qua Web Worker (`python-worker.js` + Pyodide trong `node_modules/pyodide`).
  - AI Tutor proxy (`/api/tutor`) gọi tới OpenAI-compatible local server trên laptop qua `AI_BASE_URL` (khi offline trả về `503 tutor_offline` và không ảnh hưởng việc học).
- **Git Remote:** `https://github.com/DFuc1302/moc-homedroid.git` (nhánh `main`).

---

## 2. Môi trường thiết bị HomeDroid (Samsung Galaxy A22)
Ứng dụng được deploy thực tế trên điện thoại Samsung Galaxy A22 chạy app **HomeDroid** (`dev.homedroid`) thông qua proot Alpine Linux:
- **ADB Serial:** `R58N53C1AVR`
- **IP LAN của điện thoại:** Cấp qua DHCP nên có thể thay đổi (từng là `.16`, `.163`, hiện tại là `192.168.1.251`). Luôn kiểm tra IP hiện tại bằng lệnh:
  ```powershell
  adb -s R58N53C1AVR shell "ip -4 addr show wlan0"
  ```
- **Các cổng dịch vụ trên HomeDroid:**
  - `12080`: **DataLab** (`http://<phone-ip>:12080`)
  - `8800`: **HomeDroid Dashboard** (`http://<phone-ip>:8800`)
  - `3000` (Web UI) & `1053` (DNS): **AdGuard Home** module (xem thêm `HANDOFF_ORCA_HOMEDROID_ADGUARD.md`)
- **Cấu trúc đường dẫn trên điện thoại (yêu cầu `su -c` qua `adb shell`):**
  - App UID/GID trên Android: `u0_a244:u0_a244`
  - Cấu hình deployment của HomeDroid: `/data/user/0/dev.homedroid/files/deploys.json`
  - Log runtime của DataLab: `/data/user/0/dev.homedroid/files/logs/deploy-datalab.log`
  - Thư mục mã nguồn DataLab (bên ngoài proot): `/data/user/0/dev.homedroid/files/alpine/srv/datalab` (bên trong proot là `/srv/datalab`)
  - Thư mục dữ liệu bền vững (`DATA_DIR`): `/data/user/0/dev.homedroid/files/alpine/srv/datalab-data` (bên trong proot là `/srv/datalab-data`)
  - Marker commit của HomeDroid: `/data/user/0/dev.homedroid/files/alpine/srv/.homedroid/datalab.commit`

---

## 3. Cơ chế Xác thực & Pairing Key (`server.mjs` & `auth.json`)
- **Nguyên tắc bảo mật:** KHÔNG BAO GIỜ ghi hoặc commit chuỗi `PAIRING_KEY` dạng rõ (plain text) vào Git, log, hoặc tài liệu.
- **Cách `server.mjs` kiểm tra Pairing Key (`POST /api/pair/claim`):**
  Server chấp nhận key nếu mã băm SHA-256 của key khớp với **một trong ba nguồn**:
  1. `store.auth.pairingHash` trong file `$DATA_DIR/auth.json`.
  2. `store.envPairingHash` (băm SHA-256 của biến môi trường `PAIRING_KEY` truyền vào process khi `PAIRING_KEY.length >= 24`, được HomeDroid lưu trong `/data/user/0/dev.homedroid/files/deploys.json`).
  3. Bất kỳ mã băm nào trong mảng `store.auth.allowedHashes` (nếu có) trong `$DATA_DIR/auth.json`.
- **Lưu ý quan trọng khi sửa `auth.json` hoặc `state.json` từ Windows:**
  - **TUYỆT ĐỐI KHÔNG** dùng `Set-Content -Encoding UTF8` của Windows PowerShell 5.1 để ghi file JSON đẩy lên điện thoại, vì PowerShell 5.1 chèn ký tự **UTF-8 BOM (`\uFEFF`)** ở đầu file làm `JSON.parse()` trên Node.js bị crash (`SyntaxError: Unexpected token '\uFEFF'`).
  - Luôn dùng Node.js (`fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8')`) để tạo file JSON không có BOM.
  - Khi copy file vào `/data/user/0/dev.homedroid/files/alpine/srv/...` qua `su -c`, luôn chạy `chown u0_a244:u0_a244 <file>` để proot container có quyền đọc/ghi.

---

## 4. Quy chuẩn UI/UX & Phòng tránh lỗi Visual (`styles.css`, `index.html`, `app.js`)
Khi chỉnh sửa giao diện, phải tuân thủ các quy tắc đã được kiểm chứng qua Browser QA:
1. **Cache-Control cho Static Assets:**
   - Trong `server.mjs`, các file `.html`, `.css`, `.js`, `.mjs` phải luôn trả về `cache-control: no-cache` để trình duyệt không bị kẹt CSS/JS cũ sau khi deploy. Chỉ cache dài hạn (`max-age=3600`) cho các file nặng của Pyodide (`.wasm`, `.zip`).
   - `/favicon.ico` trả về `204 No Content` kết hợp inline SVG `<link rel="icon">` trong `index.html` để không phát sinh lỗi `404` trên trình duyệt.
2. **Typography Tiếng Việt:**
   - Dùng hệ font không chân hỗ trợ tiếng Việt bản địa sắc nét trên cả Windows và Android:
     `--font-sans: "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, -apple-system, sans-serif;`
   - Dùng font Monospace cho `#python-code`, `<pre>`, `.runner-output`:
     `--font-mono: "Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, "Courier New", monospace;`
   - **Không dùng** font `Georgia` (gây lỗi tách rời dấu sắc `ế`, `ố` trên tiếng Việt) và **không dùng** `-webkit-background-clip: text` kèm `line-height < 1.2` trên `h1` (gây cắt mất đỉnh dấu mũ tiếng Việt).
3. **Form Controls (Inputs vs Checkboxes/Radios):**
   - Luôn dùng selector `textarea, input:not([type="checkbox"]):not([type="radio"]) { width: 100%; }`. Không bao giờ gán `input { width: 100%; }` chung vì sẽ làm nút radio trong `.answer` và checkbox trong checklist bị giãn toàn chiều ngang.
   - Các mục checklist trong `.lesson-side` và `renderBufferWeek` phải dùng class `.check-list` > `label.check-item` (`display: flex; flex-direction: row;`) để tách biệt với `label` của ô nhập liệu (`Artifact`, `Ghi chú` dùng `display: grid`).
4. **Async DOM Event Handlers trong `app.js`:**
   - Trong các hàm xử lý sự kiện `async` (như `askTutor`), luôn gán `const form = event.currentTarget;` **trước** lệnh `await` đầu tiên, vì theo chuẩn DOM `event.currentTarget` sẽ trở thành `null` sau khi hàm nhường luồng tại `await`.

---

## 5. Quy trình Kiểm thử & Deploy chuẩn lên HomeDroid
Trước khi báo cáo hoàn thành bất kỳ thay đổi nào, thực hiện đủ 3 bước:

### Bước 1: Chạy Unit Test tại local
```powershell
npm test
```
*(Đảm bảo toàn bộ 6/6 contract tests trong `app.test.mjs` đều pass).*

### Bước 2: Commit & Push lên GitHub + Đồng bộ trực tiếp qua ADB
*(Lưu ý trong PowerShell: dùng dấu nháy kép bên ngoài và nháy đơn bên trong cho `su -c '...'`, tránh dùng ký tự pipe `|` hoặc `$(...)` trực tiếp trong chuỗi nháy kép của PowerShell).*
```powershell
git push origin main

adb -s R58N53C1AVR push index.html /data/local/tmp/index.html
adb -s R58N53C1AVR push styles.css /data/local/tmp/styles.css
adb -s R58N53C1AVR push app.js /data/local/tmp/app.js
adb -s R58N53C1AVR push server.mjs /data/local/tmp/server.mjs

adb -s R58N53C1AVR shell "su -c 'cp /data/local/tmp/index.html /data/user/0/dev.homedroid/files/alpine/srv/datalab/index.html && cp /data/local/tmp/styles.css /data/user/0/dev.homedroid/files/alpine/srv/datalab/styles.css && cp /data/local/tmp/app.js /data/user/0/dev.homedroid/files/alpine/srv/datalab/app.js && cp /data/local/tmp/server.mjs /data/user/0/dev.homedroid/files/alpine/srv/datalab/server.mjs && chown u0_a244:u0_a244 /data/user/0/dev.homedroid/files/alpine/srv/datalab/index.html /data/user/0/dev.homedroid/files/alpine/srv/datalab/styles.css /data/user/0/dev.homedroid/files/alpine/srv/datalab/app.js /data/user/0/dev.homedroid/files/alpine/srv/datalab/server.mjs && killall -9 node'"
```
*(Supervisor của HomeDroid sẽ tự động khởi động lại `node server.mjs` sau khoảng 3–5 giây).*

### Bước 3: Kiểm chứng Live Health & Log trên thiết bị
```powershell
Start-Sleep -Seconds 5
adb -s R58N53C1AVR shell "su -c 'tail -n 15 /data/user/0/dev.homedroid/files/logs/deploy-datalab.log'"
curl.exe -i http://192.168.1.251:12080/api/health
```
