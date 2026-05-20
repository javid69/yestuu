const http = require('http');

// 1. Login to get cookie
const loginData = JSON.stringify({
  username: 'admin',
  password: 'Admin123!'
});

const req = http.request({
  hostname: 'localhost',
  port: 5500,
  path: '/api/admin/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Login status:', res.statusCode);
    const cookie = res.headers['set-cookie'];
    console.log('Cookies received:', cookie);
    if (cookie) {
      testUpload(cookie[0]);
    } else {
      console.error('Failed to get auth cookie');
    }
  });
});

req.on('error', (err) => {
  console.error('Login request error:', err);
});

req.write(loginData);
req.end();

function testUpload(cookie) {
  // Construct multipart/form-data request manually to avoid dependencies
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const filename = 'test.png';
  const fileContent = 'fake png data';
  
  let body = '';
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`;
  body += 'Content-Type: image/png\r\n\r\n';
  body += fileContent + '\r\n';
  body += `--${boundary}--\r\n`;

  const uploadReq = http.request({
    hostname: 'localhost',
    port: 5500,
    path: '/api/upload',
    method: 'POST',
    headers: {
      'Cookie': cookie,
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': Buffer.byteLength(body)
    }
  }, (res) => {
    let uploadData = '';
    res.on('data', chunk => uploadData += chunk);
    res.on('end', () => {
      console.log('Upload status:', res.statusCode);
      console.log('Upload response:', uploadData);
    });
  });

  uploadReq.on('error', (err) => {
    console.error('Upload request error:', err);
  });

  uploadReq.write(body);
  uploadReq.end();
}
