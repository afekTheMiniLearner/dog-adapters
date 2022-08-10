const userList = require('../mocks/MOCK_DATA_USERS.json');
const jwt = require('jsonwebtoken');
const { jwtSecretKey } = require('../utils/consts');

module.exports.loginCtrl = async function (req, res, next) {
    const { username, password } = req.body;
    const user = userList.find((u) => u.username === username);

    if (!user) return res.status(403).send('user not exist');
    if (user.password !== password) {
        return res.status(403).send('password not match');
    }
    const token = await jwt.sign(user.id, jwtSecretKey);
    res.send(token);
};
