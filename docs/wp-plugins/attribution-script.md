<script>
(function() {
console.log('🔥 ATTRIBUTION SCRIPT LOADED AND RUNNING');

  // --- 1. CLASSIFICATION LOGIC (Organic/Social/AI) ---
  function classifyTraffic() {
    var ref = document.referrer;
    if (!ref) return null;
    
    try {
        var url = new URL(ref);
        var domain = url.hostname.toLowerCase();
        
        // Ignore internal navigation
        if (domain.indexOf(window.location.hostname) > -1) return null;

        // AI / LLMs
        var aiTools = ['chatgpt.com', 'openai.com', 'claude.ai', 'gemini.google.com', 'bard.google.com', 'bing.com/chat'];
        if (aiTools.some(function(x){ return domain.indexOf(x) > -1; })) {
            return { utm_source: domain.replace('www.', ''), utm_medium: 'ai-referral' };
        }

        // Social Media
        var social = ['facebook.', 't.co', 'twitter.', 'x.com', 'linkedin.', 'instagram.', 'pinterest.', 'reddit.', 'tiktok.', 'youtube.'];
        if (social.some(function(x){ return domain.indexOf(x) > -1; })) {
            var src = domain.replace('www.', '');
            if (domain.includes('t.co') || domain.includes('x.com')) src = 'twitter';
            return { utm_source: src, utm_medium: 'social' };
        }

        // Search Engines
        var search = ['google.', 'bing.', 'yahoo.', 'duckduckgo.', 'baidu.', 'ecosia.'];
        if (search.some(function(x){ return domain.indexOf(x) > -1; })) {
            return { utm_source: domain.replace('www.', ''), utm_medium: 'organic' };
        }

        // General Referral
        return { utm_source: domain, utm_medium: 'referral' };
        
    } catch (e) { return null; }
  }

  // --- 2. DATA COLLECTION & MAPPING ---
  // We track 'utm_term' in the URL because that is the standard param
  var KEYS = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content","gclid","fbclid","coupon","landing_page"];

  function parseQuery() {
    var out = {};
    var q = window.location.search.replace(/^\?/, "");
    
    // A. Parse existing URL params
    if (q) {
        q.split("&").forEach(function(pair) {
          if (!pair) return;
          var parts = pair.split("=");
          var k = decodeURIComponent(parts[0] || "");
          var v = decodeURIComponent(parts[1] || "");
          if (k) out[k] = v;
        });
    }

    // B. Classify Referrer if explicit source is missing
    if (!out.utm_source) {
        var classification = classifyTraffic();
        if (classification) {
            out.utm_source = classification.utm_source;
            out.utm_medium = classification.utm_medium;
            out.utm_campaign = '(organic/referral)';
        } else if (!sessionStorage.getItem('utm_source')) {
             // If no URL data, no Referrer, and no history -> Direct
             out.utm_source = 'direct';
             out.utm_medium = '(none)';
        }
    }
    
    // C. Capture Landing Page (First Touch)
    if (!sessionStorage.getItem('landing_page')) {
        out.landing_page = window.location.pathname;
    }

    return out;
  }

  // Save to Storage (Persistence)
  var incoming = parseQuery();
  KEYS.forEach(function(k){ if (incoming[k]) sessionStorage.setItem(k, incoming[k]); });

  // Read from Storage
  var stored = {};
  KEYS.forEach(function(k){ var v = sessionStorage.getItem(k); if (v) stored[k] = v; });

  // --- 3. URL DECORATION ---
  function decorate() {
    if (!Object.keys(stored).length) return;
    
    // Filter out internal fields we don't want visible in the Main Browser URL
    var urlParams = {};
    Object.keys(stored).forEach(function(k) {
        // We exclude landing_page here to keep the address bar clean
        if (k !== 'landing_page') urlParams[k] = stored[k];
    });

    if (!Object.keys(urlParams).length) return;
    var sp = new URLSearchParams(urlParams).toString();

    // Browser Bar Update (so external scripts can read it if needed)
    if (!window.location.search || !Object.keys(urlParams).every(function(k){return window.location.search.indexOf(k+'=')>-1;})) {
      window.history.replaceState({}, "", window.location.pathname + "?" + sp);
    }

    // Internal Link Update (Keep session alive across pages)
    var links = document.querySelectorAll("a[href]");
    for (var i=0; i<links.length; i++) {
      try {
        var href = links[i].getAttribute("href");
        var url = new URL(href, window.location.origin);
        if (url.origin === window.location.origin) {
            Object.keys(urlParams).forEach(function(k){ url.searchParams.set(k, urlParams[k]); });
            links[i].setAttribute("href", url.pathname + "?" + url.searchParams.toString());
        }
      } catch(e) {}
    }
  }

  // --- 4. FORM FILLING ---
  function populateFields() {
    if (!Object.keys(stored).length) return;

    Object.keys(stored).forEach(function(k){
      var val = stored[k];
      
      // MAPPING LOGIC: Map 'utm_term' (URL) to 'utm_keyword' (Form Field)
      var fieldName = k;
      if (k === 'utm_term') fieldName = 'utm_keyword';

      // Selectors: Data-Q (GHL), Name (Standard), Class (Gravity/WP)
      var nodes = document.querySelectorAll(
        // Look for the exact key (e.g. utm_source)
        'input[data-q="'+k+'"], input[name="'+k+'"], .'+k+' input, input.'+k+',' +
        // Look for the mapped key (e.g. utm_keyword)
        'input[data-q="'+fieldName+'"], input[name="'+fieldName+'"], .'+fieldName+' input, input.'+fieldName
      );

      for (var i=0; i<nodes.length; i++) {
        var field = nodes[i];
        if (field.value !== val) {
          field.value = val;
          // Dispatch events for React/GHL forms
          field.dispatchEvent(new Event("input",  { bubbles: true }));
          field.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    });
  }

  // --- 5. GHL IFRAME PATCH (UPDATED) ---
  function patchGHLIframes() {
      // Specifically targets your GHL widgets
      var iframes = document.querySelectorAll('iframe[src*="link.cyberizegroup.com"]');
      if (iframes.length === 0 || !Object.keys(stored).length) return;

      iframes.forEach(function(iframe) {
          try {
              var currentSrc = new URL(iframe.src);
              var needsUpdate = false;
              
              Object.keys(stored).forEach(function(k) {
                  // We now pass EVERYTHING (including landing_page) to the iframe
                  if (!currentSrc.searchParams.has(k)) {
                      currentSrc.searchParams.set(k, stored[k]);
                      needsUpdate = true;
                  }
              });

              // Force reload iframe if parameters were missing
              if (needsUpdate) iframe.src = currentSrc.toString();
          } catch(e) {}
      });
  }

  function wireUp() {
    decorate();
    patchGHLIframes();
    populateFields();
  }

  // Execution triggers
  document.addEventListener("DOMContentLoaded", wireUp);
  window.addEventListener("load", function(){ setTimeout(wireUp, 0); });
  
  // Retry interval for slow-loading forms
  var tries = 0, interval = setInterval(function(){
    tries++;
    wireUp();
    if (tries >= 10) clearInterval(interval);
  }, 500);

})();
</script>
