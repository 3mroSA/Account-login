
window.onload = async function() {

    const token = localStorage.getItem('auth'); 

    if (!token) {
        console.error('No token found');
        window.location.replace('signup.html') 
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
                window.location.replace('index.html')
                
            }
              
            
        } catch (error) {
            console.error('Error verifying token:', error.message);
            window.location.replace('signup.html')
        }
    }

    
    
}

const changeUser = async () => {
    const token = localStorage.getItem('auth');
    const newUsername = document.getElementById('newuname').value;
  
    try {
      const response = await fetch('http://localhost:3000/api/userchange', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ newname: newUsername }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        document.getElementById('uresponse').innerText = 'User updated successfully!';
        localStorage.setItem('auth', data.auth);
        setTimeout(() => {
            window.location.reload();
        }, 5000);
      } else {
        document.getElementById('uresponse').innerText = `Error: ${data.message}`
      }
    } catch (error) {
        document.getElementById('uresponse'). innerText = `Error: ${data.message}`
      console.error('Error: ', error);
    }
  };
  
  
