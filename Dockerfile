# 使用官方 Node.js 运行时作为父镜像
# 选择 LTS 版本以提高稳定性和安全性，例如 node:18 或 node:20
FROM node:22-alpine

# 设置容器内的工作目录
WORKDIR /opt/app
COPY . .
# build frontend
WORKDIR /opt/app/frontend
RUN  npm install; npm run build; mv  dist ../backend

# build backend
WORKDIR /opt/app/backend
RUN npm install --production
# run server
CMD ["node", "server.js"]
