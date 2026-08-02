# 📑 NHẬT KÝ DỰ ÁN: STUDENT MANAGEMENT APP (FULLSTACK)

Dự án website quản lý sinh viên cơ bản giúp làm quen và làm chủ các công nghệ cốt lõi trong phát triển phần mềm Fullstack, đóng gói ứng dụng và triển khai thực tế trên môi trường đám mây (Cloud Deploy).

## 🛠️ Công nghệ sử dụng

- **Frontend:** ReactJS (Vite), Axios
- **Backend:** Golang (Gin Framework), Database/SQL Driver
- **Database:** MySQL
- **DevOps:** Docker, Docker Compose, Nginx (Reverse Proxy)
- **Cloud Platform:** Vercel (Frontend), Render (Backend), Aiven (Database)

---

## 📌 Phần 1: Tóm tắt các bước thực hiện

### 🔹 Bước 1: Thiết kế Cơ sở dữ liệu (Database)

- Cài đặt MySQL Server trực tiếp trên máy và quản lý bằng MySQL Workbench.
- Thiết kế bảng `users` (lưu tài khoản admin đăng nhập) và `students` (lưu mã số SV, họ tên, ngày sinh, email, giới tính để làm CRUD).
- Chèn sẵn dữ liệu tài khoản admin mẫu (`admin` / `123456`) để chạy thử nghiệm tính năng.

### 🔹 Bước 2: Xây dựng Backend (Golang)

- Khởi tạo dự án Go, cài đặt các thư viện lõi: `gin-gonic/gin` và `go-sql-driver/mysql`.
- Viết logic kết nối database và xây dựng trọn bộ 5 API chính: Login, Xem danh sách (Read), Thêm mới (Create), Cập nhật (Update), Xóa (Delete).
- Cấu hình **CORS** tại hàm `main()` để mở quyền cho phép Frontend gọi vào API mà không bị trình duyệt chặn.

### 🔹 Bước 3: Xây dựng Frontend (ReactJS)

- Khởi tạo dự án bằng công cụ **Vite**. Cài đặt thư viện `axios` để truyền tải dữ liệu.
- Xây dựng toàn bộ giao diện và logic xử lý tập trung tại file `src/App.jsx` gồm: Màn hình Đăng nhập và Màn hình Quản lý danh sách sinh viên tương tác trực tiếp.

### 🔹 Bước 4: Đóng gói hệ thống (Docker & Nginx)

- Viết `Dockerfile` cho Backend (áp dụng cơ chế build 2 giai đoạn - Multi-stage để tối ưu dung lượng file chạy).
- Viết `Dockerfile` cho Frontend (chạy môi trường nhà phát triển ở cổng `5173`).
- Viết file `docker-compose.yml` liên kết 3 dịch vụ (React, Go, MySQL Docker) chạy chung qua một lệnh duy nhất.
- Cấu hình file `nginx.conf` đứng ở cổng `80` mặc định để làm Reverse Proxy điều phối luồng: yêu cầu chứa `/api/` được đẩy qua Go, các yêu cầu còn lại được đẩy qua React.

### 🔹 Bước 5: Đưa ứng dụng lên mạng (Cloud Deploy)

- Tách biệt hạ tầng để tối ưu hóa tài nguyên miễn phí (Free Tier):
  1.  Tạo cơ sở dữ liệu MySQL đám mây trên nền tảng **Aiven.io**.
  2.  Đẩy toàn bộ mã nguồn của dự án lên **GitHub**.
  3.  Triển khai Backend Golang trên **Render.com** (Truyền chuỗi kết nối của Aiven qua biến môi trường `DB_DSN`).
  4.  Sửa đổi `API_URL` trong React hướng về domain của Render, sau đó triển khai Frontend lên **Vercel.com**.

---

## 💡 Phần 2: Bài học xương máu (Lessons Learnt)

### 1. Bài học về Quản lý Cổng mạng (Port Collision)

