const { Pool } = require('pg');
require('dotenv').config();

class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    
    this.pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432,
      max: 20, // 最大连接数
      idleTimeoutMillis: 30000, // 连接空闲时间
      connectionTimeoutMillis: 2000, // 连接超时时间
    });

    // 监听连接事件
    this.pool.on('connect', (client) => {
      console.log('New client connected to PostgreSQL');
    });

    this.pool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err);
    });

    // 测试连接
    this.testConnection();

    Database.instance = this;
    return this;
  }

  // 测试数据库连接
  async testConnection() {
    try {
      const client = await this.pool.connect();
      console.log('✅ PostgreSQL connected successfully');
      client.release();
    } catch (error) {
      console.error('❌ PostgreSQL connection failed:', error.message);
      process.exit(1);
    }
  }

  // 获取连接池实例
  getPool() {
    return this.pool;
  }

  // 执行查询
  async query(text, params) {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      console.error('Query error:', error.message);
      throw error;
    }
  }

  async getClient() {
    const client = await this.pool.connect();
    
    const query = client.query;
    const release = client.release;
    
    const timeout = setTimeout(() => {
      console.error('A client has been checked out for more than 5 seconds!');
    }, 5000);
    
    client.release = () => {
      clearTimeout(timeout);
      client.query = query;
      client.release = release;
      return release.apply(client);
    };
    
    client.query = (...args) => {
      const start = Date.now();
      return query.apply(client, args).then((result) => {
        const duration = Date.now() - start;
        console.log('Executed query with client', { 
          text: args[0], 
          duration, 
          rows: result.rowCount 
        });
        return result;
      });
    };
    
    return client;
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('PostgreSQL connection pool closed');
      Database.instance = null;
    }
  }

  getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }
}

const database = new Database();

Object.freeze(database);

module.exports = database;