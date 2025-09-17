// const pool = require('../config/database');
const pool = require('../config/db_pool');

const { sales_ddl,  sales_data_sql } = require('./business');


const createTable = async () => {
  await pool.query(sales_ddl);
  await initData()
};
const initData = async () => {
  const result = await pool.query('SELECT count(*) FROM regions');
  if (result?.rows?.length && result.rows[0].count > 0) {
    return
  }
  await pool.query(sales_data_sql);
};

// 初始化表
createTable();


const Sales = {
  /**
   * 
   * 查询数据源提供给 SQLBot 进行问数 (使用业务系统自己的权限以及数据)
   * @param {*} account 
   * 设：
   * 系统中有两种权限级别分别是 admin 以及 other
   * other 权限仅有“东区的数据权限”，admin权限有所有数据权限
   */
  async getDsData(account) {
    const baseDsList = [
      {
        name: 'SQLBot-embedded-test-ds',
        type: 'pgsql',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dataBase: process.env.DB_NAME,
        user: process.env.DB_USER,
        password:  process.env.DB_PASSWORD,
        schema: '',
        comment: 'SQLBot-embedded-test-ds',
        tables: [
          {
            name: 'regions',
            comment: '区域表',
            fields: [
              { name: 'region_id', comment: '区域ID', type: 'INTEGER' },
              { name: 'region_name', comment: '区域名称', type: 'TEXT' }
            ]
          },
          {
            name: 'categories',
            comment: '商品品类表',
            fields: [
              { name: 'category_id', comment: '品类ID', type: 'INTEGER' },
              { name: 'category_name', comment: '品类名称', type: 'TEXT' }
            ]
          },
          {
            name: 'sales',
            comment: '销售信息表',
            fields: [
              { name: 'sale_id', comment: '销售ID', type: 'INTEGER' },
              { name: 'region_id', comment: '区域ID', type: 'INTEGER' },
              { name: 'category_id', comment: '品类ID', type: 'INTEGER' },
              { name: 'sale_year', comment: '销售年份', type: 'INTEGER' },
              { name: 'season', comment: '季节', type: 'VARCHAR' },
              { name: 'sales_amount', comment: '销售金额', type: 'INTEGER' },
              { name: 'sale_date', comment: '销售日期', type: 'VARCHAR' }
            ]
          }
        ]
      }
    ]
    if (account !== 'admin') {
      // 进行权限过滤
      baseDsList[0].tables[0]['sql'] = "select region_id, region_name from regions where region_name = '东区'"
      // SQLBot 的机制是： sql 字段的优先级高于 name
    } else {
      // admin 权限还包含查询统计权限涉及到的 “视图”
      const table = {
        name: '年度销售汇总信息表',
        comment: '年度销售汇总信息表',
        sql: `
          SELECT 
              r.region_name,
              s.sale_year,
              SUM(s.sales_amount) as sales_amount
          FROM sales s
          JOIN regions r ON s.region_id = r.region_id
          GROUP BY r.region_name, s.sale_year
          ORDER BY s.sale_year, r.region_name;
        `,
        fields: [
          { name: 'region_name', comment: '区域', type: 'VARCHAR' },
          { name: 'sale_year', comment: '年份', type: 'INTEGER' },
          { name: 'sales_amount', comment: '总销售额', type: 'INTEGER' }
        ]
      }
      baseDsList.push(table)
    }
    return baseDsList
  }
};

module.exports = Sales;