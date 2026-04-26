/* Takes in an error message. Sets the error message up in html, and
   displays it to the user. Will be hidden by other events that could
   end in an error.
*/
const handleError = (message) => {
  document.getElementById('errorMessage').textContent = message;
  document.getElementById('domoMessage').classList.remove('hidden');
};

/* Sends post requests to the server using fetch. Will look for various
   entries in the response JSON object, and will handle them appropriately.
*/
const sendPost = async (url, data, handler) => {

  //see if the incoming data is a formdata or not
  const isFormData = data instanceof FormData;

  const response = await fetch(url, {
    method: 'POST',
    
    //if the data is formdata, then donr't set the header. otherwise set it to json and stringify it
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    body: isFormData ? data : JSON.stringify(data),
  });

  const result = await response.json();
  document.getElementById('domoMessage').classList.add('hidden');

  if(result.redirect) {
    window.location = result.redirect;
  }

  if(result.error) {
    handleError(result.error);
  }

  if(handler) {
    handler(result);
  }
};

const hideError = () => {

    document.getElementById('domoMessage'). classList.add('hidden');
};

module.exports = {
    handleError, sendPost, hideError
}