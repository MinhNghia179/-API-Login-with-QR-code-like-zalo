const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const qrCode = require('qrcode');
const constants = require('../constants/index');

const socket = require('../services/index')(express());

router.get('/account/authen', async (req, res, next) => {
  const { t } = req.query;

  if (t === constants.RESEND_TOKEN) {
    const secret = constants.SECRET_KEY;
    const code = '';
    const options = { expiresIn: constants.TIME_EXPIRED };
    const token = jwt.sign({}, secret, options);

    return await qrCode.toBuffer(token, (err, buffer) => {
      if (err) {
        console.error(err);
        return;
      }
      const base64Image = 'data:image/jpg;base64,' + buffer.toString('base64');
      res.status(200).json({ code, image: base64Image, token });
    });
  }

  if (t === constants.CONFIRM_INFO) {
    socket.on(`confirm-info-${req.body.code}`, ({ avatar, name, token }) => {
      if (token) {
        const expirationTime = jwt.verify(token, constants.SECRET_KEY).exp;
        const isExpired = Date.now() >= expirationTime * 1000;
        if (isExpired) {
          return res
            .status(401)
            .json({ error: true, message: 'Unauthorized access.', err });
        } else {
          return res.status(200).json({ avatar, name });
        }
      }
    });
  }

  if (t === constants.SUBMIT_LOGIN) {
    socket.on(`submit-login-${req.body.code}`, ({ isTrust }) => {
      if (isTrust) {
        res.status(200).json({ message: 'Login successfully!' });
      }
    });
  }
});

module.exports = router;
