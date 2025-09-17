const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { requestHandler, tokenHandler } = require('./middleware/requestHandler');

const app = express();
const PORT = process.env.PORT || 3000;


// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, process.env.STATIC_DIR || '../frontend/dist')));
app.use(tokenHandler);
// 路由
const router = express.Router();
const controllerPath = path.join(__dirname, 'controller');
fs.readdirSync(controllerPath).forEach(file => {
  if (file.endsWith('.js')) {
    const apiHandler = require(path.join(controllerPath, file));
    const { prefix, mapping } = apiHandler
    mapping.forEach(item => {
      const { path, method, handler } = item
      let handlerPath = prefix + path
      if (handlerPath.endsWith('/')) {
        handlerPath = handlerPath.substring(0, handlerPath.length - 1)
      }
      router[method](handlerPath, handler)
    })
  }
});
app.use('/api', router);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// 错误处理中间件
app.use(requestHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;