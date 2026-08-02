# Dùng Node.js để cài đặt thư viện và chạy môi trường dev cho đơn giản ở bước này
FROM node:24.14.0-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# Chạy Frontend ở chế độ dev và mở rộng cổng cho bên ngoài truy cập
CMD ["npm", "run", "dev", "--", "--host"]
