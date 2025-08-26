Aug 26:
- Addressed issue of access code being in url by using PKCE
- Earlier, I had to click on authorize twice before an access_token would get populated in local storage. This was because handleRedirect()
  ran immediately after redirectToOAuthClient(), so the client hadn't fully been redirected back to the application. Therefore we couldn't request
  google for an access token. This was fixed by moving the location of handleRedirect(); upon a redirect, this method will run first and the application
  should have the access token now.

To-dos:
- First prompt user to authorize, then prompt them to delete emails. Modify UI somehow to do this.
- Generally make this look more visually appealing.
