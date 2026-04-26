const models = require('../models');
const Account = models.Account;
const { after } = require('underscore');
const { updateSearchIndex } = require('../models/Recipe');


const loginPage = (req, res) => {
    return res.render('login');
};

//retuns information about the account to updat the buttons dynamically
const getAccount = (req, res) => {
    return res.json({accountType: req.session.account.accountType});
}


const logout = (req, res) => {
    req.session.destroy();
    return res.redirect('/');
};

const login = (req, res) => {

    const username = `${req.body.username}`;
    const pass = `${req.body.pass}`;

    if (!username || !pass) {
        return res.status(400).json({ error: "All fields are required" });
    }


    return Account.authenticate(username, pass, (err, account) => {
        if (err || !account) {
            return res.status(401).json({ error: "wrong username or password" });
        }

        req.session.account = Account.toAPI(account);

        return res.json({ redirect: '/maker' });
    });

};

const signup = async (req, res) => {

    const username = `${req.body.username}`;
    const pass = `${req.body.pass}`;
    const pass2 = `${req.body.pass2}`;

    if (!username, !pass, !pass2) {
        return res.status(400).json({ error: "All fields are required" });
    }

    if (pass != pass2) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        const hash = await Account.generateHash(pass);
        const newAccount = new Account({ username, password: hash });
        await newAccount.save();
        req.session.account = Account.toAPI(newAccount);
        return res.json({ redirect: '/maker' });

    } catch (err) {
        console.log(err);
        if (err.code === 1100) {
            return res.status(400).json({ error: "username is already in use" });
        }

        return res.status(500).json({ error: "An error occured" });
    }


};

//update the user's account plan to free or premium based on what the user says
const updatePlan = async (req, res) => {

    //get the value of the plan that the user wants to switch to
    const planToSwitch = `${req.body.plan}`;
    const accountID = `${req.session.account._id}`;

    //update the plan of the account
    try {
        const updateAccount = await Account.findOneAndUpdate({_id: accountID}, {
            accountType: planToSwitch,
        },
            { returnDocument: 'after' }
        ).lean().exec();

        //update the session to refelct the change
        req.session.account = Account.toAPI(updateAccount);

        return res.json({accountType: updateAccount.plan});

    } catch(err) {

        console.log(err);
        return res.status(500).json({ error: 'An error occurred' });
        
    }

}

module.exports = {
    loginPage, login, logout, signup, updatePlan, getAccount
};