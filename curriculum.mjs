export const COURSE_VERSION = "2026.11.23";

const weeks = [
  [1,"Nền tảng Python","Kiểu dữ liệu, biến và biểu thức","Script tính thống kê đơn giản","Dùng biến có tên rõ nghĩa và phân biệt số, chuỗi, boolean trước khi kết hợp biểu thức.","values = [7, 8, 10, 5]\nprint(sum(values) / len(values))","Giá trị trung bình là 7.5."],
  [1,"Nền tảng Python","Điều kiện, vòng lặp và hàm","Bộ hàm xử lý danh sách số","Tách logic lặp lại thành hàm; dùng điều kiện để mô tả nhánh và vòng lặp để xử lý từng phần tử.","def positives(xs):\n    return [x for x in xs if x > 0]\nprint(positives([-2, 0, 3, 5]))","Kết quả là [3, 5]."],
  [1,"Nền tảng Python","Cấu trúc dữ liệu, file và exception","Script đọc CSV nhỏ và báo lỗi rõ","List giữ thứ tự, dict ánh xạ khóa; bắt exception cụ thể tại nơi có thể phục hồi hoặc bổ sung ngữ cảnh.","row = {'name': 'Lan', 'score': 9}\nprint(row.get('score', 0))","get tránh KeyError và trả về 9."],
  [1,"Nền tảng Python","Git, môi trường, Jupyter và debugging","Repository nền tảng có README và notebook","Môi trường khóa dependency; Git lưu lịch sử; debugger kiểm tra trạng thái thay vì đoán nguyên nhân.","python -m venv .venv\n# Kích hoạt môi trường rồi cài dependency đã khóa","Repository có README mô tả cách chạy từ môi trường sạch."],
  [2,"Làm việc với dữ liệu","NumPy array và vectorization","Notebook biến đổi ma trận","Array có shape và dtype; vectorization diễn đạt phép toán trên toàn mảng, tránh vòng lặp Python không cần thiết.","import numpy as np\na = np.array([[1, 2], [3, 4]])\nprint(a.mean(axis=0))","Trung bình theo cột là [2., 3.]."],
  [2,"Làm việc với dữ liệu","pandas: lọc, group và join","Báo cáo dữ liệu bảng","DataFrame biểu diễn bảng; groupby tổng hợp theo nhóm và merge nối bảng bằng khóa có ý nghĩa.","import pandas as pd\ndf = pd.DataFrame({'team':['A','A','B'],'score':[2,4,5]})\nprint(df.groupby('team').score.mean())","A có trung bình 3, B có trung bình 5."],
  [2,"Làm việc với dữ liệu","Làm sạch dữ liệu","Pipeline làm sạch có log quyết định","Phân biệt missing, duplicate, kiểu sai và outlier; mỗi quyết định làm sạch phải truy vết được.","clean = df.drop_duplicates().dropna(subset=['target'])","Không xóa hàng chỉ vì tiện; quy tắc phụ thuộc mục tiêu phân tích."],
  [2,"Làm việc với dữ liệu","SQL truy vấn dữ liệu","Bộ truy vấn trả lời câu hỏi nghiệp vụ","SELECT chọn cột, WHERE lọc hàng, GROUP BY tổng hợp và JOIN kết hợp bảng theo khóa.","SELECT team, AVG(score) AS avg_score\nFROM results GROUP BY team;","Một hàng kết quả cho mỗi team."],
  [3,"Toán và thống kê","Thống kê mô tả và sampling","Notebook mô phỏng sampling","Mean nhạy với outlier, median bền hơn; phân phối mẫu cho biết độ biến thiên của ước lượng.","samples = np.random.default_rng(7).normal(size=(1000, 30))\nprint(samples.mean(axis=1).std())","Trung bình mẫu dao động ít hơn từng quan sát."],
  [3,"Toán và thống kê","Xác suất và Bayes trực quan","Bài giải có mô phỏng kiểm chứng","Xác suất có điều kiện cập nhật niềm tin khi có bằng chứng; base rate luôn ảnh hưởng kết luận.","P(A|B) = P(B|A) * P(A) / P(B)","Không đảo P(A|B) thành P(B|A)."],
  [3,"Toán và thống kê","Vector, matrix và dot product","Cài đặt phép toán bằng NumPy","Vector có hướng và độ lớn; dot product đo mức thẳng hàng và matrix multiplication kết hợp biến đổi tuyến tính.","x = np.array([1, 2]); w = np.array([3, 4])\nprint(x @ w)","Dot product bằng 11."],
  [3,"Toán và thống kê","Đạo hàm, gradient và gradient descent","Linear regression từ đầu","Gradient chỉ hướng tăng nhanh nhất của loss; trừ learning-rate nhân gradient để giảm loss.","w -= learning_rate * gradient","Kiểm tra gradient giải tích bằng sai phân hữu hạn."],
  [4,"Machine Learning","Problem framing và data split","Baseline có metric phù hợp","Xác định đầu vào, target, đơn vị dự đoán và chi phí lỗi trước khi chọn model; giữ test độc lập.","train, validation, test = 0.7, 0.15, 0.15","Baseline đơn giản tạo mốc để chứng minh model hữu ích."],
  [4,"Machine Learning","Regression, classification và metrics","Confusion matrix và error analysis","Metric phải phản ánh chi phí: precision hạn chế false positive, recall hạn chế false negative.","precision = TP / (TP + FP)\nrecall = TP / (TP + FN)","Không dùng accuracy đơn độc cho lớp mất cân bằng."],
  [4,"Machine Learning","Tree model và preprocessing pipeline","Pipeline không leakage","Fit preprocessing chỉ trên train; Pipeline buộc cùng phép biến đổi khi validation và inference.","Pipeline([('scale', StandardScaler()), ('model', LogisticRegression())])","Không tính mean/std từ toàn bộ dữ liệu."],
  [4,"Machine Learning","Cross-validation và tuning","Bảng so sánh ba cấu hình","Cross-validation ước lượng ổn định hơn trên train; tuning chọn bằng validation, không nhìn test.","for depth in [2, 5, 10]:\n    # ghi mean và std CV","Chỉ đánh giá test một lần sau khi khóa cấu hình."],
  [5,"Deep Learning với PyTorch","Tensor, device, Dataset và DataLoader","Data pipeline chạy CPU/GPU","Tensor mang shape, dtype, device; Dataset định nghĩa mẫu và DataLoader tạo batch.","x = x.to(device); y = y.to(device)","Model và dữ liệu phải ở cùng device."],
  [5,"Deep Learning với PyTorch","Layer, activation và loss","MLP cho FashionMNIST","Layer affine học trọng số; activation tạo phi tuyến; loss biến sai số thành mục tiêu tối ưu.","model = nn.Sequential(nn.Flatten(), nn.Linear(784,128), nn.ReLU(), nn.Linear(128,10))","Đầu ra có 10 logits, chưa softmax khi dùng CrossEntropyLoss."],
  [5,"Deep Learning với PyTorch","Autograd và training loop","Training loop có validation","Mỗi bước: zero_grad, forward, loss, backward, optimizer.step; validation không cập nhật gradient.","optimizer.zero_grad(); loss.backward(); optimizer.step()","Dùng model.eval() và torch.no_grad() khi validation."],
  [5,"Deep Learning với PyTorch","Checkpoint, inference và reproducibility","Checkpoint và script inference","Lưu state_dict và config; cố định seed, version và preprocessing để tái tạo kết quả.","torch.save({'model': model.state_dict(), 'config': config}, path)","Tải checkpoint trong process mới để kiểm tra tính đầy đủ."],
  [6,"Thực nghiệm Deep Learning","Overfit một batch và debug","Checklist chẩn đoán model không học","Nếu model không overfit nổi một batch nhỏ, lỗi thường nằm ở data, loss, gradient hoặc capacity.","# train lặp một batch cho tới loss gần 0","Kiểm tra label, shape, gradient norm và learning rate theo thứ tự."],
  [6,"Thực nghiệm Deep Learning","Regularization","So sánh train/validation curves","Dropout và weight decay hạn chế overfit nhưng không sửa data leakage hoặc split sai.","optimizer = AdamW(model.parameters(), weight_decay=1e-4)","So sánh bằng validation curve, không chỉ training loss."],
  [6,"Thực nghiệm Deep Learning","Learning rate, batch và experiment log","Ba run có seed và config","Thay một yếu tố mỗi lần; lưu config, seed, metric, thời gian và version code cho mọi run.","run = {'lr': 3e-4, 'batch': 64, 'seed': 7}","Experiment không có metadata thì khó tái tạo và so sánh."],
  [6,"Thực nghiệm Deep Learning","Error analysis, model card và ethics","Model card cùng failure analysis","Phân nhóm lỗi theo pattern; model card ghi use case, data, metric, giới hạn và rủi ro.","failure_rate_by_group = errors.groupby('group').mean()","Tách quan sát, kết luận và giả thuyết thử tiếp."],
  [7,"NLP và Transformer","Normalization, tokenization và vocabulary","Trình quan sát token","Tokenizer ánh xạ văn bản thành token ID; normalization có thể mất thông tin nên phải phù hợp ngôn ngữ.","tokens = tokenizer.encode('Học máy thật thú vị')","Token không đồng nhất với từ hoặc ký tự."],
  [7,"NLP và Transformer","Embeddings và semantic search","Search trên tập văn bản nhỏ","Embedding ánh xạ đối tượng vào vector; cosine similarity so hướng để xếp hạng ngữ nghĩa.","similarity = (a @ b) / (norm(a) * norm(b))","Đánh giá search bằng tập query và đáp án liên quan cố định."],
  [7,"NLP và Transformer","Attention và Transformer blocks","Giải thích shape qua forward pass","Attention dùng query, key, value; trọng số softmax chọn thông tin liên quan cho từng vị trí.","Attention(Q,K,V) = softmax(QKᵀ / sqrt(d))V","Theo dõi batch, sequence và hidden dimension ở mỗi bước."],
  [7,"NLP và Transformer","Pretrained model và fine-tuning","Classifier tiếng Việt có baseline","Fine-tuning cập nhật model pretrained cho task; baseline đơn giản cho biết chi phí thêm có đáng không.","# cùng split, metric và preprocessing cho baseline và transformer","Không kết luận bằng hai test set khác nhau."],
  [8,"LLM và RAG","Prompt, context và hallucination","Bộ test prompt cố định","LLM dự đoán token, không phải cơ sở dữ liệu; structured output cần schema validation và retry có giới hạn.","tests = [{'input':'...', 'must_include':['...']} ]","Đóng băng test trước tối ưu để tránh tự chấm theo ví dụ thuận lợi."],
  [8,"LLM và RAG","Chunking, embedding và retrieval","Retriever kèm recall trên câu hỏi test","Chunk giữ đủ ngữ cảnh nhưng không quá dài; đánh giá retrieval riêng bằng recall@k.","recall_at_k = found_relevant / total_relevant","Tuning retriever trước khi đổ lỗi cho generator."],
  [8,"LLM và RAG","Generation có citation và refusal","RAG trả lời kèm đoạn nguồn","Generator chỉ dùng đoạn được retrieval; citation phải trỏ đúng chunk hỗ trợ mệnh đề.","Nếu nguồn không đủ: trả lời 'Không đủ dữ kiện'","Refusal đúng tốt hơn câu trả lời tự tin nhưng không có nguồn."],
  [8,"LLM và RAG","Evaluation và failure taxonomy","20–30 câu hỏi khóa trước tối ưu","Tách lỗi retrieval, context, reasoning, citation và refusal để chọn đúng can thiệp.","failure = {'retrieval': 3, 'citation': 2, 'unsupported': 1}","Không dùng một điểm tổng che khuất loại lỗi."],
  [9,"Sản phẩm và nghiên cứu","API, UI và threat boundaries","Vertical slice chạy end-to-end","Xác định trust boundary, validate đầu vào tại server và trả lỗi ổn định; UI không thay thế authorization.","request → validate → authorize → mutate → respond","Vertical slice chứng minh luồng thật trước khi mở rộng."],
  [9,"Sản phẩm và nghiên cứu","Observability, latency và privacy","Báo cáo benchmark","Đo p50/p95, version model/data và tài nguyên; log metadata cần thiết nhưng không ghi secret hay dữ liệu riêng.","result = {'p50_ms': 120, 'p95_ms': 310, 'model': 'v1'}","Benchmark ghi rõ hardware, workload và warm-up."],
  [9,"Sản phẩm và nghiên cứu","Đọc paper có hệ thống","One-page paper review","Tách problem, hypothesis, method, evidence và limits; kết luận không vượt quá thiết kế thí nghiệm.","review = ['Problem','Hypothesis','Method','Evidence','Limits']","Đọc figure và protocol trước khi tin abstract."],
  [9,"Sản phẩm và nghiên cứu","Hoàn thiện Research Assistant RAG","Demo, README và technical report","Sản phẩm cuối cần baseline, evaluation khóa trước, citation, failure analysis và hướng dẫn tái tạo.","git clone ...\n# làm đúng README để chạy demo từ môi trường sạch","Người khác phải tái tạo demo và hiểu giới hạn mà không cần tác giả hướng dẫn trực tiếp."]
];

