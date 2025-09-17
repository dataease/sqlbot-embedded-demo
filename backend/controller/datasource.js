const Sales = require('../models/sales');

const dsController = {
  async getDsList(req, res, next) {
    try {
      const account = req.user?.account || 'developer'
      const dsList = await Sales.getDsData(account)
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