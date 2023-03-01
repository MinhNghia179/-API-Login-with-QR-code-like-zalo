const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const qrCode = require('qrcode');

const io = require('../services/index');

const constants = require('../constants/index');

router.get('/account/authen', async (req, res, next) => {
  const { t } = req.query;

  const code = '';

  if (t === constants.RESEND_TOKEN) {
    const secret = constants.SECRET_KEY;
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
    io.on(`confirm-info`, ({ avatar, name, token }) => {
      if (token) {
        const expirationTime = jwt.verify(token, constants.SECRET_KEY).exp;
        const isExpired = Date.now() >= expirationTime * 1000;
        if (isExpired) {
          res
            .status(401)
            .json({ error: true, message: 'Unauthorized access.', err });
        } else {
          res.status(200).json({ avatar, name });
        }
      }
    });
  }

  if (t === constants.SUBMIT_LOGIN) {
    io.on(`submit-login`, ({ isTrust }) => {
      if (isTrust) {
        res.status(200).json({ message: 'Login successfully!' });
      }
    });
  }
});

router.post('/mobile/authen', (req, res, next) => {
  const { t } = req.query;
  const { token } = req.body;

  if (t === constants.CONFIRM_INFO) {
    io.emit(`confirm-info`, {
      display_name: 'Nguyễn Minh Nghĩa',
      avatar:
        'https://cdn.ebaumsworld.com/mediaFiles/picture/1035099/85785795.jpg',
      token,
    });
  }
  if (t === constants.SUBMIT_LOGIN) {
    io.emit('submit-login', { isTrust: true });
  }
});

module.exports = router;