const ids = weeks.map((_, index) => `m${String(Math.floor(index / 4) + 1).padStart(2,"0")}-w${String(index + 1).padStart(2,"0")}`);

export const course = {
  version: COURSE_VERSION,
  title: "DataLab — Data Science & Deep Learning",
  modules: Array.from({ length: 9 }, (_, moduleIndex) => {
    const moduleWeeks = weeks.slice(moduleIndex * 4, moduleIndex * 4 + 4);
    return {
      id: `m${String(moduleIndex + 1).padStart(2,"0")}`,
      title: moduleWeeks[0][1],
      description: `Bốn tuần xây nền tảng ${moduleWeeks.map((w) => w[2].toLowerCase()).join(", ")}.`,
      lessons: moduleWeeks.map((row, offset) => {
        const globalIndex = moduleIndex * 4 + offset;
        const id = ids[globalIndex];
        const [month,, title, artifact, concept, code, result] = row;
        return {
          id, week: globalIndex + 1, month, title,
          prerequisite: globalIndex ? ids[globalIndex - 1] : null,
          objectives: [
            `Giải thích ${title.toLowerCase()} bằng ví dụ cụ thể.`,
            `Áp dụng khái niệm để tạo ${artifact.toLowerCase()}.`,
            "Nhận diện một lỗi triển khai thường gặp và kiểm chứng bằng dữ liệu."
          ],
          concept,
          example: { code, explanation: result },
          practice: `Tạo ${artifact.toLowerCase()}. Bắt đầu với dữ liệu nhỏ, chạy từ môi trường sạch và ghi lại đầu vào, đầu ra cùng quyết định quan trọng.`,
          expected: `Artifact chạy lại được, có README ngắn và bằng chứng cho kết luận chính.`,
          artifact,
          criteria: ["Đọc và tự diễn giải khái niệm", "Chạy hoặc phân tích worked example", "Hoàn thành artifact và lưu mô tả/đường dẫn"],
          flashcards: [
            { front: `Mục đích chính của ${title}?`, back: concept },
            { front: "Bằng chứng hoàn thành tuần này là gì?", back: artifact },
            { front: "Quy tắc kiểm chứng quan trọng?", back: result }
          ],
          quiz: makeQuiz(id, title, artifact, concept, result),
          references: ["Nội dung được biên soạn theo Python, NumPy, pandas, scikit-learn và PyTorch documentation; tài liệu ngoài chỉ để đọc thêm."]
        };
      })
    };
  })
};

