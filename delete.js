document.getElementById('authenticationButton').addEventListener('click', authenticate);
document.getElementById('deleteEmailBtn').addEventListener('click', deleteEmail);
localStorage.setItem('email_addresses_of_deleted_emails', JSON.stringify([...(new Set())]))

// Check if user is returning from OAuth redirect
handleRedirect();

import {Codes} from "./code_generation.js"



async function redirectToOAuthClient() {
    const codeVerifier = Codes.generate_code_verifier();
    const codeChallenge = await Codes.challenge_from_verifier(codeVerifier);
    localStorage.setItem('code_verifier', codeVerifier)

    const scope = 'https://mail.google.com/';
    const authUrl = `https://accounts.google.com/o/oauth2/auth?` + 
                    `client_id=${localStorage.getItem('google_client_id')}` + 
                    `&redirect_uri=${localStorage.getItem('redirect_uri')}` + 
                    `&response_type=code` + 
                    `&scope=${scope}` + 
                    `&include_granted_scopes=true` + 
                    `&code_challenge=${codeChallenge}` + 
                    `&code_challenge_method=S256`
    window.location.href = authUrl;
}

async function handleRedirect() {
    if (localStorage.getItem('access_token') != null) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) {
        console.error("No code challenge detected in url!")
        return;
    }

    
    localStorage.setItem("params_handle_redirect", params)
    const data = {
        client_id: localStorage.getItem('google_client_id'),
        code: code,
        redirect_uri: localStorage.getItem('redirect_uri'),
        grant_type: 'authorization_code',
        code_verifier: localStorage.getItem('code_verifier')
    }



    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams(data)
    });
    
    const tokens = await response.json();
    localStorage.setItem('reponse_with_access_token', JSON.stringify(tokens, null, 2))

    const authToken = tokens['access_token']
    localStorage.setItem('access_token', authToken)

}

async function authenticate() {
    redirectToOAuthClient();
}

async function getEmailsFromAddr(email_address) {

    // Gets the email ids from the email address. 
    // Accepts: email_address (string)
    // Returns: ids (array of strings)
    // Throws: Error if there is an issue with the request


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
        console.log("HERE IS THE DATA:")
        console.log(data)
        if (data?.messages?.length == null || data?.messages?.length == 0) {
            if (new Set(JSON.parse(localStorage.getItem('email_addresses_of_deleted_emails'))).has(email_address)) {
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
    // Deletes the emails from the email address. 
    // Accepts: None
    // Returns: None
    // Throws: Error if there is an issue with the request

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

        //Add email address to this set so we know that we've interacted with this email and can give an alert message in getEmailsFromAddr() accordingly
        var email_addresses = new Set(JSON.parse(localStorage.getItem('email_addresses_of_deleted_emails')))
        if (!(email_addresses.has(email_address))) {
            email_addresses.add(email_address)
            localStorage.setItem('email_addresses_of_deleted_emails', JSON.stringify([...email_addresses]))
        }

        var time = 2000
        document.getElementById('success').innerHTML = success_message
        setTimeout(() => {
            document.getElementById('success').innerHTML = ''
        }, time)
    } catch (error) {
        console.error(error);
    }
}

    