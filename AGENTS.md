# AGENTS.md — Shared Project Memory & Operational Runbook (DataLab / HomeDroid)

Tài liệu này là bộ nhớ dùng chung cho tất cả AI Agents (Antigravity, Claude Code, Codex, Orca, Copilot) khi làm việc trên repository `C:\PERSONAL_PROJECT\HomeDroid`.

---

## 1. Tổng quan dự án
- **Tên ứng dụng:** **DataLab** (`datalab-homedroid`) — Ứng dụng tự học Data Science, Deep Learning và LLM bằng tiếng Việt trong 9 tháng (36 tuần cốt lõi + 9 bài Assessment cuối mỗi module + 3 tuần Buffer 37–39).
- **Kiến trúc:**
  - Backend HTTP thuần Node.js (`server.mjs`), yêu cầu Node ≥20; Python runner dùng package Pyodide được bundle cùng repository.
  - Frontend SPA thuần (`index.html`, `styles.css`, `app.js`, `curriculum.mjs`).
  - Python runner chạy trong Web Worker; chỉ tải khi người học bấm Run.
  - AI Tutor proxy (`/api/tutor`) gọi OpenAI-compatible local server qua `AI_BASE_URL`; khi laptop offline trả `503 tutor_offline`.
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
- Pairing key phải được cấu hình qua secret environment `PAIRING_KEY` trước lần tạo `DATA_DIR` đầu tiên; key dài ít nhất 24 ký tự.
- Server chỉ lưu SHA-256 hash trong `auth.json`; tuyệt đối không in pairing key vào log, commit hoặc tài liệu.
- Session token cũng chỉ lưu hash; không xóa `DATA_DIR` để khôi phục pairing nếu chưa được chủ dự án cho phép rõ vì việc đó làm mất tiến độ.
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
*(Hiện `app.test.mjs` có 6 test; chạy `npm test` để biết kết quả thực tế).*

### Bước 2: Deploy qua HomeDroid Deployments

1. Push commit lên nhánh `main`; HomeDroid deployment theo dõi Git repository.
2. Runtime `Node.js`; build command `npm ci`; start command `npm start`.
3. Port DataLab đang dùng là `12080`; đặt `HOST=0.0.0.0`, `PORT=12080`, `DATA_DIR=/srv/datalab-data`.
4. Đặt `PAIRING_KEY` trong environment deployment dạng secret trước lần khởi tạo persistent data directory. Không đưa key vào log hoặc form snapshot.
5. Không public port ra Internet. HomeDroid redeploy lấy source từ Git, giữ nguyên `/srv/datalab-data`.

### Bước 3: Kiểm chứng live deployment

```powershell
adb -s R58N53C1AVR shell "ip -4 addr show wlan0"
curl.exe http://<phone-ip>:12080/api/health
```

Health phải có `ok: true`, `contentVersion` và `tutor`. Mở UI trên điện thoại/laptop, pair bằng key từ password manager; thử bài học, Python runner và state sau redeploy.

Không dùng quy trình copy bốn file source trực tiếp qua ADB để deploy app hiện tại: app cần `curriculum.mjs`, `python-worker.js`, Pyodide bundle và dependency cài bằng `npm ci`.

## 6. Checkpoint triển khai & handoff (2026-11-24)

- Code assessment/buffer được thêm trong commit `a92b5f5`; UI/QA follow-ups ở các commit sau đó. Không revert commit của Antigravity khi tiếp tục.
- `curriculum.mjs` định nghĩa 9 module, 36 tuần, assessment 5 câu/module (ngưỡng 70%) và buffer weeks 37–39.
- `app.js` có route `#/assessment/:moduleId`, `#/buffer/:weekId`; assessment và buffer progress lưu theo state revision.
- Quiz theo tuần có 180 prompt string duy nhất, nhưng được sinh từ năm mẫu câu lặp; uniqueness test không chứng minh câu hỏi thực sự đa dạng hoặc đánh giá chiều sâu học tập.
- Các test hiện tại kiểm tra course shape, state validators, pairing/persistence và tutor offline; chưa tự động thử submit assessment/buffer qua browser UI. Chạy UI smoke test trước khi báo hoàn tất các flow này.
- Điểm module assessment được tính phía client; server kiểm tra chỉ range 0–100, không tái tính đáp án. Đây là progress tracker một người dùng, không phải chứng nhận chống gian lận.
- Kiểm tra gần nhất: `npm test` — 6/6 pass; `node --check app.js`, `curriculum.mjs`, `server.mjs` pass.
- Live port `12080` đã trả JavaScript có assessment/buffer routes. Kiểm tra IP LAN hiện tại trước khi dùng, vì DHCP có thể đổi.
- Tutor chưa cấu hình (`AI_BASE_URL` trống); phần học còn lại hoạt động độc lập.
- Pairing secret nằm trong file Windows DPAPI `%USERPROFILE%\.datalab-pairing-key.dpapi`; không ghi secret/dashboard password vào repo hoặc memory. Dashboard password từng xuất hiện trong transcript công cụ; chủ dự án cần xoay password, agents không nhắc lại credential.
- Hai file untracked `HANDOFF_ORCA_HOMEDROID_ADGUARD.md` và `samloader.log` là dữ liệu có sẵn của người dùng; giữ nguyên, không xóa/commit nếu không được yêu cầu.
