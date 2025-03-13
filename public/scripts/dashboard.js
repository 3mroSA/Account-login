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
    
    // user authenticated already ...
    
    try {
        const response = await fetch('http://localhost:3000/api/data', {
            method: 'GET',  
            headers: {
                'Authorization': `Bearer ${token}`,  
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'  

            }
        });
        
        const data = await response.json();
        const result = data.userobj
        
        const userfield = document.getElementById('user')
        const biofield = document.getElementById('bio')
        const emailfield = document.getElementById('email')
        const picture = document.getElementById('picture')
        
        userfield.innerText ="username: " + result.username
        biofield.innerText = "description: "+ result.description
        emailfield.innerText = "email: " + result.email
        picture.src = result.picture
    } catch (error) {
        console.error('Error', error.message);
    }
    
}