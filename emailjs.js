// Dynamically load EmailJS SDK and initialize with public key
(function(){
  const PUBLIC_KEY = 'oYE28d1ofH4njHc_6';

  function initIfReady(){
    try{
      if(window.emailjs && typeof emailjs.init === 'function'){
        emailjs.init(PUBLIC_KEY);
        return true;
      }
    }catch(e){ /* ignore */ }
    return false;
  }

  // If EmailJS already present, initialize now
  if(initIfReady()) return;

  // If a loader script already exists, attach onload to initialize
  const existing = document.querySelector('script[data-emailjs-sdk]');
  if(existing){
    existing.addEventListener('load', initIfReady);
    return;
  }

  // Otherwise, inject the SDK script
  const s = document.createElement('script');
  s.src = 'https://cdn.emailjs.com/sdk/3.2.0/email.min.js';
  s.async = true;
  s.setAttribute('data-emailjs-sdk','true');
  s.onload = function(){ initIfReady(); };
  s.onerror = function(){ console.warn('emailjs: failed to load SDK'); };
  document.head.appendChild(s);
})();
