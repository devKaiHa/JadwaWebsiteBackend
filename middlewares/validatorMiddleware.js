const { validationResult } = require("express-validator");

//هاد الكود لمسك الخطا قبل الذهاب الى الداتا بيس اذا كان عندك بحث عن طريق الIP
// @desc Finds the validation errors in this request and wraps them in an  object with handy functions
const validatorMiddleware =
  //2- middleware=> catch error from rules if exist
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  };

module.exports = validatorMiddleware;
