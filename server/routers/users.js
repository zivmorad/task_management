const express = require('express');
const connection = require('./connector');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const auth = require('../middleware/auth');

dotenv.config();

var router = express.Router();

// Sign-in
// I still need to re-use the hashedPwd variable --> TODO
router.post('/login', async (req, res) => {
    const email = req.body.email;
    const pwd = req.body.password;
    const hashedPwd = await bcrypt.hash(pwd, 8);
    const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${pwd}'`

    try {
        await connection.query(query, (err , results) => {
            if(err) {
                console.log(err);
                return res.status(401).send(JSON.stringify({ data: err }));
            }
            const token = jwt.sign({ id: email}, process.env.JWT_TOKEN, {'expiresIn': '2 days' });
            updateToken(token,email)
            if(results.length > 0){
                // In case it's a valid username & password
                return res.status(200).json({
                    token,
                    user: {
                        results
                    }
                });
            }
            // Incase of invalid username & password
            return res.status(401).json({ msg: 'An error occured while tried to logged in user' });
        })
    } catch (err) {
        console.log({ msg: 'An error occured while tried to logged in user' });
    }
})

router.get('/auth', auth, async (req,res) => {
    const email = req.user;
    const query = `SELECT * FROM users WHERE email = '${email}'`;
    try {
        await connection.query(query, (err, results) => {
            if(err) {
                console.log(err);
                return res.status(401).send(JSON.stringify({ data: err }));
            }
            return res.status(200).json({
                results
            })
        })
    } catch (err) {
        return res.status(401).json({ msg: 'An error occured while tried to validate user in login process' });
    }
})

router.post('/userexist', async (req, res) => {
    const email = req.body.email;
    const query = `SELECT * FROM users WHERE email = '${email}'`;
    try {
        await connection.query(query, (err, results) => {
            if(err) {
                console.log(err);
                return res.status(401).send(JSON.stringify({ data: err }));
            }
            if(results.length > 0) {
                // In case user is exist
                return res.status(200).send(JSON.stringify({ userExist: true}));
            }
            // In case user is not exist
            return res.status(200).send(JSON.stringify({ userExist: false }));
        })
    }
    catch (err) {
        return res.status(401).json({ msg: 'An error occured while tried to get user existance status.' });
    }
})

// Need to use with hashedPwd --> TODO
router.post('/register', async (req, res) => {
    const email = req.body.email;
    // const hashedPwd = await bcrypt.hash(req.body.password,8);
    const password = req.body.password;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const phone = req.body.phone;
    const query = `INSERT INTO users (firstname,lastname,email,phone,password) VALUES ('${firstname}','${lastname}','${email}','${phone}','${password}')`;

    try {
        await connection.execute(query);
        console.log('Successfully added a new user to DB using register page.');
    }
    catch(err) {
        console.log(err);
        return res.status(401).json({ msg: 'An error occured while tried to add new user from register page'});
    }
})


const updateToken = (token,email) => {
    connection.query(`UPDATE users SET token = '${token}' WHERE email = '${email}'`, (err, res) => {
        if(err){
            console.log(err)
        }
    })
}

module.exports = router;