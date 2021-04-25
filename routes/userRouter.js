const router = require('express').Router()
const userCtrl = require('../controllers/userCtrl');
const auth = require('../middleware/auth');

/*
router.post('/register', (req, res) => {
    res.json({msg: "Test Router"})
})
*/

// Pour test Router
/*
router.post('/register', (req, res) => {
    res.json({msg: "Test Router"})
})
*/

// Pour test controller
router.post('/register', userCtrl.register)
//routes refreshToken
router.get('/refresh_token', userCtrl.refreshToken)

router.post('/login', userCtrl.login)

router.post('/logout', userCtrl.logout)
//router.get('/logout', userCtrl.logout)

router.get('/infor', auth, userCtrl.getUser)

router.patch('/addcart', auth, userCtrl.addCart)

router.get('/history', auth, userCtrl.history)


module.exports = router
