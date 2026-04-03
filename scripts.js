// Client-side handler for idea submissions
(function(){
  const FORM_ID = 'idea-form';
  const STORAGE_KEY = 'alpha_idea_submissions';

  function qs(id){ return document.getElementById(id); }

  function loadSubmissions(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch(e){ return []; }
  }

  function saveSubmission(sub){
    const all = loadSubmissions();
    all.push(sub);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  function showSuccess(message){
    const el = qs('idea-success');
    if(!el) return;
    el.textContent = message || 'Thanks — your idea was saved.';
    el.hidden = false;
    setTimeout(()=> el.hidden = true, 4000);
  }

  async function handleSubmit(e){
    e.preventDefault();
    const form = e.target;
    const name = qs('name').value.trim();
    const email = qs('email').value.trim();
    const type = qs('type').value;
    const description = qs('description').value.trim();

    if(!name || !email || !description){
      showSuccess('Please fill required fields.');
      return;
    }

    const submission = {
      name, email, type, description,
      created_at: new Date().toISOString()
    };

    // Always save locally first as a fallback
    saveSubmission(submission);

    // EmailJS configuration placeholders - replace with your IDs
    const EMAILJS_SERVICE_ID = 'service_o0khvau';
    const EMAILJS_TEMPLATE_OWNER = 'template_8otb40f';
    const EMAILJS_TEMPLATE_REPLY = 'template_8otb40f';
    const OWNER_EMAIL = 'alphapayee1@gmail.com';

    // Prepare template params for owner notification
    const ownerParams = {
      to_email: OWNER_EMAIL,
      from_name: name,
      from_email: email,
      project_type: type,
      description: description,
      submitted_at: submission.created_at
    };

    // Prepare template params for auto-reply to submitter
    const replyParams = {
      to_email: email,
      from_name: 'Alpha Code Concepts',
      message: `Thanks ${name}! We received your idea and will review it shortly.`,
      original_description: description,
      submitted_at: submission.created_at
    };

    // If EmailJS is available, try sending owner notification and auto-reply
    if(window.emailjs && typeof emailjs.send === 'function'){
      try{
        // Disable submit button while sending
        const submitBtn = form.querySelector('button[type="submit"]');
        if(submitBtn) submitBtn.disabled = true;

        // Send owner notification and auto-reply in parallel
        await Promise.all([
          emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_OWNER, ownerParams),
          emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_REPLY, replyParams)
        ]);

        showSuccess('Thanks — your idea was sent.');
        form.reset();
      }catch(err){
        console.warn('EmailJS send failed', err);
        showSuccess('Saved locally — email sending failed.');
      }finally{
        const submitBtn = form.querySelector('button[type="submit"]');
        if(submitBtn) submitBtn.disabled = false;
      }
    }else{
      // EmailJS not configured - inform user it's saved locally
      showSuccess('Saved locally. Email sending not configured.');
      form.reset();
    }
  }

  function init(){
    const form = qs(FORM_ID);
    if(form) form.addEventListener('submit', handleSubmit);
  }

  // If on submissions.html, expose a small renderer
  function renderSubmissionsOnPage(){
    const listRoot = document.getElementById('submissions-root');
    if(!listRoot) return;
    const items = loadSubmissions();
    if(items.length === 0){ listRoot.innerHTML = '<p>No submissions yet.</p>'; return; }
    listRoot.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'submissions-list';
    items.reverse().forEach(it => {
      const el = document.createElement('div');
      el.className = 'submission-item';
      el.innerHTML = `<strong>${escapeHtml(it.name)}</strong> <small>(${escapeHtml(it.type)})</small>
        <div style="color:var(--muted)">${escapeHtml(it.email)} • ${new Date(it.created_at).toLocaleString()}</div>
        <p style="margin-top:8px">${nl2br(escapeHtml(it.description))}</p>`;
      container.appendChild(el);
    });
    listRoot.appendChild(container);
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]; }); }
  function nl2br(s){ return s.replace(/\n/g,'<br>'); }

  // Clear submissions (used on submissions page)
  function clearSubmissions(){
    if(!confirm('Clear all saved submissions?')) return;
    localStorage.removeItem(STORAGE_KEY);
    renderSubmissionsOnPage();
  }

  document.addEventListener('DOMContentLoaded', function(){
    init();
    renderSubmissionsOnPage();
    const clearBtn = document.getElementById('clear-submissions');
    if(clearBtn) clearBtn.addEventListener('click', clearSubmissions);
  });

})();