function makeQuiz(id, title, artifact, concept, result) {
  const questions = [
    ["Bước nào nên làm trước khi tối ưu?", "Xác định mục tiêu và tạo baseline có thể kiểm chứng", ["Tăng độ phức tạp ngay", "Chọn kết quả đẹp nhất", "Bỏ qua dữ liệu lỗi"], "Baseline và mục tiêu tạo mốc so sánh khách quan."],
    [`Artifact bắt buộc của bài ${title} là gì?`, artifact, ["Chỉ đọc khái niệm", "Một ảnh chụp không có mã nguồn", "Không cần lưu kết quả"], `Artifact đã quy định: ${artifact}.`],
    ["Cách nào giúp kết quả tái tạo được?", "Lưu code, dữ liệu/config và hướng dẫn chạy", ["Chỉ ghi điểm cuối", "Thay nhiều yếu tố cùng lúc", "Chạy lại cho tới khi đẹp"], "Code, input/config và README là chuỗi bằng chứng tối thiểu."],
    ["Khi kết quả trái kỳ vọng, hành động tốt nhất là gì?", "Kiểm tra giả định bằng ví dụ nhỏ và ghi lại quan sát", ["Ẩn kết quả", "Đổi metric sau khi xem test", "Kết luận model sai ngay"], "Ví dụ nhỏ cô lập nguyên nhân; quan sát phải tách khỏi suy đoán."],
    ["Phát biểu nào phù hợp nhất với bài học?", result, ["Metric cao luôn đủ để triển khai", "Dữ liệu test dùng để tuning", "Không cần nêu giới hạn"], concept]
  ];
  return questions.map((q, index) => {
    const correct = q[1];
    const options = [correct, ...q[2]];
    const rotation = (index + id.length) % options.length;
    const rotated = options.slice(rotation).concat(options.slice(0, rotation));
    return { id: `${id}-q${index + 1}`, prompt: q[0], options: rotated, answer: rotated.indexOf(correct), explanation: q[3] };
  });
}

export function validateCourse(value = course) {
  const errors = [];
  const lessonIds = new Set();
  if (value.modules.length !== 9) errors.push("Course must have 9 modules");
  for (const module of value.modules) {
    if (module.lessons.length !== 4) errors.push(`${module.id} must have 4 lessons`);
    for (const lesson of module.lessons) {
      if (lessonIds.has(lesson.id)) errors.push(`Duplicate lesson ${lesson.id}`);
      lessonIds.add(lesson.id);
      if (lesson.quiz.length < 5 || lesson.quiz.length > 8) errors.push(`${lesson.id} quiz must have 5-8 questions`);
      if (lesson.flashcards.length < 3) errors.push(`${lesson.id} needs flashcards`);
      for (const question of lesson.quiz) if (!Number.isInteger(question.answer) || !question.options[question.answer]) errors.push(`${question.id} has invalid answer`);
    }
  }
  for (const lesson of value.modules.flatMap((module) => module.lessons)) if (lesson.prerequisite && !lessonIds.has(lesson.prerequisite)) errors.push(`${lesson.id} prerequisite missing`);
  if (lessonIds.size !== 36) errors.push("Course must have 36 lessons");
  return errors;
}
