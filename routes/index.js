const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const qrCode = require('qrcode');

const io = require('../services/index');

const constants = require('../constants/index');

const { v4: uuid } = require('uuid');

router.post('/account/authen', (req, res, next) => {
  const { t } = req.query;

  const time = new Date().getTime();
  const code = `${time}.${uuid().replace(/-/g, '')}`;

  const secret = constants.SECRET_KEY;
  const options = { expiresIn: constants.TIME_EXPIRED };
  const token = jwt.sign({}, secret, options);

  if (t === constants.RESEND_TOKEN) {
    return qrCode.toBuffer({ code, token }, (err, buffer) => {
      if (err) return;
      const base64Image = 'data:image/jpg;base64,' + buffer.toString('base64');
      res.send({ code, image: base64Image, token });
    });
  }

  if (t === constants.CONFIRM_INFO) {
    const { code } = req.body;

    io.on(`confirm-info-${code}`, ({ avatar, display_name }) => {
      if (token) {
        jwt.verify(token, constants.SECRET_KEY, (error) => {
          if (error) {
            res.send({ isExpired: true, message: 'Token time expired' });
            next();
          }
          res.send({ isExpired: false, avatar, display_name });
        });
      }
    });
  }

  if (t === constants.SUBMIT_LOGIN) {
    const { code } = req.body;
    io.on(`submit-login-${code}`, ({ token }) => {
      res.send({ token });
    });
  }
});

router.post('/mobile/authen', (req, res, next) => {
  const { t } = req.query;

  if (t === constants.CONFIRM_INFO) {
    const { display_name, avatar, code, token } = req.body;
    io.emit(`confirm-info-${code}`, { display_name, avatar, token });
  }

  if (t === constants.SUBMIT_LOGIN) {
    const { token, code } = req.body;
    io.emit(`submit-login-${code}`, { token });
  }
});

module.exports = router;
