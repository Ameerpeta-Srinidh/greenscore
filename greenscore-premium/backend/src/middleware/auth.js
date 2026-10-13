const jwt = require("jsonwebtoken");

module.exports = function auth(request, response, next) {
  const header = request.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return response.status(401).json({ message: "Authentication required." });
  }

  const token = header.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    request.userId = payload.userId;
    return next();
  } catch (_error) {
    return response.status(401).json({ message: "Invalid or expired token." });
  }
};
