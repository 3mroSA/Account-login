document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'

            },
            body: JSON.stringify({ username, password }),
        });

        console.log(response)

        if (!response.ok) {
            const result = await response.json(); 
            console.error('Error:', result.message); 
            document.getElementById('responseMessage').innerText = 'Error: ' + result.message;
        } else {
            const result = await response.json(); 
            document.getElementById('responseMessage').innerText = 'Login successful: ' + result.message;

            localStorage.setItem('auth', result.auth)
window.location.replace('dashboard.html')
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('responseMessage').innerText = 'Error: Unable to reach the server';
    }
});

window.onload = async function() {

    const token = localStorage.getItem('auth'); 

    if (!token) {
    } else {
        try {
            const response = await fetch('http://localhost:3000/api/verify', {
                method: 'POST',  
                headers: {
                    'Authorization': `Bearer ${token}`,  
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'

                }
            });
    
            if (!response.ok) {
                const result = await response.json();
                localStorage.removeItem('auth');
                window.location.replace('public/index.html')
                
            }
    
            const result = await response.json();
              

            window.location.replace('dashboard.html')
        } catch (error) {
            console.error('Error verifying token:', error.message);
        }
    }
    
    
    
}
