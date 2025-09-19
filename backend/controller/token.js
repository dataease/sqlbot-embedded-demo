const Setting = require('../models/setting');
const { SignJWT } = require('jose');

async function generateJWT(payload, secret, expiresIn) {
  try {
    const secretKey = new TextEncoder().encode(secret);
    
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt();
    
    if (expiresIn) {
      jwt.setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn);
    }
    
    return await jwt.sign(secretKey);
  } catch (error) {
    console.error('JWT generation error:', error);
    return null;
  }
}


const tokenController = {
  
  async generate(req, res, next) {
    try {
      const configData = await Setting.getById(1);
      if (!configData) {
        throw new Error("no setting info!");
      }
      const account = req.user?.account || 'developer'
      const payload = { appId: configData.embedded_app_id, account }
      const token = await generateJWT(payload, configData.embedded_app_secret )  
      
      res.status(200).json({
        success: true,
        data: token
      });
    } catch (error) {
      next(error);
    }
  },
};

const apiHandler = {
  prefix: '/token',
  mapping: [
    { path: '/', method: 'get', handler: tokenController.generate }
  ]
}

module.exports = apiHandler;