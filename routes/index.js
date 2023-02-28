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
    const options = { expiresIn: constants.TIME_EXPIRED };
    const token = jwt.sign({}, secret, options);

    return await qrCode.toBuffer(token, (err, buffer) => {
      if (err) {
        console.error(err);
        return;
      }
      const base64Image = 'data:image/jpg;base64,' + buffer.toString('base64');
      res.send({ base64Image, token });
    });
  }
  if (t === constants.CONFIRM_INFO) {
    socket.on(`confirm-info-${req.body.code}`, ({ avatar, name }) => {
      return res.send({ avatar, name });
    });
  }
  if (t === constants.SUBMIT_LOGIN) {
  }
});

module.exports = router;
