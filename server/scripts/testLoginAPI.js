const http = require('http');

function testLoginAPI() {
  const postData = JSON.stringify({
    email: 'demo@unifit.com',
    password: 'demo123'
  });

  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    },
    timeout: 5000
  };

  console.log('🧪 Testing Login API...\n');
  console.log('Request:', {
    method: options.method,
    url: `http://${options.hostname}:${options.port}${options.path}`,
    body: JSON.parse(postData)
  });

  const req = http.request(options, (res) => {
    let data = '';

    console.log(`\n📊 Response Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}\n`);

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        console.log('✅ Response Body:');
        console.log(JSON.stringify(parsedData, null, 2));
      } catch (e) {
        console.log('Raw Response:');
        console.log(data);
      }
      process.exit(0);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Server is not running on port 5001');
    }
    process.exit(1);
  });

  req.on('timeout', () => {
    console.error('❌ Request Timeout - Server did not respond');
    req.destroy();
    process.exit(1);
  });

  req.write(postData);
  req.end();
}

testLoginAPI();
