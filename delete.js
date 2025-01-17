document.getElementById('authenticationButton').addEventListener('click', authenticate);
document.getElementById('deleteEmailBtn').addEventListener('click', deleteEmail);
localStorage.setItem('counter_for_batch_delete')
async function authenticate() {
    const clientId = "899840722714-ecnpbl7l6gpgmdqm05it3k35shk4jtve.apps.googleusercontent.com";
    const redirectUri = "http://127.0.0.1:5500/delete.html";
    const scope = 'https://mail.google.com/';
    const authEndpoint = 'https://accounts.google.com/o/oauth2/auth';
    const authUrl = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&include_granted_scopes=true`;
    window.location.href = authUrl;
    localStorage.setItem('access_token', new URLSearchParams(window.location.hash.substring(1)).get('access_token'));
    //console.log(window.location.hash);
}

async function getEmailId(smtp_id) {
    console.log(localStorage.getItem('access_token'));
    try {

        const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=rfc822msgid:${smtp_id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem(access_token)}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response}`);
        }
        const data = await response.json();
        console.log(data.messages[0].id);
        const messages = data.messages || [];

        if (messages.length > 0) {
            return messages[0].id;
        } else {
            throw new Error('No email with this smtp_id');
        }
    }   catch(error) {
        console.log(error);
        return null;
    }
}

async function getEmailsFromAddr(address) {
    try {
        const at = address.indexOf('@');
        const prefix = address.substring(0, at);
        const suffix = address.substring(at + 1);
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
        if (data.messages.length == 0) {
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
    var userId = 'me'
    //var smtp_id = '<fdGLjOGAP-UzE2RiUcPz0Q@notifications.google.com>'
    const email_ids = await getEmailsFromAddr('uber@uber.com');
    console.log(email_ids);


    try {
        console.log(localStorage.getItem('access_token'))
        const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/batchDelete`, {
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

        console.log(`Delete successful: ${email_ids.length} messages deleted.`);
    } catch (error) {
        console.error(error);
    }
}

    


  