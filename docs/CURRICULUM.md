# Chương trình học 9 tháng

## Nhịp chuẩn

Mỗi tuần 3 giờ:

- 45 phút đọc và ghi chú khái niệm.
- 45 phút làm ví dụ/quiz.
- 90 phút tạo artifact hoặc làm dự án.

36 tuần học dùng 108 giờ. Tuần 37–39 dành cho học bù, đánh giá tổng và demo dự án. Nội dung trong app phải đủ để học; nguồn ngoài chỉ nằm ở mục tham khảo tùy chọn.

## Tháng 1 — Python và công cụ

| Tuần | Chủ đề | Artifact |
|---:|---|---|
| 1 | Kiểu dữ liệu, biến, biểu thức, input/output | Script tính thống kê đơn giản |
| 2 | Điều kiện, vòng lặp, function | Bộ hàm xử lý danh sách số |
| 3 | List, dict, set, file và exception | Script đọc CSV nhỏ và báo lỗi rõ |
| 4 | Git, môi trường Python, Jupyter và debugging | Repository nền tảng có README và notebook |

**Gate:** viết được function, đọc file, xử lý lỗi và chạy project từ README.

## Tháng 2 — Làm việc với dữ liệu

| Tuần | Chủ đề | Artifact |
|---:|---|---|
| 5 | NumPy array, shape, indexing, vectorization | Notebook biến đổi ma trận |
| 6 | pandas DataFrame, lọc, group, join | Báo cáo dữ liệu bảng |
| 7 | Missing data, duplicate, kiểu dữ liệu và outlier | Pipeline làm sạch có log quyết định |
| 8 | SQL SELECT, WHERE, GROUP BY, JOIN | Bộ truy vấn trả lời câu hỏi nghiệp vụ |

**Gate:** tạo EDA có dữ liệu sạch, bảng tóm tắt và ba kết luận có bằng chứng.

## Tháng 3 — Toán và thống kê cho ML

| Tuần | Chủ đề | Artifact |
|---:|---|---|
| 9 | Mean, median, variance, distribution và sampling | Notebook mô phỏng sampling |
| 10 | Probability, conditional probability và Bayes trực quan | Bài giải có mô phỏng kiểm chứng |
| 11 | Vector, matrix, dot product và matrix multiplication | Cài đặt phép toán bằng NumPy |
| 12 | Derivative, gradient, loss và gradient descent | Linear regression từ đầu |

**Gate:** giải thích được loss giảm vì sao và kiểm tra gradient bằng số.

## Tháng 4 — Machine Learning cổ điển

| Tuần | Chủ đề | Artifact |
|---:|---|---|
| 13 | Problem framing, baseline, train/validation/test | Baseline có metric phù hợp |
| 14 | Linear/logistic regression và classification metrics | Confusion matrix và error analysis |
| 15 | Tree model, preprocessing và sklearn Pipeline | Pipeline không leakage |
| 16 | Cross-validation, tuning và model comparison | Bảng so sánh tối thiểu ba cấu hình |

**Gate:** chọn model dựa trên validation, chỉ dùng test một lần và nêu failure modes.

## Tháng 5 — Deep Learning với PyTorch

| Tuần | Chủ đề | Artifact |
|---:|---|---|
| 17 | Tensor, device, Dataset và DataLoader | Data pipeline chạy CPU/GPU |
| 18 | Layer, activation, forward pass và loss | MLP cho FashionMNIST |
| 19 | Autograd, optimizer và training loop | Training loop có validation |
| 20 | Save/load, inference và reproducibility | Checkpoint và script inference |

**Gate:** tải checkpoint ở process mới và tái tạo metric trong sai số chấp nhận được.

## Tháng 6 — Thực nghiệm Deep Learning

| Tuần | Chủ đề | Artifact |
|---:|---|---|
| 21 | Overfit một batch và debug training | Checklist chẩn đoán model không học |
| 22 | Regularization, dropout và weight decay | So sánh train/validation curves |
| 23 | Learning rate, batch size và experiment log | Ba run có seed và config |
| 24 | Error analysis, model card và ethics | Model card cùng failure analysis |

**Gate:** một báo cáo phân biệt quan sát, kết luận và giả thuyết tiếp theo.

## Tháng 7 — NLP và Transformer

| Tuần | Chủ đề | Artifact |
|---:|---|---|
| 25 | Text normalization, tokenization và vocabulary | Trình quan sát token |
| 26 | Embeddings, similarity và semantic search | Search trên tập văn bản nhỏ |
| 27 | Attention và Transformer blocks | Giải thích shape qua một forward pass |
| 28 | Pretrained model và fine-tune classifier | Classifier tiếng Việt có baseline |

**Gate:** so sánh pretrained model với baseline đơn giản trên cùng split.

## Tháng 8 — LLM và RAG

| Tuần | Chủ đề | Artifact |
|---:|---|---|
| 29 | Prompt, context, hallucination và structured output | Bộ test prompt cố định |
| 30 | Chunking, embedding và retrieval | Retriever kèm recall trên câu hỏi test |
| 31 | Generation với citation và refusal | RAG trả lời kèm đoạn nguồn |
| 32 | Evaluation retrieval/generation và failure taxonomy | 20–30 câu hỏi khóa trước tối ưu |

**Gate:** đánh giá retrieval riêng với generation và ghi rõ câu thất bại.

## Tháng 9 — Sản phẩm và nghiên cứu

| Tuần | Chủ đề | Artifact |
|---:|---|---|
| 33 | API, UI, validation và threat boundaries | Vertical slice chạy end-to-end |
| 34 | Logging, latency, model/data version và privacy | Báo cáo benchmark |
| 35 | Đọc paper: problem, hypothesis, method, evidence, limits | One-page paper review |
| 36 | Hoàn thiện Research Assistant/RAG | Demo, README và technical report |

**Gate:** người khác làm theo README có thể chạy demo; báo cáo chứa baseline, bảng kết quả và giới hạn.

## Tuần 37–39

- Tuần 37: hoàn thành bài thiếu và ôn review queue.
- Tuần 38: assessment tổng; sửa lỗ hổng theo kết quả.
- Tuần 39: demo dự án, retrospective và kế hoạch 6 tháng tiếp theo.

## Mẫu một bài học

Mỗi lesson phải có đúng các phần:

1. **Mục tiêu:** 2–4 kết quả quan sát được.
2. **Điều kiện trước:** lesson ID cần biết.
3. **Khái niệm:** nội dung ngắn, ví dụ cụ thể.
4. **Worked example:** code hoặc phép tính có giải thích.
5. **Thực hành:** starter và output mong đợi, không đưa sẵn lời giải trong màn hình chính.
6. **Quiz:** 5–8 câu, mỗi đáp án có giải thích.
7. **Artifact:** bằng chứng cần tạo.
8. **Tiêu chí hoàn thành:** checklist và ngưỡng quiz.
9. **Ôn tập:** 3–5 flashcard.
10. **Tham khảo tùy chọn:** nguồn gốc nội dung; không bắt buộc mở để hoàn thành bài.

## Quy tắc nội dung

- Không dạy API chưa dùng trong artifact của tuần.
- Mỗi thuật ngữ tiếng Anh xuất hiện lần đầu phải có giải thích tiếng Việt.
- Code phải chạy bằng version dependency được khóa trong repository thực hành.
- Quiz kiểm tra cách áp dụng và lỗi thường gặp, không chỉ nhớ định nghĩa.
- Không tuyên bố model “tốt” nếu thiếu baseline, metric và test data độc lập.
- Nội dung trích dẫn phải ghi nguồn và license; ưu tiên diễn giải thay vì sao chép.
