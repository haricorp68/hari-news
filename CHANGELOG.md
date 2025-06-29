# Changelog

## [2024-01-XX] - Thêm API lấy thông tin người dùng đăng nhập

### Added
- **API `GET /auth/me`**: Lấy thông tin người dùng đang đăng nhập
- **API `GET /user/profile`**: Lấy thông tin profile chi tiết của người dùng đang đăng nhập
- **API `POST /auth/logout`**: Đăng xuất và xóa cookies
- **Method `getCurrentUser()`** trong `AuthService`: Xử lý logic lấy thông tin user
- **Documentation**: File `API_DOCUMENTATION.md` với hướng dẫn sử dụng chi tiết
- **Postman Collection**: Cập nhật collection với các API mới

### Changed
- **AuthController**: Thêm 3 endpoints mới
- **UserController**: Thêm endpoint profile
- **AuthService**: Thêm method getCurrentUser

### Security
- Tất cả API mới đều yêu cầu JWT authentication
- Password không được trả về trong response
- Sử dụng httpOnly cookies cho token storage

### Frontend Integration
- Hỗ trợ credentials: 'include' để gửi cookies
- Xử lý lỗi 401 Unauthorized
- Ví dụ code cho React/Next.js và Vue.js

### Files Modified
- `src/auth/auth.controller.ts`
- `src/auth/auth.service.ts`
- `src/user/user.controller.ts`
- `hari_news.postman_collection.json`
- `API_DOCUMENTATION.md` (new)
- `CHANGELOG.md` (new) 