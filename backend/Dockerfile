# Bước 1: Dùng hệ điều hành có sẵn Golang để biên dịch code (Build stage)
FROM golang:1.26.1-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# Biên dịch code Go thành 1 file chạy duy nhất tên là "server"
RUN CGO_ENABLED=0 GOOS=linux go build -o server main.go

# Bước 2: Dùng một hệ điều hành siêu nhẹ (chỉ vài MB) để chạy file đã build nhằm giảm dung lượng
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
