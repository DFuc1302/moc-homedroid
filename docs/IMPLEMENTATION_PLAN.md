# Kế hoạch triển khai

## Nguyên tắc

- Xây từng vertical slice chạy được; không dựng framework hoặc abstraction trước nhu cầu.
- Giữ frontend JavaScript modules hiện có và Node standard library khi đủ.
- Mỗi giai đoạn chỉ hoàn thành khi hành vi thật đã được kiểm chứng trên trình duyệt/HomeDroid phù hợp.
- Nội dung mẫu được thay bằng nội dung thật trước khi đánh dấu tính năng hoàn thành.

## Giai đoạn 1 — App shell và content pipeline

### Phạm vi

- Thay giao diện Pomodoro hiện tại bằng navigation, dashboard, module và lesson views.
- Định nghĩa manifest/module/lesson/quiz schema.
- Thêm một module hoàn chỉnh làm mẫu thật, không dùng placeholder.
- Validate content trong test.

### Nghiệm thu

- Mở app trên màn hình 360 px và laptop, điều hướng được dashboard → lesson → quiz.
- App render toàn bộ nội dung mẫu mà không gọi Internet.
- Content ID trùng, prerequisite không tồn tại hoặc quiz thiếu đáp án làm test fail.

## Giai đoạn 2 — Backend, pairing và persistent state

### Phạm vi

- Node service phục vụ frontend và API.
- First-claim pairing, session, auth cho mọi endpoint state.
- `DATA_DIR`, atomic write, backup gần nhất và optimistic revision.
- Progress, checklist, quiz attempt, review item và note đồng bộ.

### Nghiệm thu

- Unauthenticated request bị từ chối.
- Hai browser pair thành công và thấy cùng tiến độ.
- Ghi với revision cũ trả conflict, không mất dữ liệu mới.
- Redeploy/restart giữ nguyên state.
- File state dở hoặc sai schema không bị ghi đè im lặng.

## Giai đoạn 3 — Learning experience hoàn chỉnh

### Phạm vi

- Quiz có giải thích, review queue và flashcard.
- Quy tắc hoàn thành lesson/module.
- Dashboard, streak suy ra từ activity và notes.
- Nhập đủ 9 module theo `CURRICULUM.md`.

### Nghiệm thu

- Không thể hoàn thành lesson bắt buộc khi quiz dưới 70%.
- Câu sai xuất hiện trong review queue và biến mất theo quy tắc ôn tập.
- Chỉ mở app không làm tăng streak.
- Mọi tuần có mục tiêu, example, practice, quiz, artifact và completion criteria.

## Giai đoạn 4 — Python runner

### Phạm vi

- Bundle runtime cục bộ và chỉ lazy-load trong lesson cần runner.
- Editor, Run, Stop, stdout/stderr và reset.
- Web Worker, timeout, code/output limits.
- Bài Python/NumPy nhỏ; không cố chạy PyTorch trong browser.

### Nghiệm thu

- Code đúng trả output mong đợi.
- Infinite loop bị dừng mà UI không treo.
- Stop/reset không mất code đang soạn.
- Dashboard load không tải runtime Python.
- Runner hoạt động khi Internet bị ngắt.

## Giai đoạn 5 — AI tutor trên laptop

### Phạm vi

- Benchmark model phù hợp 8 GB VRAM và chọn backend local.
- Laptop health/chat API.
- HomeDroid proxy, lesson context, request limits, timeout và offline state.
- Không cho tutor gọi tool, shell hoặc đọc file ngoài lesson context.

### Nghiệm thu

- Tutor trả lời câu hỏi dựa trên lesson hiện tại và nêu khi thiếu dữ kiện.
- Laptop tắt làm tutor báo offline; phần còn lại không lỗi.
- Browser không thấy địa chỉ/credential model backend.
- Prompt quá dài và request không auth bị từ chối.
- Log không chứa pairing key, note riêng tư hoặc toàn bộ prompt.

## Giai đoạn 6 — HomeDroid deployment

### Phạm vi

- Lockfile, start command, `HOST`, `PORT`, `DATA_DIR` và tài liệu backup.
- Deploy qua Git repository vào HomeDroid.
- Xác minh current phone IP thay vì dùng IP cũ.
- Kiểm tra browser điện thoại và laptop qua LAN.

### Nghiệm thu

- HomeDroid báo online và endpoint health trả đúng content version.
- Onboarding/pairing hoàn thành bằng UI thật.
- Core learning, sync, runner và tutor được thử trên deployment thật.
- Restart và redeploy không mất state.
- Backup được sao chép và đọc được.

## Bộ kiểm tra tối thiểu

- Content schema và reference integrity.
- First claim, wrong key, replay/rate limit và unauthenticated denial.
- State revision conflict, limits, atomic persistence và restart recovery.
- Quiz scoring, completion gate, review queue và streak.
- Tutor auth, input limits, timeout/offline mapping.
- UI smoke test cho luồng onboarding → lesson → quiz → sync.
- Browser proof cho runner và responsive layout.

## Thứ tự dữ liệu/content

Không đợi hoàn thành platform mới viết khóa học:

1. Giai đoạn 1 dùng toàn bộ Tháng 1 làm content thật.
2. Giai đoạn 2–4 bổ sung Tháng 2–4.
3. Giai đoạn 5 bổ sung Tháng 5–8 và dùng chính lesson làm tutor context test.
4. Trước deployment cuối, bổ sung Tháng 9 và chạy content validation toàn bộ.

## Điều kiện bắt đầu build

- `PRODUCT.md`, `ARCHITECTURE.md`, `CURRICULUM.md` và file này được chấp nhận làm contract.
- Xác minh Node version/runtime mà HomeDroid deployment cung cấp.
- Chọn port chưa dùng và persistent `DATA_DIR` thực tế.
- Xác minh laptop IP có thể được điện thoại truy cập; không ghi cứng IP vào source.
- Chọn tên hiển thị của app; tên kỹ thuật tạm thời là `ai-learning-app`.

## Rủi ro đã biết

| Rủi ro | Cách xử lý |
|---|---|
| Galaxy A21s chỉ khoảng 3 GB RAM | Backend nhỏ; lazy-load Python; không chạy LLM trên phone |
| Laptop IP thay đổi | `AI_BASE_URL` cấu hình deployment; sau đó cân nhắc DHCP reservation |
| HomeDroid redeploy thay source | State đặt ngoài checkout và kiểm tra restart/redeploy |
| Hai browser ghi cùng lúc | Revision conflict, không last-write-wins im lặng |
| Python code treo | Worker có timeout và terminate |
| AI tutor bịa hoặc lệch bài | Lesson context, refusal, test set và hiển thị đây là trợ lý |
| Scope content quá lớn | Mỗi giai đoạn thêm module thật; không tạo placeholder để báo hoàn thành |
