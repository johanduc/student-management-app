import React, { useState, useEffect } from "react";
import axios from "axios";

// Cấu hình đường dẫn gốc tới Backend Golang
//const API_URL = "http://localhost:8080/api";
//const API_URL = "/api";
const API_URL = "https://student-backend-zwm0.onrender.com";

function App() {
  // --- Các trạng thái (State) quản lý ứng dụng ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [students, setStudents] = useState([]);
  const [id, setId] = useState(""); // Lưu ID khi cần Sửa
  const [studentCode, setStudentCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("Nam");
  const [isEditing, setIsEditing] = useState(false);

  // Tự động tải danh sách sinh viên khi đã đăng nhập thành công
  useEffect(() => {
    if (isLoggedIn) {
      fetchStudents();
    }
  }, [isLoggedIn]);

  // --- Hàm xử lý Đăng Nhập ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });
      if (response.data.token) {
        setIsLoggedIn(true);
        setLoginError("");
      }
    } catch (error) {
      setLoginError(error.response?.data?.error || "Đăng nhập thất bại!");
    }
  };

  // --- Hàm lấy danh sách Sinh viên (Read) ---
  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/students`);
      setStudents(response.data || []);
    } catch (error) {
      alert("Không thể tải danh sách sinh viên");
    }
  };

  // --- Hàm xử lý Thêm hoặc Sửa Sinh viên (Create / Update) ---
  const handleSubmitStudent = async (e) => {
    e.preventDefault();
    const studentData = {
      student_code: studentCode,
      full_name: fullName,
      date_of_birth: dateOfBirth,
      email,
      gender,
    };

    try {
      if (isEditing) {
        // Gọi API Update nếu đang ở chế độ sửa
        await axios.put(`${API_URL}/students/${id}`, studentData);
        alert("Cập nhật sinh viên thành công!");
      } else {
        // Gọi API Create nếu đang ở chế độ thêm mới
        await axios.post(`${API_URL}/students`, studentData);
        alert("Thêm sinh viên thành công!");
      }
      resetForm();
      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.error || "Thao tác thất bại!");
    }
  };

  // --- Hàm xử lý Xóa Sinh viên (Delete) ---
  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sinh viên này không?")) {
      try {
        await axios.delete(`${API_URL}/students/${studentId}`);
        alert("Xóa sinh viên thành công!");
        fetchStudents();
      } catch (error) {
        alert("Không thể xóa sinh viên");
      }
    }
  };

  // --- Hàm bấm nút Sửa: Đẩy ngược dữ liệu lên Form ---
  const handleEditClick = (student) => {
    setIsEditing(true);
    setId(student.id);
    setStudentCode(student.student_code);
    setFullName(student.full_name);
    setDateOfBirth(student.date_of_birth);
    setEmail(student.email);
    setGender(student.gender);
  };

  // --- Hàm Reset Form về trạng thái trống ---
  const resetForm = () => {
    setIsEditing(false);
    setId("");
    setStudentCode("");
    setFullName("");
    setDateOfBirth("");
    setEmail("");
    setGender("Nam");
  };

  // ================= GIAO DIỆN CHÍNH =================

  // 1. Nếu chưa đăng nhập -> Hiển thị Màn hình Đăng nhập
  if (!isLoggedIn) {
    return (
      <div
        style={{
          maxWidth: "400px",
          margin: "100px auto",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h2>ĐĂNG NHẬP HỆ THỐNG</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "10px" }}>
            <label>Tài khoản: </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Mật khẩu: </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          {loginError && <p style={{ color: "red" }}>{loginError}</p>}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              background: "#007bff",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Đăng nhập
          </button>
        </form>
      </div>
    );
  }

  // 2. Nếu đã đăng nhập -> Hiển thị Màn hình Quản lý Sinh viên CRUD
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "between",
          alignItems: "center",
        }}
      >
        <h2>HỆ THỐNG QUẢN LÝ SINH VIÊN</h2>
        <button
          onClick={() => setIsLoggedIn(false)}
          style={{
            background: "#dc3545",
            color: "white",
            border: "none",
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          Đăng xuất
        </button>
      </div>

      {/* KHU VỰC FORM THÊM / SỬA */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: "15px",
          borderRadius: "5px",
          marginBottom: "20px",
          background: "#f9f9f9",
        }}
      >
        <h3>
          {isEditing ? "CẬP NHẬT THÔNG TIN SINH VIÊN" : "THÊM SINH VIÊN MỚI"}
        </h3>
        <form
          onSubmit={handleSubmitStudent}
          style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
        >
          <input
            type="text"
            placeholder="Mã sinh viên"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            required
            style={{ padding: "8px" }}
          />
          <input
            type="text"
            placeholder="Họ và tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={{ padding: "8px" }}
          />
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
            style={{ padding: "8px" }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: "8px" }}
          />
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={{ padding: "8px" }}
          >
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
          <button
            type="submit"
            style={{
              background: "#28a745",
              color: "white",
              border: "none",
              padding: "8px 15px",
              cursor: "pointer",
            }}
          >
            {isEditing ? "Cập nhật" : "Thêm mới"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                background: "#6c757d",
                color: "white",
                border: "none",
                padding: "8px 15px",
                cursor: "pointer",
              }}
            >
              Hủy
            </button>
          )}
        </form>
      </div>

      {/* KHU VỰC BẢNG DANH SÁCH SINH VIÊN */}
      <h3>DANH SÁCH SINH VIÊN</h3>
      <table
        border="1"
        cellPadding="10"
        cellSpacing="0"
        style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}
      >
        <thead>
          <tr style={{ background: "#eee" }}>
            <th>ID</th>
            <th>Mã SV</th>
            <th>Họ và Tên</th>
            <th>Ngày sinh</th>
            <th>Email</th>
            <th>Giới tính</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                Chưa có sinh viên nào trong hệ thống.
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.student_code}</td>
                <td>{student.full_name}</td>
                <td>{student.date_of_birth}</td>
                <td>{student.email}</td>
                <td>{student.gender}</td>
                <td>
                  <button
                    onClick={() => handleEditClick(student)}
                    style={{
                      background: "#ffc107",
                      marginRight: "5px",
                      border: "none",
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(student.id)}
                    style={{
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
