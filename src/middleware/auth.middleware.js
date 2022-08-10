const jwt = require('jsonwebtoken');
const { jwtSecretKey } = require('../utils/consts');
const userList = require('../mocks/MOCK_DATA_USERS.json');

module.exports.isAuthenticated = async function (req, res, next) {
    try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const userId = await jwt.verify(token, jwtSecretKey);

        if (userId) {
            req.user = userList.find((u) => u.id === userId);
            if (!req.user) return res.status(403).send('user not exist');
            next();
        } else res.redirect('/login.html');
    } catch (error) {
        return res.redirect('/login.html');
    }
};
