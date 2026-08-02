package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

var db *sql.DB

//Struct Student
type Student struct {
	ID        	int    `json:"id"`
	StudentCode string `json:"student_code"`
	FullName    string `json:"full_name"`
	DateOfBirth string `json:"date_of_birth"` // Định dạng YYYY-MM-DD
	Email       string `json:"email"`
	Gender      string `json:"gender"`
}

//Struct LoginCredentials
type LoginCredentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func initDB() {
	var err error

	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "root:@Nguyenxuan123@tcp(127.0.0.1:3306)/student_management?parseTime=true"
	}
	
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Lỗi cấu hình Database:", err)
	}

	// Thử ping xem có thông tới MySQL thật không
	err = db.Ping()
	if err != nil {
		log.Fatal("Không thể kết nối tới MySQL:", err)
	}

	fmt.Println("🎉 Kết nối MySQL thành công!")
}

func main() {
	// 1. Kết nối database đầu tiên khi chạy ứng dụng
	initDB()
	defer db.Close()

	// 2. Khởi tạo router của Gin Framework
	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)	
			return
		}
		c.Next()
	})

	//api dang nhap
	r.POST("/api/login", login)

	//nhom cac api quan ly sinh vien
	r.GET("/api/students", getStudents) //lay danh sach
	r.POST("/api/students", createStudent) //them moi
	r.PUT("/api/students/:id", updateStudent) //sua theo id
	r.DELETE("/api/students/:id", deleteStudent) //xoa theo id

	// 3. Viết một API test thử xem server chạy chưa
	// r.GET("/ping", func(c *gin.Context) {
	// 	c.JSON(http.StatusOK, gin.H{
	// 		"message": "Backend Golang đang chạy ngon lành!",
	// 	})
	// })

	// 4. Chạy server ở port 8080
	fmt.Println("🚀 Backend CRUD đang chạy tại http://localhost:8080")
	r.Run(":8080")
}

// ----------------- 1. LẤY DANH SÁCH SINH VIÊN (READ) -----------------
func getStudents(c *gin.Context) {
	rows, err := db.Query("SELECT id, student_code, full_name, date_of_birth, email, gender FROM students")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi truy vấn dữ liệu"})
		return
	}
	defer rows.Close()

	var students []Student
	for rows.Next() {
		var s Student
		var dob []uint8 //mysql DATE được trả về dưới dạng byte array
		err := rows.Scan(&s.ID, &s.StudentCode, &s.FullName, &dob, &s.Email, &s.Gender)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi đọc dữ liệu"})
			return
		}
		s.DateOfBirth = string(dob) // Chuyển đổi từ byte array sang string
		students = append(students, s)
	}
	c.JSON(http.StatusOK, students)
}

// ----------------- 2. THÊM MỚI SINH VIÊN (CREATE) -----------------
func createStudent(c *gin.Context) {
	var s Student
	if err := c.ShouldBindJSON(&s); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu gửi lên không hợp lệ"})
		return
	}

	query := "INSERT INTO students (student_code, full_name, date_of_birth, email, gender) VALUES (?, ?, ?, ?, ?)"
	_, err := db.Exec(query, s.StudentCode, s.FullName, s.DateOfBirth, s.Email, s.Gender)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể thêm sinh viên (có thể trùng mã/email)"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Thêm sinh viên thành công!"})
}

// ----------------- 3. CẬP NHẬT SINH VIÊN (UPDATE) -----------------
func updateStudent(c *gin.Context) {
	id := c.Param("id") // Lấy ID từ đường dẫn, ví dụ: /api/students/5
	var s Student
	if err := c.ShouldBindJSON(&s); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
		return
	}

	query := "UPDATE students SET student_code=?, full_name=?, date_of_birth=?, email=?, gender=? WHERE id=?"
	_, err := db.Exec(query, s.StudentCode, s.FullName, s.DateOfBirth, s.Email, s.Gender, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể cập nhật thông tin"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật sinh viên thành công!"})
}

// ----------------- 4. XÓA SINH VIÊN (DELETE) -----------------
func deleteStudent(c *gin.Context) {
	id := c.Param("id")
	_, err := db.Exec("DELETE FROM students WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể xóa sinh viên"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Xóa sinh viên thành công!"})
}

// ----------------- 5. ĐĂNG NHẬP (LOGIN) -----------------
func login(c *gin.Context) {
	var creds LoginCredentials
	if err := c.ShouldBindJSON(&creds); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
		return
	}

	var dbPassword string
	// Tìm xem tài khoản có tồn tại không
	err := db.QueryRow("SELECT password FROM users WHERE username = ?", creds.Username).Scan(&dbPassword)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Tài khoản hoặc mật khẩu không đúng"})
		return
	}

	// Kiểm tra mật khẩu (Để đơn giản bước này, chúng ta so sánh chuỗi trực tiếp)
	// (Ở Giai đoạn deploy chúng ta sẽ nâng cấp lên mã hóa bcrypt sau)
	if creds.Password != dbPassword {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Tài khoản hoặc mật khẩu không đúng"})
		return
	}

	// Đăng nhập đúng -> Trả về một thông báo thành công (và token giả định để frontend lưu trữ)
	c.JSON(http.StatusOK, gin.H{
		"message": "Đăng nhập thành công!",
		"token":   "fake-jwt-token-cho-phien-ban-co-ban",
	})
}