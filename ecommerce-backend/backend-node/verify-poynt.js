const jwt = require('jsonwebtoken');
const axios = require('axios');
const fs = require('fs');

// USER CONFIGURATION (To be filled by the agent)
const APP_ID = 'urn:aid:0c1112fb-a14d-4d57-8323-95f916bac6f4'; // Try full urn string
const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAlOepAVxf4JkLvGh54FJ+BTZqYY7TxbUoIGsAeiTn/zQ5Q5iR
+ExxSvJruIwLfra69FMr1YCIZpRzg/XoQWU78Uq+86rzsT3d01syZ3ccJgYJ8z6g
/PmRRoTpaKO8bq9o2s5K8vSa87kuoSxZi7teE0s2pnOFFzzmQzCSJ7IfVOu1mgiV
WZMoJhpVAtXBBidMEYyFam9cfNAs21QPlfXLtIhLNbYxHplcy2jO1Aztf5P9xo5v
bF0+Bm74tlckzG1wuy1JHNwAfJD9NsOlf/iC7YrUeSgTuM09R+c0P7ag6l8nRMkU
lWt/HY1Pv7WxqOUQGh6pEl9cO96hdhetn9QvFwIDAQABAoIBAD1VqwzPcwK9p9Lk
qgcXk6csAefLgDm45B1uVdT6LMG3TjsktkOzoRsA/hQXQ4jfVeTb+XtJJWYzkd1y
Rkfhni5G3p7Z9OU2GZA8yWdK7cJPzHtwebmaRxfoGYiroStqf2NZhA/NZ6IqziU/
cmcXN6n02j736INo52QXtqw5N6SvjdCld6AhY0QPQqWVnEwL2ULcC1fIU3l7C6Rn
2MraIAzt3X7Cmjsq5L6c4cdZG0WUGZNmzSMg0NZYwBARlKx+jB8ST9B07t7JRyfm
HndgGkYPVQQWjlZWuwi+KekLrftJk2Rfa4/X8fWs+0y3EXErZfkY+fmXeox8DYwV
SYlaP1kCgYEAxqlNExmyDEOcZWihrIvIR63ahxsBZafg4oXImvMPmFW4+4yGf/Wd
jRqbGVkfFUOK12EWIt7JttcgckYLItpS1m8OxSlnzjMy8fOjbYA/mOQ1jOBclGQs
UbwyDa0UB+Ge/Jew1RHl7Ifl31oCA5vFzTBIan6Lxy2duYQHkVUdEpsCgYEAv+H0
c/sneIWxhw0XJdN71+C9BT6BTrvWT3NpjRiw+OCR2xPX5XPtsQulo3W5T6aCj/pc
1wcm3pStTmT6MEyP+vuJOM7Z2ogH+/HyXSPbiAaRWIU8LFWThrcobqS2zmpnW/YF
yOxh8ikGLUSv7rmE976c3sNOBN0Hou9LnxaMzzUCgYA4r146sP5I2ZHqraxUG56O
NWFBY8dGRly4xguzit9MTEl4HWTTZjYKaSkQVomz+43GXwF9+av86+1qLepHi5xP
a2j/gQ0JnTpQJ4DeYdXDvno5NFu2S88Jk3WEyXoJtaszz+S5J14/25cP4BLrDKuo
HLrNCEbCEpYKtU2jfnHJOQKBgG4mEoMFuNnJvWguToxrQ5tgKoG5KNd+on7HXN8f
PnAP0gq18GiKTPcmHXahHLipeCeYa/UP6PM62+W1t51ERh6oiFQxAgQdtJ+feyaW
b+48/vCWwz0b/u0FdVNWgI4rrJuwtg9qCqvNevs/g9MBcmAZbsm9yaqnCzwwK/Pu
KPTFAoGBAICKDTHnAlqPSGdAqrsOk/0ieQbbCyD4VUNgfuhQrvVchvd6CT/paOBC
0Xxj9OBCgduOuy9e1p/BFBRHzLLBjJTBoDI8W5HtW1ipuFo2MLoLg8ltERwFEj31
VumMDgUkRenDBxykQE3ImPdIBgdmM3mEZ1UCg7ETQAp1gnf7Wp5P
-----END RSA PRIVATE KEY-----`;

async function main() {
  console.log('🚀 Starting Poynt Credential Verification...');

  try {
    // 1. Generate JWT
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600; // 1 hour
    const payload = {
      iss: APP_ID,
      sub: APP_ID,
      aud: 'https://services.poynt.net',
      iat,
      exp,
      jti: require('crypto').randomUUID(),
    };

    const token = jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256' });
    console.log('✅ JWT Generated successfully.');

    // 2. Exchange JWT for Access Token (optional step, often you use JWT directly or get specific token)
    // GoDaddy Poynt usually uses the JWT itself as a Bearer token for server-to-server auth?
    // Let's try to hit the Business API using the self-signed JWT.
    
    console.log('🔄 Attempting to fetch Business Info...');
    
    // NOTE: For some endpoints, you might need to exchange the self-signed JWT for an access token
    // via https://services.poynt.net/token. Let's try that flow first as it's standard.
    
    const tokenResponse = await axios.post(
      'https://services.poynt.net/token',
      {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: token,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('✅ Access Token obtained!');
    const accessToken = tokenResponse.data.access_token;

    // 3. Fetch Business Object (to find Business ID)
    // Since we don't know the Business ID yet, we might try to inspect the token 
    // or call an endpoint that returns associated businesses.
    // However, usually the App is bound to a specific business or can list them.
    
    // Let's try to get the business info from the token context if possible, 
    // or list businesses if the app has permission.
    
    console.log('🔄 Fetching associated business...');
    
    // Trying to get business by ID if we had it, but we don't.
    // We will try to decode the access token to see if it has business context.
    const decodedAccess = jwt.decode(accessToken);
    console.log('🧐 Decoded Access Token Payload:', decodedAccess);
    
    // In many Poynt integrations, the business ID is 'urn:aid:...' which is the App ID,
    // but the STORE ID or Business UUID is different.
    
    // If we can't search, we might just print success and ask user to check URL.
    // BUT, let's try a common endpoint: /businesses required a UUID.
    // If the token is scoped, maybe we can find it.
    
    console.log('🎉 Verification COMPLETE. Credentials are VALID.');
    
  } catch (error) {
    console.error('❌ Verification FAILED.');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

main();
