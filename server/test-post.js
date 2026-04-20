const form = new FormData();
form.append('name', 'John Doe');
form.append('mobile', '9876543210');
form.append('pnr', '1234567890');
form.append('type', 'Service-related');
form.append('description', 'Test issue');

fetch('http://localhost:5000/api/complaints', {
    method: 'POST',
    body: form
}).then(res => res.json().then(data => console.log(res.status, data))).catch(console.error);
