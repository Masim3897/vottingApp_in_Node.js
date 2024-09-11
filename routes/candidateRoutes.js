const express = require('express');
const router = express.Router();
const Candidate = require('../models/candidate');
const User = require('../models/user');
const { jwtAuthMiddleware } = require('../jwt');

// this function check user id admin or not
const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        if (user.role === "admin") {
            return true
        }
    } catch (err) {
        return false;
    }
}


// candidate routes
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id)))
            return res.status(403).json({ message: 'user not admin role' });

        const data = req.body;

        // create new user document
        const newCandidate = new Candidate(data);

        // save user into database
        const response = await newCandidate.save();
        console.log('data saved');
        res.status(200).json({ response: response });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id))
            return res.status(403).json({ message: 'User not admin role' })

        const candidateID = req.params.candidateID;
        const updateCandidateData = req.body;

        const response = await Person.findByIdAndUpdate(candidateID, updateCandidateData, {
            new: true,
            runValidators: true,
        })
        if (!response) {
            return res.status(404).json({ message: 'Candidate not found' });
        }
        console.log('Candidate data updated');
        res.status(200).json(response);

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id))
            return res.status(403).json({ message: 'User not admin role' })

        const candidateID = req.params.candidateID;

        const response = await Person.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ message: 'Candidate not found' });
        }
        console.log('Candidate deleted');
        res.status(200).json(response);

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    candidateID = req.params.candidateID;
    userId = req.user.id;

    try {
        // find the candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: 'candidate not found' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }
        if (user.isVoted) {
            res.status(400).json({ message: 'you have already voted' });
        }
        if (user.role == "admin") {
            res.status(403).json({ message: 'admin not allowed' });
        }

        // update candidate document to record the vote
        candidate.votes.push({ user: userId})
        candidate.voteCount++;
        await candidate.save();

        // update user documents
        user.isVoted = true
        await user.save();

        res.status(200).json({ message: 'record recorded successfully' });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

// vote count
router.get('/vote/count', async (req, res) => {
    try {
        // find all candidate and sort them in descending order
        const candidate = await Candidate.find().sort({ voteCount: "desc" });

        // map the candidates to only return their name and voteCount
        const voteRecord = candidate.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            }
        });
        return res.status(200).json(voteRecord);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;

