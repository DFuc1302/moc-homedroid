# AI Learning App

Ứng dụng tự học Data Science, Deep Learning và LLM bằng tiếng Việt trong 9 tháng, theo nhịp 3 giờ mỗi tuần. App sẽ chạy trên HomeDroid, đồng bộ tiến độ giữa điện thoại và laptop, có Python runner cơ bản và AI tutor chạy bằng GPU laptop.

## Trạng thái

Giai đoạn đặc tả trước khi build. Source hiện tại vẫn là prototype Pomodoro cũ và chưa thể hiện sản phẩm mới.

## Tài liệu dự án

Đọc theo thứ tự:

1. [Product specification](docs/PRODUCT.md) — mục tiêu, phạm vi, luồng học và tiêu chí thành công.
2. [Architecture](docs/ARCHITECTURE.md) — frontend, HomeDroid backend, dữ liệu, bảo mật, Python runner và AI tutor.
3. [Curriculum](docs/CURRICULUM.md) — chương trình 9 tháng, 36 tuần học và 3 tuần đánh giá.
4. [Implementation plan](docs/IMPLEMENTATION_PLAN.md) — thứ tự build và tiêu chí nghiệm thu từng giai đoạn.

Các tài liệu trên là contract cho quá trình triển khai. Thay đổi phạm vi phải cập nhật tài liệu liên quan trước hoặc cùng lúc với code.

## Thiết bị mục tiêu đã xác minh

- Host: Samsung Galaxy A21s `SM-A217F`, Android 12, ARM64, khoảng 3 GB RAM, HomeDroid.
- Máy thực hành/AI: NVIDIA GeForce RTX 4070 Laptop GPU, 8 GB VRAM.
- Mạng: triển khai LAN; không public app ra Internet trong phiên bản đầu.

## Quyết định kỹ thuật chính

- Một Node.js service trên HomeDroid phục vụ frontend và API.
- Nội dung khóa học được bundle cùng app.
- State persistent nằm ngoài Git checkout.
- Python cơ bản chạy trong Web Worker; PyTorch chạy trên laptop.
- AI tutor chạy trên laptop và báo offline rõ ràng khi laptop không sẵn sàng.
- Một người dùng, xác thực bằng pairing; chưa xây account system hoặc cloud sync.

## Bước tiếp theo

Bắt đầu Giai đoạn 1 trong [Implementation plan](docs/IMPLEMENTATION_PLAN.md): app shell, content schema và toàn bộ module Tháng 1.
