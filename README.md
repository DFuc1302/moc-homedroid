# DataLab

Ứng dụng tự học Data Science, Deep Learning và LLM bằng tiếng Việt trong 9 tháng. Một Node.js service nhỏ chạy trên HomeDroid, phục vụ UI và lưu tiến độ chung cho điện thoại/laptop.

## Đã triển khai

- 9 module, 36 tuần; mỗi tuần có mục tiêu, khái niệm, example, thực hành, quiz 5 câu, artifact, completion gate và 3 flashcard.
- Dashboard, streak theo hoạt động, checklist, notes, review queue và backup JSON.
- First-pairing, session bearer token, giới hạn body, rate-limit pairing, atomic state write, backup gần nhất và optimistic revision.
- Python/NumPy runner bằng Pyodide Web Worker; runtime chỉ tải khi bấm **Run**, có Stop và timeout 15 giây.
- AI tutor proxy tới OpenAI-compatible local endpoint trên laptop; offline không ảnh hưởng phần học khác.
- Responsive từ 320 px; không phụ thuộc CDN khi học.

## Chạy local

Yêu cầu Node.js 20 trở lên:

```bash
npm install
PAIRING_KEY="mot-key-thu-nghiem-du-dai" DATA_DIR="./datalab-data" npm start
```

Mở `http://localhost:8090`, nhập pairing key. `PAIRING_KEY` bắt buộc ở lần khởi tạo data directory đầu tiên, dài ít nhất 24 ký tự và không được server ghi vào log. Lưu key trong password manager.

```bash
npm test
```

## Deploy HomeDroid

Tạo Node.js deployment từ repository này:

| Thiết lập | Giá trị |
|---|---|
| Branch | `main` |
| Port | `12080` |
| Build command | `npm ci` |
| Start command | `npm start` |
| `HOST` | `0.0.0.0` |
| `PORT` | `12080` |
| `PAIRING_KEY` | secret ngẫu nhiên ≥ 24 ký tự, chỉ bắt buộc khi khởi tạo |
| `DATA_DIR` | `/srv/datalab-data` |
Không public port ra Internet. Cấu hình pairing key như secret trong deployment, nhập cùng key đó để pair từng browser và không gửi key vào log/chat. Giữ nguyên `DATA_DIR` khi redeploy.

### Backup và khôi phục

- UI **Cài đặt → Tải backup JSON** xuất state hiện tại.
- Server giữ `state.json.backup` trước mỗi lần ghi.
- Trên host, sao chép toàn bộ `/srv/datalab-data`; file `auth.json` chứa hash pairing/session, không chứa secret dạng rõ.
- Khôi phục thủ công khi service dừng: kiểm tra JSON hợp lệ, thay `state.json`, rồi start lại. Không import từ UI.

## AI tutor trên laptop

Chạy một OpenAI-compatible local server trên laptop và cấu hình deployment:

```text
AI_BASE_URL=http://<IP-LAPTOP>:<PORT>
AI_MODEL=<model-id>
AI_API_KEY=<nếu backend yêu cầu>
```

Endpoint phải hỗ trợ `POST /v1/chat/completions`. Không đặt URL/model trong frontend; browser chỉ gọi HomeDroid. Chưa cấu hình thì UI báo tutor offline.

## Dữ liệu và giới hạn

- State tối đa 1.000 quiz attempts, 500 review items; note 5.000 ký tự; artifact 1.000 ký tự.
- Python code tối đa 12.000 ký tự, output giữ 20.000 ký tự cuối.
- PyTorch/GPU chạy trên laptop, không chạy trên Galaxy A21s.
- Một người dùng; tối đa 8 session browser đang pair.

Tài liệu contract: [Product](docs/PRODUCT.md), [Architecture](docs/ARCHITECTURE.md), [Curriculum](docs/CURRICULUM.md), [Implementation plan](docs/IMPLEMENTATION_PLAN.md).
