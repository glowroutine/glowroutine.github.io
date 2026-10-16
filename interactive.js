/* GlowRoutine — interactive features: Save/Favorites, Compare, Checklist, Newsletter */
(function(){
  var LS_FAV = 'glow_favorites_v1';
  var LS_BOUGHT = 'glow_bought_v1';

  function safeParse(key, fallback){
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch(e){ return fallback; }
  }
  function safeSet(key, val){
    try { localStorage.setItem(key, JSON.stringify(val)); } catch(e){}
  }

  function getFavorites(){ return safeParse(LS_FAV, []); }
  function setFavorites(list){ safeSet(LS_FAV, list); }
  function isFavorited(id){
    return getFavorites().some(function(f){ return f.id === id; });
  }
  function toggleFavorite(item){
    var list = getFavorites();
    var idx = -1;
    for (var i=0;i<list.length;i++){ if (list[i].id === item.id){ idx = i; break; } }
    if (idx === -1){ list.push(item); } else { list.splice(idx,1); }
    setFavorites(list);
    return idx === -1;
  }

  /* ---------- Extract products from a category page ---------- */
  function extractPageProducts(){
    var rows = document.querySelectorAll('.compare-table tr');
    var buyRows = document.querySelectorAll('main .buy-row');
    var products = [];
    for (var i = 1; i < rows.length; i++){
      var tds = rows[i].querySelectorAll('td');
      if (tds.length < 3) continue;
      var name = tds[0].textContent.trim();
      var tierEl = tds[1].querySelector('.mini-tag');
      var tierText = tierEl ? tierEl.textContent.trim() : '';
      var tierClass = 'mid';
      if (tierEl){
        if (tierEl.className.indexOf('low') !== -1) tierClass = 'low';
        else if (tierEl.className.indexOf('high') !== -1) tierClass = 'high';
        else tierClass = 'mid';
      }
      var bestFor = tds[2].textContent.trim();
      var buyRow = buyRows[i-1];
      var link = buyRow ? buyRow.querySelector('a.buy-btn') : null;
      products.push({
        idx: i-1,
        name: name,
        tier: tierText,
        tierClass: tierClass,
        bestFor: bestFor,
        buyLink: link ? link.href : '',
        buyRowEl: buyRow
      });
    }
    return products;
  }

  function pageMeta(){
    var h1 = document.querySelector('main h1');
    var metaEl = document.querySelector('.meta');
    return {
      pageUrl: window.location.pathname.split('/').pop() || 'index.html',
      pageTitle: h1 ? h1.textContent.trim() : document.title,
      group: metaEl ? metaEl.textContent.trim() : ''
    };
  }

  /* ---------- Favorites buttons on category pages ---------- */
  function initFavoriteButtons(){
    var products = extractPageProducts();
    if (!products.length) return;
    var meta = pageMeta();
    products.forEach(function(p){
      if (!p.buyRowEl) return;
      var id = meta.pageUrl + '#' + p.idx;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fav-btn';
      btn.setAttribute('aria-label', 'Save this pick');
      function render(){
        var fav = isFavorited(id);
        btn.innerHTML = fav ? '&#9829; Saved' : '&#9825; Save';
        btn.classList.toggle('is-fav', fav);
      }
      render();
      btn.addEventListener('click', function(){
        toggleFavorite({
          id: id, name: p.name, tier: p.tier, tierClass: p.tierClass,
          bestFor: p.bestFor, buyLink: p.buyLink,
          pageUrl: meta.pageUrl, pageTitle: meta.pageTitle, group: meta.group
        });
        render();
      });
      p.buyRowEl.insertBefore(btn, p.buyRowEl.firstChild);
    });
  }

  /* ---------- Comparator on category pages ---------- */
  var compareSelected = [];
  function initComparator(){
    var products = extractPageProducts();
    if (products.length < 2) return;

    var bar = document.createElement('div');
    bar.className = 'compare-bar';
    bar.innerHTML = '<span class="compare-bar-label"></span>' +
      '<button type="button" class="compare-bar-btn">Compare &#8594;</button>' +
      '<button type="button" class="compare-bar-clear">Clear</button>';
    document.body.appendChild(bar);
    var label = bar.querySelector('.compare-bar-label');
    var openBtn = bar.querySelector('.compare-bar-btn');
    var clearBtn = bar.querySelector('.compare-bar-clear');
    var checkboxes = [];

    function updateBar(){
      if (compareSelected.length >= 2){
        bar.classList.add('open');
        label.textContent = compareSelected.length + ' selected';
      } else {
        bar.classList.remove('open');
      }
    }

    products.forEach(function(p){
      if (!p.buyRowEl) return;
      var wrap = document.createElement('label');
      wrap.className = 'compare-check-wrap';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'compare-check';
      wrap.appendChild(cb);
      wrap.appendChild(document.createTextNode('Compare'));
      cb.addEventListener('change', function(){
        if (cb.checked){
          if (compareSelected.length >= 3){
            cb.checked = false;
            return;
          }
          compareSelected.push(p);
        } else {
          compareSelected = compareSelected.filter(function(x){ return x !== p; });
        }
        updateBar();
      });
      checkboxes.push(cb);
      p.buyRowEl.appendChild(wrap);
    });

    openBtn.addEventListener('click', function(){
      showCompareModal();
    });
    clearBtn.addEventListener('click', function(){
      compareSelected = [];
      checkboxes.forEach(function(cb){ cb.checked = false; });
      updateBar();
    });
  }

  function showCompareModal(){
    var existing = document.querySelector('.compare-modal-overlay');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.className = 'compare-modal-overlay';
    var cols = compareSelected.map(function(p){
      return '<div class="compare-col">' +
        '<span class="mini-tag ' + p.tierClass + '">' + p.tier + '</span>' +
        '<h4>' + p.name + '</h4>' +
        '<p>' + p.bestFor + '</p>' +
        '<a class="buy-btn" href="' + p.buyLink + '" target="_blank" rel="nofollow sponsored noopener">Check price on Amazon &#8594;</a>' +
      '</div>';
    }).join('');
    overlay.innerHTML = '<div class="compare-modal">' +
      '<button type="button" class="compare-modal-close" aria-label="Close">&times;</button>' +
      '<h3>Compare picks</h3>' +
      '<div class="compare-cols">' + cols + '</div>' +
    '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e){ if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('.compare-modal-close').addEventListener('click', function(){ overlay.remove(); });
  }

  /* ---------- Checklist on planner results (called externally after render) ---------- */
  function getBought(){ return safeParse(LS_BOUGHT, {}); }
  function setBought(obj){ safeSet(LS_BOUGHT, obj); }
  function initChecklistForGrid(gridEl){
    if (!gridEl) return;
    var bought = getBought();
    var cards = gridEl.querySelectorAll('.plan-card');
    cards.forEach(function(card){
      var slug = card.getAttribute('data-slug');
      if (!slug) return;
      var wrap = document.createElement('label');
      wrap.className = 'plan-check-wrap';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!bought[slug];
      wrap.appendChild(cb);
      wrap.appendChild(document.createTextNode('Already got this'));
      function applyState(){
        card.classList.toggle('is-bought', cb.checked);
      }
      applyState();
      cb.addEventListener('change', function(){
        var b = getBought();
        if (cb.checked) b[slug] = true; else delete b[slug];
        setBought(b);
        applyState();
      });
      var body = card.querySelector('.plan-card-body');
      if (body) body.appendChild(wrap);
    });
  }

  /* ---------- Favorites page rendering ---------- */
  function renderFavoritesPage(){
    var container = document.getElementById('favorites-list');
    if (!container) return;
    var list = getFavorites();
    var emptyEl = document.getElementById('favorites-empty');
    if (!list.length){
      if (emptyEl) emptyEl.style.display = 'block';
      container.innerHTML = '';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    container.innerHTML = list.map(function(f){
      return '<div class="fav-card">' +
        '<span class="mini-tag ' + f.tierClass + '">' + f.tier + '</span>' +
        '<h4>' + f.name + '</h4>' +
        '<p class="fav-context">' + f.bestFor + '</p>' +
        '<p class="fav-source">From: <a href="' + f.pageUrl + '">' + f.pageTitle + '</a></p>' +
        '<div class="fav-card-actions">' +
          '<a class="buy-btn" href="' + f.buyLink + '" target="_blank" rel="nofollow sponsored noopener">Check price &#8594;</a>' +
          '<button type="button" class="fav-remove" data-id="' + f.id + '">Remove</button>' +
        '</div>' +
      '</div>';
    }).join('');
    Array.prototype.forEach.call(container.querySelectorAll('.fav-remove'), function(btn){
      btn.addEventListener('click', function(){
        var list2 = getFavorites().filter(function(f){ return f.id !== btn.getAttribute('data-id'); });
        setFavorites(list2);
        renderFavoritesPage();
      });
    });
  }

  /* ---------- Newsletter form (fetch-based, stays on page) ---------- */
  function initNewsletterForms(){
    var forms = document.querySelectorAll('.newsletter-form');
    Array.prototype.forEach.call(forms, function(form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var btn = form.querySelector('button[type="submit"]');
        var msgEl = form.parentNode.querySelector('.newsletter-msg');
        var originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Sending...';
        var formData = new FormData(form);
        fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        }).then(function(res){
          if (res.ok){
            if (msgEl) msgEl.textContent = "You're on the list — thank you!";
            form.reset();
          } else {
            if (msgEl) msgEl.textContent = 'Something went wrong — please try again.';
          }
        }).catch(function(){
          if (msgEl) msgEl.textContent = 'Something went wrong — please try again.';
        }).then(function(){
          btn.disabled = false;
          btn.textContent = originalText;
        });
      });
    });
  }

  /* ---------- Contact form (About page, fetch-based, stays on page) ---------- */
  function initContactForms(){
    var forms = document.querySelectorAll('.contact-form');
    Array.prototype.forEach.call(forms, function(form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var btn = form.querySelector('button[type="submit"]');
        var msgEl = form.parentNode.querySelector('.contact-msg');
        var originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Sending...';
        var formData = new FormData(form);
        fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        }).then(function(res){
          if (res.ok){
            if (msgEl) msgEl.textContent = "Message sent — thank you! We'll get back to you soon.";
            form.reset();
          } else {
            if (msgEl) msgEl.textContent = 'Something went wrong — please try again.';
          }
        }).catch(function(){
          if (msgEl) msgEl.textContent = 'Something went wrong — please try again.';
        }).then(function(){
          btn.disabled = false;
          btn.textContent = originalText;
        });
      });
    });
  }

  function initHeroWaveSm(){
    var canvases = document.querySelectorAll('.hero-wave-sm');
    if(!canvases.length) return;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var colors = ['#fff6e6', '#ffd9a8', '#ffffff', '#ffe3c2'];

    canvases.forEach(function(canvas){
      if(!canvas.getContext) return;
      var ctx = canvas.getContext('2d');
      var w = 0, h = 0, dpr = 1, particles = [];
      function rand(min, max){ return min + Math.random() * (max - min); }
      function resize(){
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        var rect = canvas.getBoundingClientRect();
        w = rect.width; h = rect.height;
        canvas.width = Math.max(1, Math.round(w * dpr));
        canvas.height = Math.max(1, Math.round(h * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      function randG(){ return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; }
      function smooth(e0, e1, x){ var t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }
      var N = 80;
      function makeParticle(){
        return {
          s: Math.random(),
          speed: rand(0.16, 0.32),
          jitterX: randG(),
          jitterY: randG(),
          size: rand(0.8, 1.8),
          color: colors[Math.floor(Math.random() * colors.length)],
          alphaMax: rand(0.5, 0.95)
        };
      }
      function seed(){
        particles = [];
        for (var i = 0; i < N; i++) particles.push(makeParticle());
      }
      resize();
      seed();
      window.addEventListener('resize', function(){ resize(); seed(); });

      var time = 0, lastT = null;
      function frame(ts){
        if (w === 0 || h === 0) { if (!reduceMotion) requestAnimationFrame(frame); return; }
        if (lastT === null) lastT = ts;
        var dt = Math.min((ts - lastT) / 1000, 0.05);
        lastT = ts;
        ctx.clearRect(0, 0, w, h);
        var cx = w * 0.5, cy = h * 0.55;
        var focal = h * 1.05;
        var zFar = h * 2.3, zNear = h * 0.16;
        var maxSize = h * 0.09;
        for (var i = 0; i < particles.length; i++) {
          var p = particles[i];
          if (!reduceMotion) {
            p.s += p.speed * dt;
            if (p.s >= 1) {
              var np = makeParticle();
              np.s = 0;
              particles[i] = np;
              p = np;
            }
          }
          var s = p.s;
          var centerX = Math.sin(s * Math.PI * 2 * 1.3 - time * 0.5) * (h * 0.6);
          var centerY = Math.cos(s * Math.PI * 2 * 0.8 - time * 0.35) * (h * 0.22);
          var worldX = centerX + p.jitterX * (h * 0.2);
          var worldY = centerY + p.jitterY * (h * 0.13);
          var z = zNear + (zFar - zNear) * (1 - s);
          var scale = focal / z;
          var px = cx + worldX * scale;
          var py = cy + worldY * scale;
          var size = Math.min(p.size * scale, maxSize);
          if (px < -size - 10 || px > w + size + 10 || py < -size - 10 || py > h + size + 10) continue;
          var edgeFade = Math.max(0, 1 - Math.sqrt(p.jitterX * p.jitterX + p.jitterY * p.jitterY) / 1.5);
          var envelope = smooth(0, 0.1, s) * (1 - smooth(0.88, 1, s));
          var flicker = reduceMotion ? 1 : (0.75 + 0.25 * Math.sin(time * 3 + s * 20));
          var alpha = p.alphaMax * edgeFade * flicker * (reduceMotion ? 1 : envelope);
          if (alpha <= 0.02 || size <= 0.15) continue;
          ctx.beginPath();
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = size * 2.2;
          ctx.globalAlpha = alpha;
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        time += dt;
        if (!reduceMotion) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    initFavoriteButtons();
    initComparator();
    renderFavoritesPage();
    initNewsletterForms();
    initContactForms();
    initHeroWaveSm();
  });

  window.GlowTools = {
    initChecklistForGrid: initChecklistForGrid
  };
})();
