console.log('Loaded!');
var submit= document.getElementById('submit_btn');
submit.onClick = function() {
    
    var request = new XMLHttpRequest();
    
    request.onreadystatechange = function(){
        if(request.readyState === XMLHttpRequest.DONE)
        {
            if(requeststatus === 200){
                console.log("user logged in");
                alert("Log in success!!");
            }
            else if(requeststatus === 403)
            {
                alert("Incorrect password");
            }
            else if(requeststatus === 500)
            {
                alert("server Error");
            }
        }
    };
    
   
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    console.log(username);
    console.log(password);
    request.open('POST','http://jainil27.imad.hasura-app.io/login',true);
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({username:username,password:password}));
};