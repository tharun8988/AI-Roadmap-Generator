const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    const {mail, pwd} = req.body;
    if(!mail || !pwd) return res.status(400).json({'message': 'Username and password are required'});

    const foundUser = await User.findOne({mail: mail}).exec();
    if(!foundUser) return res.sendStatus(401);

    const match = await bcrypt.compare(pwd, foundUser.password);
    if(match) {
        const accessToken = jwt.sign(
        {
            "UserInfo": {
                "mail": foundUser.mail
            }
        },
        process.env.ACCESS_TOKEN,
        {expiresIn: '120s'}
    );

    const refreshToken = jwt.sign(
        {"mail": foundUser.mail},
        process.env.REFRESH_TOKEN,
        {expiresIn: '1d'}
    );

    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();
    console.log(result);

    res.cookie('jwt', refreshToken, {httpOnly: true, secure: false, sameSite: 'Lax', maxAge: 24 * 60 * 60 * 1000 });
    res.json({accessToken});
    }else{
        res.sendStatus(401);
    }
}

module.exports = {handleLogin};