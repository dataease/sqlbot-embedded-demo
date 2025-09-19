const Setting = require('../models/setting');

const settingController = {
  async getSetting(req, res, next) {
    try {
      const setting = await Setting.getById(1);
      res.json({
        success: true,
        data: setting
      });
    } catch (error) {
      next(error);
    }
  },

  async saveSetting(req, res, next) {
    try {
      const { domain, base_assistant_id, advanced_assistant_id, embedded_app_id, embedded_app_secret, aes_enable, aes_key } = req.body;
      
      // 验证必填字段
      if (!domain) {
        return res.status(400).json({
          success: false,
          message: 'Domain are required'
        });
      }
      let newSetting = null
      const setting = await Setting.getById(1)
      if (setting) {
        newSetting = await Setting.update(1, { domain, base_assistant_id, advanced_assistant_id, embedded_app_id, embedded_app_secret, aes_enable, aes_key });
      } else {
        newSetting = await Setting.create({ domain, base_assistant_id, advanced_assistant_id, embedded_app_id, embedded_app_secret, aes_enable, aes_key });
      }
      res.status(201).json({
        success: true,
        data: newSetting
      });
    } catch (error) {
      next(error);
    }
  },
};

const apiHandler = {
  prefix: '/setting',
  mapping: [
    { path: '/', method: 'get', handler: settingController.getSetting },
    { path: '/', method: 'post', handler: settingController.saveSetting }
  ]
}

module.exports = apiHandler;