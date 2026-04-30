const jwt = require('jsonwebtoken');

function checkUser(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: "No token, you are not authorized!" });
  }

  try {
    const tokenString = token.split(' ')[1];
    const decodedData = jwt.verify(tokenString, process.env.JWT_SECRET);
    req.user = decodedData.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid!" });
  }
}

module.exports = checkUser;