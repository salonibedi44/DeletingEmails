document.getElementById('authenticationButton').addEventListener('click', authenticate);
document.getElementById('deleteEmailBtn').addEventListener('click', deleteEmail);
localStorage.setItem('counter_for_batch_delete')
async function authenticate() {
    const redirectUri = "http://127.0.0.1:5500/delete.html";
    const scope = 'https://mail.google.com/';
    const authEndpoint = 'https://accounts.google.com/o/oauth2/auth';
    const authUrl = `${authEndpoint}?client_id=${localStorage.getItem('google_client_id')}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&include_granted_scopes=true`;
    window.location.href = authUrl;
    localStorage.setItem('access_token', new URLSearchParams(window.location.hash.substring(1)).get('access_token'));
}

async function getEmailsFromAddr(email_address) {
    /*
    Gets the email ids from the email address. 
    Accepts: email_address (string)
    Returns: ids (array of strings)
    Throws: Error if there is an issue with the request
    */
    try {
        const at = email_address.indexOf('@');
        const prefix = email_address.substring(0, at);
        const suffix = email_address.substring(at + 1);
        const query = `q=from%3A${prefix}%40${suffix}`
        const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${query}`, { 
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('access_token')}`,
                "Accept" : "application/json"
        }});

        if (!response.ok) {
            throw new Error(`Error: ${response}`);
        }

        const data = await response.json();
        console.log(data)
        if (data?.messages?.length == null || data?.messages?.length == 0) {
            if (localStorage.getItem('count_batches') > 0) {
                alert("All emails from this address deleted!")
            } else {
                alert("You received no emails from this address!");
            }
            return null;
        }
        const ids = data.messages.map(element => element.id);
        return ids;
    } catch(error) {
        console.log(error);
        return null;
    }
}

async function deleteEmail() {
    /*
    Deletes the emails from the email address. 
    Accepts: None
    Returns: None
    Throws: Error if there is an issue with the request
    */

    //var smtp_id = '<fdGLjOGAP-UzE2RiUcPz0Q@notifications.google.com>'
    var email_address = document.getElementById('emailInput').value
    const email_ids = await getEmailsFromAddr(email_address);

    if (email_ids == null) {
        return;
    }

    try {
        const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/batchDelete`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('access_token')}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ids: email_ids})
        });

        if (!response.ok) {
            throw new Error("Issue with deleting emails");
        } 

        var success_message = `Delete successful: ${email_ids.length} messages deleted.`
        localStorage.setItem('count_batches', localStorage.getItem('count_batches') + 1)

        var time = 2000
        document.getElementById('success').innerHTML = success_message
        setTimeout(() => {
            document.getElementById('success').innerHTML = ''
        }, time)
    } catch (error) {
        console.error(error);
    }
}

    


  