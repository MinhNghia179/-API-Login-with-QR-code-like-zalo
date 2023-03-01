const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const qrCode = require('qrcode');

const io = require('../services/index');
const constants = require('../constants/index');
const { uuid } = require('uuidv4');

router.get('/account/authen', (req, res, next) => {
  const { t } = req.query;

  const time = new Date().getTime();
  const code = `${time}.${uuid().replace(/-/g, '')}`;

  if (t === constants.RESEND_TOKEN) {
    return qrCode.toBuffer(code, (err, buffer) => {
      if (err) return;
      const base64Image = 'data:image/jpg;base64,' + buffer.toString('base64');
      res.status(200).json({ code, image: base64Image });
    });
  }

  if (t === constants.CONFIRM_INFO) {
    io.on(`confirm-info-${req.body.code}`, ({ avatar, name, token }) => {
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

  // const secret = constants.SECRET_KEY;
  // const options = { expiresIn: constants.TIME_EXPIRED };
  // const token = jwt.sign({}, secret, options);

  if (t === constants.CONFIRM_INFO) {
    const { display_name, avatar } = req.body;
    io.emit(`confirm-info-${code}`, { display_name, avatar });
  }

  if (t === constants.SUBMIT_LOGIN) {
    const { token } = req.body;
    io.emit('submit-login', { isTrust: true, token });
  }
});

module.exports = router;
