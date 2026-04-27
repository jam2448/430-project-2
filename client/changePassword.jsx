const helper = require('./helper.js');
const React = require('react');
const { createRoot } = require('react-dom/client');
const { useState, useEffect } = React;


//hanlder that hanldes when a password has been changed 
//sends that post request to the server 

const handlePassChange = (e) => {

    e.preventDefault();
    helper.hideError();

    const currentPassword = e.target.querySelector('#currentPass').value;
    const newPassword = e.target.querySelector('#newPass').value;
    const confirmNew = e.target.querySelector('#confirmNew').value;

    //if the new password is the same as the current, tell them it cannot be the same password
    if (currentPassword === newPassword) {

        helper.handleError("Current and new password cannot be the same");
        return false;
    }

    //if the new and confirmed password don't match then say they don't match
    if (newPassword !== confirmNew) {

        helper.hideError('Passwords do not mmatch');
        return false;
    }

    //return an error if nothing was entered into every field as they are all required
    if (!currentPassword || !newPassword || !confirmNew) {

        helper.handleError('All fields are required');
        return false;
    }

    //send the post request
    helper.sendPost(e.target.action, { currentPassword, newPassword, confirmNew });
    return false;


};


//window that allows the user to change their password to a new one via
//a form
const ChangePassWindow = (props) => {

    return (

        //build the form: makes the user type in their old password,
        //then they much enter in the new password and confirm it
        //when submitted handle change sends the request to the server 
        <form id='changePassForm'
            name='chnagePassForm'
            onSubmit={handlePassChange}
            action="/changePassword"
            method="POST"
            className='mainForm'>

            {/* build the form with the apropriate text fields */}
            <label htmlFor="currentPass">Current Password:</label>
            <input id='currentPass' type="text" name='currentPass' placeholder='Current Password' />

            <label htmlFor="newPass">New Password:</label>
            <input id='newPass' type="text" name='currentPass' placeholder='New Password' />

            <label htmlFor="confirmNew ">Confirm New Password:</label>
            <input id='confirmNew' type="text" name='confirmNew' placeholder='Confirm New Password' />

            <input type="submit" className='saveButton' value='Save Password' />


        </form>


    );


};

const init = () => {

    const root = createRoot(document.getElementById('content'));
    root.render(<ChangePassWindow />);

}

window.onload = init;