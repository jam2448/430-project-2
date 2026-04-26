
const helper = require('./helper.js');
const React = require('react');
const { createRoot } = require('react-dom/client');
const { useState, useEffect } = React;


//sends a post request to the helper when the user clicks a button to change
//their plan
const handlePlanChange = (e) => {

    e.preventDefault();
    helper.hideError();

    const plan = e.target.value;

    helper.sendPost('/updatePlan', { plan });
    //window.location.reload(false);
}




//setup the window of the two plans

const PlanWindow = (props) => {


    //using useffect to fetch the account information.
    // Specifically the plan to set the buttons accordingly
    const [plan, setPlan] = useState('Free');

    useEffect(() => {
        const loadPlan = async () => {
            const response = await fetch('/getAccount');
            const data = await response.json();
            setPlan(data.accountType);
            console.log(data.accountType);
        };
        loadPlan();
    }, []);

    return (

        <div id='plans'>

            <div id='freeModel'>
                <h2>Free Model</h2>
                <ul>
                    <li>Store Up To 3 Recipes</li>
                </ul>

                {/* change the button text based on the plan the account has */}
                <button id="freeButton" value='Free' onClick={handlePlanChange}>
                    {plan === 'Free' ?  'Active Plan' : 'Choose Plan'}  
                </button>

            </div>

            <div id='premiumModel'>

                <h2>Premium Model</h2>
                <ul>
                    <li>Store Unlimited Recipes</li>
                </ul>
                {/* change the button text based on the plan the account has */}
                <button id="premiumButton" value='Premium' onClick={handlePlanChange}>
                    {plan === 'Premium' ?  'Active Plan' : 'Choose Plan'}  
                </button>
            </div>

        </div>
    );

}

// const PlanPage = () => {

//     //creating a reload hook to auto reload the page when changed
//     const [reload, setReload] = useState(false);

//     return(
//         <PlanWindow triggerReload={() => setReload(!reload)}/>
//     );



// }

const init = () => {
    const root = createRoot(document.getElementById('profitModels'));
    root.render(<PlanWindow/>);
}

window.onload = init;