- **Hiện tượng:** Docker báo lỗi _“Only one usage of each socket address is normally permitted”_.
- **Bài học:** Mỗi cổng mạng tại một thời điểm chỉ cho phép duy nhất 1 ứng dụng chiếm giữ. Khi MySQL của máy thật đang chạy ngầm ở cổng `3306`, MySQL của Docker sẽ không thể bind vào cổng đó được nữa.
- **Cách khắc phục:** Tắt dịch vụ MySQL ngầm của hệ điều hành trước khi khởi chạy lệnh `docker compose up`, hoặc cấu hình đổi cổng ánh xạ bên ngoài của Docker sang cổng khác (ví dụ: `"3307:3306"`).

### 2. Bài học về Mạng nội bộ trong Docker (Docker Network)

- **Hiện tượng:** Backend chạy trong Docker không thể kết nối tới Database Docker, báo lỗi mạng.
- **Bài học:** Các container trong Docker Compose hoạt động như các máy tính độc lập. Địa chỉ `127.0.0.1` bên trong container Backend chính là bản thân nó chứ không phải máy chủ chứa database.
- **Cách khắc phục:** Thay thế địa chỉ mạng `127.0.0.1` bằng chính **tên dịch vụ (service name)** được định nghĩa trong file `docker-compose.yml` (ví dụ: đổi thành `tcp(db:3306)`).

### 3. Bài học về Chuỗi kết nối Database trong Golang

- **Hiện tượng:** Go báo lỗi mạng _“default addr for network... unknown”_ khi dùng chuỗi kết nối do Cloud cấp.
- **Bài học:** Driver `go-sql-driver/mysql` của Golang sử dụng định dạng kết nối đặc thù, không tương thích trực tiếp với chuỗi định dạng chuẩn URL thông thường của các nhà cung cấp đám mây.
- **Cách khắc phục:** Chuyển đổi định dạng chuỗi từ dạng chuẩn URL (`mysql://user:pass@host:port/db`) sang định dạng bọc giao thức mạng của Go (`user:pass@tcp(host:port)/db?options`).

### 4. Bài học về Chứng chỉ bảo mật trên Cloud (SSL/TLS X509)

- **Hiện tượng:** Render báo lỗi hệ thống _“x509: certificate signed by unknown authority”_.
- **Bài học:** Các nhà cung cấp DB đám mây bắt buộc mã hóa đường truyền dữ liệu. Hệ điều hành siêu nhẹ của môi trường chạy (Alpine Linux của Render) thiếu các file chứng nhận gốc (CA) nên từ chối kết nối vì lý do bảo mật an toàn thông tin.
- **Cách khắc phục:** Đối với môi trường thử nghiệm hoặc học tập, có thể chèn thêm tham số cấu hình **`tls=skip-verify`** vào cuối chuỗi kết nối để ép Backend bỏ qua bước kiểm tra chứng chỉ nghiêm ngặt này.

### 5. Bài học về Thay đổi Môi trường chạy (Local sang Production)

- **Hiện tượng:** Triển khai lên Vercel thành công nhưng bấm nút Đăng nhập báo lỗi thất bại.
- **Bài học:**
  - Ở môi trường Local có Nginx điều phối chung cổng, Frontend có thể gọi đường dẫn tương đối `/api`. Nhưng trên môi trường Cloud thật, Frontend và Backend nằm trên hai server độc lập, dùng đường dẫn tương đối sẽ khiến Frontend tự gọi vào chính nó.
  - Các máy chủ miễn phí trên Render áp dụng cơ chế **Ngủ đông (Cold Start)** sau 15 phút không có lượt truy cập. Lần gọi API đầu tiên cần đợi từ 30 giây đến 1 phút để máy chủ khởi động lại.
- **Cách khắc phục:** Luôn cập nhật `API_URL` của Frontend sang **đường dẫn tuyệt đối** trỏ thẳng đến domain công khai của Render (`https://onrender.com`). Khi xảy her lỗi, sử dụng công cụ nhà phát triển (**F12 -> tab Console**) để kiểm tra chính xác mã lỗi (CORS, 401 hay 502) để có hướng xử lý phù hợp.
