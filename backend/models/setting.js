// const pool = require('../config/database');
const pool = require('../config/db_pool');

const createTable = async () => {
  const setting_ddl = `
    CREATE TABLE IF NOT EXISTS setting (
      id SERIAL PRIMARY KEY,
      domain VARCHAR(255) NOT NULL,
      base_assistant_id VARCHAR(255),
      advanced_assistant_id VARCHAR(255),
      embedded_app_id VARCHAR(255),
      embedded_app_secret VARCHAR(255)
    )
  `
  await pool.query(setting_ddl)
};

// 初始化表
createTable();

const Setting = {

  async getById(id) {
    const result = await pool.query('SELECT * FROM setting WHERE id = $1', [id]);
    if (result?.rows?.length) {
      return result.rows[0]
    }
    return null
  },

  async create(settingData) {
    const { domain, base_assistant_id, advanced_assistant_id, embedded_app_id, embedded_app_secret } = settingData;
    const result = await pool.query(
      'INSERT INTO setting (domain, base_assistant_id, advanced_assistant_id, embedded_app_id, embedded_app_secret) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [domain, base_assistant_id, advanced_assistant_id, embedded_app_id, embedded_app_secret]
    );
    return result.rows[0];
  },

  async update(id, settingData) {
    const { domain, base_assistant_id, advanced_assistant_id, embedded_app_id, embedded_app_secret } = settingData;
    const result = await pool.query(
      'UPDATE setting SET domain = $1, base_assistant_id = $2, advanced_assistant_id = $3, embedded_app_id = $4, embedded_app_secret = $5 WHERE id = $6 RETURNING *',
      [domain, base_assistant_id, advanced_assistant_id, embedded_app_id, embedded_app_secret, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM setting WHERE id = $1', [id]);
  },
};

module.exports = Setting;