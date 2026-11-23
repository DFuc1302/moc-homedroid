# AI Learning App — Product specification

## Mục tiêu

Một learning app tiếng Việt chạy tại một địa chỉ HomeDroid duy nhất, giúp một người mới học Data Science, Deep Learning và LLM trong 9 tháng với nhịp 3 giờ/tuần. Toàn bộ bài học, quiz và công cụ theo dõi nằm trong app; người học không phải mở website tài liệu khác.

## Người dùng và thiết bị mục tiêu

- Một người dùng chính.
- Host: Samsung SM-A217F (Galaxy A21s), Android 12, Exynos 850, khoảng 3 GB RAM, HomeDroid.
- Thiết bị học: trình duyệt trên điện thoại hoặc laptop trong cùng LAN.
- Máy thực hành: laptop có NVIDIA RTX 4070 Laptop GPU, 8 GB VRAM.
- Ngôn ngữ giao diện và nội dung: tiếng Việt; giữ thuật ngữ tiếng Anh quan trọng trong ngoặc.

## Kết quả cần đạt

Sau khi hoàn thành, người học có thể:

1. Dùng Python, NumPy, pandas và SQL để phân tích dữ liệu.
2. Huấn luyện và đánh giá mô hình Machine Learning có baseline, split và metric đúng.
3. Xây, lưu và chạy mô hình PyTorch cơ bản.
4. Giải thích tokenization, embeddings, attention và Transformer.
5. Xây một ứng dụng RAG nhỏ có citation và bộ câu hỏi đánh giá.
6. Trình bày dự án bằng README, báo cáo thí nghiệm và failure analysis.

## Phạm vi phiên bản đầu

### Khóa học

- 9 module, 36 tuần học và 3 tuần đệm/đánh giá.
- Mỗi tuần có mục tiêu, bài đọc trong app, ví dụ, bài thực hành, quiz và tiêu chí hoàn thành.
- Nội dung cốt lõi được đóng gói cùng app, không phụ thuộc CDN hoặc website bên ngoài khi học.

### Học và ôn tập

- Dashboard phần trăm hoàn thành và tuần hiện tại.
- Checklist theo bài học.
- Quiz có giải thích đáp án.
- Flashcard và danh sách câu trả lời sai để ôn lại.
- Ghi chú cá nhân theo bài học.
- Streak dựa trên ngày có hoạt động học hợp lệ, không thưởng chỉ vì mở app.

### Thực hành

- Python runner trong trình duyệt cho Python, NumPy và bài tập dữ liệu nhỏ.
- Runner bị giới hạn thời gian; có thể dừng và khởi tạo lại.
- PyTorch, fine-tuning và bài dùng GPU chạy trên laptop theo lệnh được app cung cấp.
- Repository bài thực hành đi kèm phải chạy lại được, không yêu cầu sao chép từ website khác.

### AI tutor

- Chat nằm trong từng bài học và nhận ngữ cảnh của bài đó.
- Model chạy trên laptop; HomeDroid chỉ proxy request.
- Khi laptop hoặc model offline, app báo rõ trạng thái và phần học còn lại vẫn hoạt động.
- Không dùng API cloud mặc định và không gửi nội dung học/ghi chú ra Internet.

### Đồng bộ

- Tiến độ, quiz, flashcard và ghi chú lưu trên HomeDroid.
- Điện thoại và laptop nhìn thấy cùng trạng thái sau khi xác thực.
- Dữ liệu tồn tại qua redeploy và có file backup có thể sao chép.

## Luồng chính

1. Người dùng mở app và nhập pairing key lần đầu.
2. Dashboard hiển thị bài tiếp theo và tiến độ.
3. Người dùng đọc bài, chạy ví dụ hoặc làm bài trên laptop.
4. Người dùng hoàn thành quiz; app giải thích câu sai và tạo mục ôn tập.
5. App chỉ đánh dấu hoàn thành khi checklist bắt buộc và quiz đạt ngưỡng.
6. Nếu cần, người dùng hỏi AI tutor ngay trong bài.
7. Trạng thái được đồng bộ qua HomeDroid.

## Quy tắc hoàn thành

- Bài lý thuyết: hoàn thành checklist và quiz đạt ít nhất 70%.
- Bài thực hành: người dùng xác nhận artifact theo yêu cầu; app lưu mô tả hoặc đường dẫn repository.
- Module: tất cả bài bắt buộc hoàn thành và assessment cuối module đạt ít nhất 70%.
- Không khóa cứng bài sau; cảnh báo prerequisite nhưng cho phép học lại hoặc xem trước.

## Phi chức năng

- Giao diện responsive, dùng được ở chiều rộng 360 px.
- Nội dung học vẫn đọc được khi AI tutor offline.
- Tải dashboard và bài học không khởi động Python runtime hoặc gọi AI.
- Không tải model LLM lên điện thoại.
- Mọi endpoint dữ liệu, file và AI đều yêu cầu xác thực.
- Không ghi pairing key, prompt riêng tư hoặc ghi chú vào log.
- Giới hạn kích thước body và độ dài prompt.
- Trạng thái được ghi nguyên tử để mất điện không tạo file JSON dở.

## Ngoài phạm vi

- Nhiều tài khoản, lớp học, bảng xếp hạng hoặc mạng xã hội.
- Chứng chỉ chính thức.
- Chạy PyTorch/GPU hoặc LLM trực tiếp trên Galaxy A21s.
- Cloud sync và public Internet deployment.
- Tự động chấm tính đúng của notebook PyTorch.
- Trình soạn thảo notebook đầy đủ trong trình duyệt.
- CMS cho biên tập viên; nội dung được quản lý bằng file trong repository.

## Chỉ số thành công

- Hoàn thành ít nhất 30/36 tuần và dự án cuối.
- Mỗi module có ít nhất một artifact kiểm chứng được.
- Dữ liệu tiến độ còn nguyên sau redeploy thử nghiệm.
- Hai trình duyệt đã pair nhìn thấy cùng trạng thái.
- App vẫn sử dụng được khi laptop AI tắt.
