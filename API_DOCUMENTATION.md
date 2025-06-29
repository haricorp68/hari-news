# API Documentation - User Authentication & Profile

## Các API mới được thêm vào

### 1. Lấy thông tin người dùng đang đăng nhập

**Endpoint:** `GET /auth/me`

**Mô tả:** Lấy thông tin cơ bản của người dùng đang đăng nhập

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "User bio",
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "gender": "male",
    "address": "123 Main St",
    "city": "New York",
    "isActive": true,
    "isVerified": false,
    "status": "active",
    "role": "user",
    "lastLoginAt": "2024-01-01T00:00:00.000Z",
    "loginCount": 5,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Lấy thông tin người dùng thành công"
}
```

### 2. Lấy thông tin profile chi tiết

**Endpoint:** `GET /user/profile`

**Mô tả:** Lấy thông tin profile chi tiết của người dùng đang đăng nhập (tương tự như /auth/me nhưng có thể mở rộng thêm thông tin)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "User bio",
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "gender": "male",
    "address": "123 Main St",
    "city": "New York",
    "isActive": true,
    "isVerified": false,
    "status": "active",
    "role": "user",
    "lastLoginAt": "2024-01-01T00:00:00.000Z",
    "loginCount": 5,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Lấy thông tin profile thành công!"
}
```

### 3. Đăng xuất

**Endpoint:** `POST /auth/logout`

**Mô tả:** Đăng xuất người dùng và xóa cookies

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

## Cách sử dụng trong Frontend

### React/Next.js Example

```javascript
// Lấy thông tin người dùng
const getCurrentUser = async () => {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include', // Để gửi cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.user;
    } else {
      throw new Error('Failed to get user info');
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

// Đăng xuất
const logout = async () => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      // Xóa state user trong frontend
      // Redirect về trang login
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Error logging out:', error);
  }
};
```

### Vue.js Example

```javascript
// Lấy thông tin người dùng
const getCurrentUser = async () => {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

// Đăng xuất
const logout = async () => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      // Xóa state user
      // Redirect về trang login
      this.$router.push('/login');
    }
  } catch (error) {
    console.error('Error logging out:', error);
  }
};
```

## Lưu ý quan trọng

1. **Authentication:** Tất cả các API này yêu cầu JWT token hợp lệ
2. **Cookies:** Hệ thống sử dụng httpOnly cookies để lưu trữ access token và refresh token
3. **Security:** Password không được trả về trong response
4. **Error Handling:** Cần xử lý lỗi 401 (Unauthorized) khi token hết hạn
5. **CORS:** Đảm bảo cấu hình CORS đúng để frontend có thể gọi API

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found"
}
``` 