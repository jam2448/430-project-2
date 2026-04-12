const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');


const handleDomo = (e, onDomoAdded) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector("#name").value;
    const age = e.target.querySelector('#age').value;
    const diet = e.target.querySelector('#diet').value;

    if (!name || !age || !diet) {
        helper.handleError("All make fields are required");
        return false;
    }

    helper.sendPost(e.target.action, { name, age, diet }, onDomoAdded);
    return false;
}

const handleUpdate = (e, onDomoUpdated) => {

    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector("#name").value;
    const age = e.target.querySelector('#age').value;

    if (!name || !age) {
        helper.handleError("All Update fields are required");
        return false;
    }

    helper.sendPost(e.target.action, { name, age }, onDomoUpdated);
    return false;

}



const DomoForm = (props) => {
    return (
        <form id='domoForm'
            onSubmit={(e) => handleDomo(e, props.triggerReload)}
            name='domoForm'
            action='/maker'
            method='POST'
            className='domoForm'
        >

            <label htmlFor="name"> Name: </label>
            <input id='name' type="text" name='name' placeholder='Domo Name' />

            <label htmlFor="diet">Diet: </label>
            <input id="diet" type="text" name="diet" placeholder='domo diet' />

            <label htmlFor="age">Age: </label>
            <input id="age" type="number" name="age" min="0" />


            <input type="submit" className='makeDomoSubmit' value="Make Domo" />
        </form>
    );
};

const UpdateForm = (props) => {

    return (

        <form action="/updateDomo"
            name='updateForm'
            className='domoForm'
            method='POST'
            onSubmit={(e) => handleUpdate(e, props.triggerReload)}>

            <label htmlFor="name"> Name: </label>
            <input id='name' type="text" name='name' placeholder='Domo Update Name' />

            <label htmlFor="age">Updated Age: </label>
            <input id="age" type="number" name="age" min="0" />

            <input type="submit" className='makeDomoSubmit' value="Update Domo" />

        </form>


    );
}

const DomoList = (props) => {

    const [domos, setDomos] = useState(props.domos);

    useEffect(() => {
        const loadDomosFromServer = async () => {
            const response = await fetch('/getDomos');
            const data = await response.json();
            setDomos(data.domos);
        };
        loadDomosFromServer();
    }, [props.reloadDomos]);

    if (domos.length === 0) {

        return (
            <div className='domoList'>
                <h3 className='emptyDomo'>No Domos Yet!</h3>
            </div>
        );
    }

    const domoNodes = domos.map(domo => {
        return (

            <div key={domo.id} className='domo'>
                <img src="/assets/img/domoface.jpeg" alt="domo face" className='domoFace' />
                <h3 className='domoName'> Name: {domo.name}</h3>
                <h3 className='domoDiet'> Diet: {domo.diet}</h3>
                <h3 className='domoAge'> Age: {domo.age}</h3>
            </div>
        );
    });

    return (
        <div className='domoList'>
            {domoNodes}
        </div>
    );
}


const App = () => {

    const [reloadDomos, setReloadDomos] = useState(false);

    return (

        <div>
            <div id='makeDomo'>
                <DomoForm triggerReload={() => setReloadDomos(!reloadDomos)} />

            </div>
            <div id='updateDomo'>

                <UpdateForm triggerReload={() => setReloadDomos(!reloadDomos)}/>

            </div>

            <div id='domos'>
                <DomoList domos={[]} reloadDomos={reloadDomos} />

            </div>
        </div>

    );

};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
}

window.onload = init;