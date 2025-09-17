const user_list = [
  { uid: 1758078353942, account: 'admin', name: '管理员', role: '系统管理员' },
  { uid: 1758078367197, account: 'developer', name: '开发者', role: '普通研发' },
]
const mockUserInfo = (userInfo) => {
  const account = userInfo.account
  return user_list.find(user => user.account === account)
}
const tokenHandler = (req, res, next) => {
  try {
    let token = req.headers['sqlbot-embedded-token'];
    const prefix = 'Bearer ';
    
    if (token && token.startsWith(prefix)) {
      token = token.substring(prefix.length);
      const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
      const userInfo = JSON.parse(decodedToken);
      userDetail = mockUserInfo(userInfo)
      // 将用户信息存储在请求对象中
      req.user = userDetail;
    }
    next();
  } catch (tokenError) {
    console.error('Token parsing error:', tokenError);
    next();
  }
}
const requestHandler = (err, req, res, next) => {
  if (!err) {
    return next();
  }

  console.error('Error occurred:', err.stack || err.message);

  // PostgreSQL 错误处理
  if (err.code === '23505') { // 唯一约束违反
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry violates unique constraint',
      error: err.detail || err.message
    });
  }
  
  if (err.code === '23503') { // 外键约束违反
    return res.status(400).json({
      success: false,
      message: 'Foreign key constraint violation',
      error: err.detail || err.message
    });
  }

  // 验证错误（如Joi、express-validator等）
  if (err.name === 'ValidationError' || Array.isArray(err.errors)) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors || err.details
    });
  }

  // JWT 认证错误
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: err.message
    });
  }

  // 默认错误处理
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { requestHandler, tokenHandler };