# Mộc

Một đồng hồ Pomodoro và danh sách việc cần làm bằng tiếng Việt. Chạy hoàn toàn trong trình duyệt, không tài khoản, không dịch vụ ngoài, không dependency.

## Tính năng

- Đồng hồ tập trung 25 phút, nghỉ ngắn 5 phút, nghỉ dài 15 phút.
- Tự chuyển sang nghỉ dài sau mỗi 4 phiên tập trung.
- Việc cần làm, phiên hoàn thành, giao diện sáng/tối được lưu trong `localStorage`.
- Responsive; dùng được trên điện thoại và máy tính.

## Chạy thử

Vì app dùng ES module, hãy phục vụ thư mục qua HTTP:

```bash
python -m http.server 4173
```

Mở `http://localhost:4173`. Kiểm tra logic timer:

```bash
node timer.test.mjs
```

## Deploy bằng HomeDroid

HomeDroid deploy từ Git repository. Đẩy thư mục này lên một repository GitHub, sau đó mở **Dashboard → Deployments → New deployment** và nhập:

| Trường | Giá trị |
| --- | --- |
| Repository | URL HTTPS của repository |
| Branch | `main` |
| Port | `4173` (hoặc một cổng trống từ 1024–65535) |
| Runtime | `Static` hoặc `Auto` |
| Build command | để trống |
| Start command | để trống |

HomeDroid sẽ nhận diện project là static site và phục vụ trực tiếp bằng Caddy. Truy cập tại `http://<IP-điện-thoại>:4173`.

> Dữ liệu nằm trong `localStorage` của từng trình duyệt, vì vậy không đồng bộ giữa các thiết bị.
