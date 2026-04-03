// Dynamically load EmailJS SDK and initialize with public key
(function(){
  const PUBLIC_KEY = 'oYE28d1ofH4njHc_6';

  function initIfReady(){
    try{
      if(window.emailjs && typeof emailjs.init === 'function'){
        emailjs.init(PUBLIC_KEY);
        window.emailjsLoaded = true;
        return true;
      }
    }catch(e){ /* ignore */ }
    return false;
  }

  const CDNS = [
    // Prefer local copy when hosted on GitHub Pages (reliable under your domain)
    '/vendor/email.min.js',
    'https://cdn.emailjs.com/sdk/3.2.0/email.min.js',
    'https://cdn.jsdelivr.net/npm/emailjs-com@3.2.0/dist/email.min.js',
    'https://unpkg.com/emailjs-com@3.2.0/dist/email.min.js'
  ];

  // If EmailJS already present, initialize now
  if(initIfReady()) return;

  // If a loader script already exists, attach onload to initialize
  const existing = document.querySelector('script[data-emailjs-sdk]');
  if(existing){
    existing.addEventListener('load', initIfReady);
    existing.addEventListener('error', function(){ console.warn('emailjs: existing SDK script failed to load'); });
    return;
  }

  let index = 0;
  function tryLoadNext(){
    if(index >= CDNS.length){
      console.warn('emailjs: failed to load SDK from all CDNs:', CDNS);
      window.emailjsLoaded = false;
      window.emailjsLoadError = true;
      return;
    }

    const url = CDNS[index++];
    const s = document.createElement('script');
    s.src = url;
    s.async = true;
    s.setAttribute('data-emailjs-sdk','true');
    s.onload = function(){
      if(initIfReady()){
        console.info('emailjs: loaded SDK from', url);
        return;
      }
      // If loaded but init failed, try next
      console.warn('emailjs: SDK loaded but initialization failed at', url);
      tryLoadNext();
    };
    s.onerror = function(ev){
      console.warn('emailjs: failed to load SDK from', url, ev && ev.type);
      // small backoff before trying next
      setTimeout(tryLoadNext, 500);
    };
    document.head.appendChild(s);
  }

  tryLoadNext();

})();
