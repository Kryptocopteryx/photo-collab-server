const fs = require('fs');
const { google } = require('googleapis');

// Load credentials from downloaded JSON
const credentials = require('./credentials.json'); // Your OAuth client credentials

const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

// // Generate auth URL (one-time manual step)
// const authUrl = oAuth2Client.generateAuthUrl({
//   access_type: 'offline',
//   scope: ['https://www.googleapis.com/auth/drive.file'], // Only file creation/upload
// });

// console.log('Authorize this app by visiting this url:', authUrl);

// getToken(process.env.TOKEN);

async function getToken(code) {
  const { tokens } = await oAuth2Client.getToken(code);
  fs.writeFileSync('token.json', JSON.stringify(tokens));
  console.log('Token stored to token.json');
}

module.exports = { oAuth2Client, getToken };
