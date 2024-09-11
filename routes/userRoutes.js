const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { jwtAuthMiddleware, generateToken } = require('../jwt');


// signup routes
router.post('/signup', async (req, res) => {
    try {
        const data = req.body;

        // create new user document
        const newUser = new User(data);

        // save user into database
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is :", token);

        res.status(200).json({ response: response, token: token });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// login routes 
router.post('/login', async (req, res) => {
    try {
        const { IdCard, password } = req.body;

        // create new user document
        const user = await User.findOne({ IdCard: IdCard });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const payload = {
            id: user.id
        }

        const token = generateToken(payload);

        res.json({ token })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// profile routes
router.get('profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        console.log("user data: ", userData);

        const userId = userData.id;
        const user = await User.findById(userId);

        res.status(200).json({ user })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// change password route
router.put('profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);

        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        user.password = newPassword;
        await user.save();

        console.log('Password updated');
        res.status(200).json({ message: "Password Updated" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;

