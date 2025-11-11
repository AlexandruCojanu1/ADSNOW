// Email clipboard functionality
document.addEventListener("DOMContentLoaded", function(){
  const emailLink = document.querySelector(".contact-email");
  if (emailLink){
    const originalText = emailLink.textContent;
    emailLink.addEventListener("click", function(e){ 
      e.preventDefault(); 
      navigator.clipboard.writeText("algodigitalsolutions@gmail.com").then(() => { 
        emailLink.textContent = "transmission sent to clipboard"; 
        setTimeout(() => { 
          emailLink.textContent = originalText; 
        }, 2000); 
      }).catch(() => { 
        window.location.href = "mailto:algodigitalsolutions@gmail.com"; 
      }); 
    });
  }
});

