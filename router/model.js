var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/:mdid', function(req, res, next) {
    // res.render('model', { title: 'Express' });
    
    res.render('model',{mdid: req.params.mdid });
});

  
module.exports = router;