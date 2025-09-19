const Sales = require('../models/sales');
const Setting = require('../models/setting');
const crypto = require('crypto');
const generateRandomString = (length = 32) =>  {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
const aes_encrypt = (text, key) => {
  const prefix = 'sqlbot-aesiv-pre-'
  const prefixBuffer = Buffer.from(prefix)
  const iv = generateRandomString(16)
  const keyBuffer = Buffer.from(key);
  const ivBuffer = Buffer.from(iv);
  const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, ivBuffer);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const result = Buffer.concat([prefixBuffer, ivBuffer, Buffer.from(encrypted, 'base64')]);
  return result.toString('base64')
}
const aes_encrypt_fields = ['host', 'user', 'password', 'dataBase', 'schema']
const dsController = {
  async getDsList(req, res, next) {
    try {
      const account = req.user?.account || 'developer'
      const dsList = await Sales.getDsData(account)
      const settingData = await Setting.getById(1);

      // 对敏感字段进行AES加密(可选)
      if (dsList?.length && settingData?.aes_enable) {
        const aes_key = settingData.aes_key
        dsList.forEach(ds => {
          aes_encrypt_fields.forEach(fieldName => {
            const val = ds[fieldName]
            if (val) {
              ds[fieldName] = aes_encrypt(val, aes_key)
            }
          })
        })
      }
      res.json({
        success: true,
        code: 0,
        data: dsList
      });
    } catch (error) {
      next(error);
    }
  },
};

const apiHandler = {
  prefix: '/datasource',
  mapping: [
    { path: '/', method: 'get', handler: dsController.getDsList }
  ]
}
module.exports = apiHandler;