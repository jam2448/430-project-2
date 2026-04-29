const models = require('../models');
const Account = models.Account;



const loginPage = (req, res) => {
    return res.render('login');
};

//retuns information about the account to updat the buttons dynamically
const getAccount = (req, res) => {
    return res.json({ accountType: req.session.account.accountType });
}

const changePassPage = (req, res) => {
    return res.render('changePass');
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

//allows the user to change their password 
const changePassword = async (req, res) => {

    //get the info from the request
    const currentPassword = `${req.body.currentPassword}`;
    const newPassword = `${req.body.newPassword}`;
    const confirmPassword = `${req.body.confirmNew}`;

    //if the user entered no fields, send an error
    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: "All fields are required" });
    }

    //if the user is using the same password, send an error
    if (currentPassword === newPassword) {
        return res.status(400).json({ error: "Current and new password cannot match" });
    }

    //if the new passwords do not match, throw an error
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        //wrap in a promise to properly await it
        await new Promise((resolve, reject) => {

            //chech and see if the user entered the correct current password
            Account.authenticate(req.session.account.username, currentPassword, (err, account) => {
                if (err || !account) reject(new Error("Current password is incorrect."));
                else resolve(account);
            });
        });

        //generate a new hash for the password
        const newHash = await Account.generateHash(newPassword);

        //update the account with the new password
        const updatedAccount = await Account.findOneAndUpdate(
            { username: req.session.account.username },
            { password: newHash },
            { returnDocument: 'after' }
        ).exec();

        //send it to the database
        req.session.account = Account.toAPI(updatedAccount);
        return res.status(200).json({ error: 'Password changed successfully' });

    } catch (err) {
        console.log(err);
        if (err.message === "Current password is incorrect.") {
            return res.status(401).json({ error: err.message });
        }
        return res.status(500).json({ error: 'An error occurred' });
    }
};

//update the user's account plan to free or premium based on what the user says
const updatePlan = async (req, res) => {

    //get the value of the plan that the user wants to switch to
    const planToSwitch = `${req.body.newPlan}`;
    const accountID = `${req.session.account._id}`;

    //update the plan of the account
    try {
        const updateAccount = await Account.findOneAndUpdate({ _id: accountID }, {
            accountType: planToSwitch,
        },
            { returnDocument: 'after' }
        ).lean().exec();

        //update the session to refelct the change
        req.session.account = Account.toAPI(updateAccount);

        return res.json({ accountType: updateAccount.plan });

    } catch (err) {

        console.log(err);
        return res.status(500).json({ error: 'An error occurred' });

    }

}


module.exports = {
    loginPage, login, logout, signup, updatePlan, getAccount, changePassPage,
    changePassword
};