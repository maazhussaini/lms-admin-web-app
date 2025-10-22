const axios = require('axios');

async function testDeleteTenant() {
  try {
    console.log('Testing DELETE tenant 10 (already deleted)...');
    const response = await axios.delete('http://localhost:3000/api/v1/tenants/10', {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // You may need to add valid token
      }
    });
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.log('Error Status:', error.response.status);
      console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testDeleteTenant();
