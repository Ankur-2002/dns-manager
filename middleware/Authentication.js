const userModel = require('../models/User');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

const authenticateMiddleware = async (req, res, next) => {
  try {
    const headers = req.headers;
    // console.log(secret, headers.authorization);
    const token = headers.authorization.replace('Bearer ', '');
    const data = jwt.verify(token, secret);

    console.log(data);
    const { id } = data;

    const user = await userModel.findById(id);

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send({ error: 'Not authorized to access this resource' });
  }
};

module.exports = authenticateMiddleware;
