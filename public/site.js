(function () {
    var root = document.documentElement;
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var EMAIL = 'rishisrdyp@gmail.com';
    var GITHUB = 'https://github.com/rishi-srdy';

    // ---------- toast ----------
    var toastTimer;
    function toast(msg) {
        var el = document.querySelector('.toast');
        if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
        el.textContent = msg;
        requestAnimationFrame(function () { el.classList.add('show'); });
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { el.classList.remove('show'); }, 1700);
    }
    function copy(text, label) {
        try {
            navigator.clipboard.writeText(text).then(function () { toast(label || 'Copied'); }, function () { toast(text); });
        } catch (e) { toast(text); }
    }

    // ---------- theme toggle (added: original markup had the button but no behavior) ----------
    var themeBtn = document.querySelector('.themetoggle');
    function syncTheme() {
        if (themeBtn) themeBtn.setAttribute('aria-pressed', String(root.getAttribute('data-theme') === 'dark'));
    }
    syncTheme();
    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) { }
            syncTheme();
        });
    }

    // ---------- live clock ----------
    var clock = document.getElementById('clock');
    if (clock) {
        var pad = function (n) { return String(n).padStart(2, '0'); };
        var tick = function () { var d = new Date(); clock.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); };
        tick(); setInterval(tick, 1000);
    }

    // ---------- scroll progress + scrollspy ----------
    var bar = document.getElementById('scrollbar');
    var spy = [].slice.call(document.querySelectorAll('.navlinks a.nl[href*="#"]'));
    function hashOf(a) { var h = a.getAttribute('href') || ''; var i = h.indexOf('#'); return i >= 0 ? h.slice(i + 1) : ''; }
    var sections = spy.map(function (a) { var id = hashOf(a); return id ? document.getElementById(id) : null; }).filter(Boolean);
    function onScroll() {
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        if (bar) bar.style.width = (docH > 0 ? (window.scrollY / docH) * 100 : 0) + '%';
        if (sections.length) {
            var y = window.scrollY + window.innerHeight * 0.32, cur = null;
            for (var j = 0; j < sections.length; j++) if (sections[j].offsetTop <= y) cur = sections[j].id;
            for (var k = 0; k < spy.length; k++) spy[k].classList.toggle('active', hashOf(spy[k]) === cur);
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    function scrollToEl(el, offset) {
        var y = el.getBoundingClientRect().top + window.scrollY - (offset || 80);
        window.scrollTo({ top: y, behavior: calm ? 'auto' : 'smooth' });
    }
    function goSection(hash) {
        var el = document.querySelector(hash);
        if (el) scrollToEl(el, 80);
        else window.location.href = '/' + hash;
    }

    // ---------- ghost parallax ----------
    var ghosts = [].slice.call(document.querySelectorAll('.rail .ghost'));
    if (ghosts.length && window.matchMedia('(min-width: 721px)').matches && !calm) {
        window.addEventListener('mousemove', function (e) {
            var dx = (e.clientX / window.innerWidth - 0.5) * 10;
            var dy = (e.clientY / window.innerHeight - 0.5) * 10;
            var tf = 'translate(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px)';
            for (var g = 0; g < ghosts.length; g++) ghosts[g].style.transform = tf;
        });
    }

    // ---------- hero name decode ----------
    var hero = document.querySelector('.hero h1');
    if (hero && !calm) {
        var finalText = hero.textContent;
        var glyphs = '01<>/\\[]{}#%*+=:;~ABCDEFXYZ';
        var orig = finalText.split('');
        var frame = 0, total = 16;
        hero.classList.add('decoding');
        var step = function () {
            var out = '';
            for (var i = 0; i < orig.length; i++) {
                if (orig[i] === ' ') { out += ' '; continue; }
                out += (i < (frame / total) * orig.length) ? orig[i] : glyphs[Math.floor(Math.random() * glyphs.length)];
            }
            hero.textContent = out;
            frame++;
            if (frame <= total) setTimeout(step, 34);
            else { hero.textContent = finalText; hero.classList.remove('decoding'); }
        };
        setTimeout(step, 220);
    }

    // ---------- command palette ----------
    var actions = [
        { g: 'Navigate', label: 'Selected Work', icon: '01', run: function () { goSection('#work'); } },
        { g: 'Navigate', label: 'Projects', icon: '02', run: function () { goSection('#projects'); } },
        { g: 'Navigate', label: 'Skills & Education', icon: '03', run: function () { goSection('#about'); } },
        { g: 'Navigate', label: 'Contact', icon: '04', run: function () { goSection('#contact'); } },
        { g: 'Actions', label: 'Open Ask AI', icon: '→', key: 'chat', run: function () { window.location.href = '/chat'; } },
        { g: 'Actions', label: 'Copy email address', icon: '@', run: function () { copy(EMAIL, 'Email copied'); } },
        { g: 'Actions', label: 'Open GitHub', icon: '↗', run: function () { window.open(GITHUB, '_blank'); } },
        { g: 'Actions', label: 'Toggle light / dark', icon: '◐', run: function () { if (themeBtn) themeBtn.click(); } }
    ];

    var pal = document.createElement('div');
    pal.className = 'cmdk';
    pal.innerHTML =
        '<div class="scrim" data-close></div>' +
        '<div class="panel" role="dialog" aria-modal="true" aria-label="Command menu">' +
        '<div class="ipt"><span class="pre">&gt;</span><input type="text" placeholder="Type a command or search…" aria-label="Command input" autocomplete="off" /></div>' +
        '<div class="list"></div>' +
        '<div class="foot"><span>↑↓ Move</span><span>⏎ Select</span><span>Esc Close</span></div>' +
        '</div>';
    document.body.appendChild(pal);
    var palInput = pal.querySelector('input');
    var palList = pal.querySelector('.list');
    var filtered = [], active = 0;

    function renderList() {
        var q = palInput.value.trim().toLowerCase();
        filtered = actions.filter(function (a) { return !q || a.label.toLowerCase().indexOf(q) >= 0 || a.g.toLowerCase().indexOf(q) >= 0; });
        if (active >= filtered.length) active = filtered.length - 1;
        if (active < 0) active = 0;
        if (!filtered.length) { palList.innerHTML = '<div class="empty">No matching commands</div>'; return; }
        var html = '', lastG = null;
        for (var i = 0; i < filtered.length; i++) {
            var a = filtered[i];
            if (a.g !== lastG) { html += '<div class="grouplbl">' + a.g + '</div>'; lastG = a.g; }
            html += '<div class="opt' + (i === active ? ' active' : '') + '" data-i="' + i + '">' +
                '<span class="ol"><span class="oi">' + a.icon + '</span><span class="otext">' + a.label + '</span></span>' +
                (a.key ? '<span class="okey">' + a.key + '</span>' : '') +
                '</div>';
        }
        palList.innerHTML = html;
    }
    function openPal() {
        pal.classList.add('open');
        palInput.value = ''; active = 0; renderList();
        setTimeout(function () { palInput.focus(); }, 20);
    }
    function closePal() { pal.classList.remove('open'); }
    function runActive() {
        var a = filtered[active];
        if (a) { closePal(); setTimeout(a.run, 60); }
    }

    palInput.addEventListener('input', function () { active = 0; renderList(); });
    palList.addEventListener('mousemove', function (e) {
        var opt = e.target.closest('.opt'); if (!opt) return;
        var i = +opt.getAttribute('data-i');
        if (i !== active) { active = i; renderList(); }
    });
    palList.addEventListener('click', function (e) {
        var opt = e.target.closest('.opt'); if (!opt) return;
        active = +opt.getAttribute('data-i'); runActive();
    });
    pal.addEventListener('click', function (e) { if (e.target.hasAttribute('data-close')) closePal(); });

    var cmdkBtns = document.querySelectorAll('[data-cmdk]');
    for (var c = 0; c < cmdkBtns.length; c++) cmdkBtns[c].addEventListener('click', openPal);

    document.addEventListener('keydown', function (e) {
        var inField = /^(input|textarea)$/i.test((document.activeElement || {}).tagName || '');
        if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); pal.classList.contains('open') ? closePal() : openPal(); return; }
        if (e.key === '/' && !inField && !pal.classList.contains('open')) { e.preventDefault(); openPal(); return; }
        if (!pal.classList.contains('open')) return;
        if (e.key === 'Escape') { e.preventDefault(); closePal(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, filtered.length - 1); renderList(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); renderList(); }
        else if (e.key === 'Enter') { e.preventDefault(); runActive(); }
    });

    // ---------- interactive chat thread (placeholder demo; replaced by real Gemini in Sprint 3) ----------
    var thread = document.querySelector('.thread');
    if (thread) {
        var ANSWERS = {
            'is he stronger at backend or ml?': "Both, by design. He shipped production Java / Spring Boot services at Copart, and he's built real ML pipelines in research — whole-slide imaging at KMIT and a multimodal IMU + camera system at Georgia State. The throughline is engineering rigor: tests, reproducibility, and systems that hold up under load.",
            'what kind of internship is he looking for?': "Software, backend, ML/AI, or data engineering — Summer 2026. He's happiest where backend systems meet applied ML: data pipelines, model-serving infrastructure, or research that has to run in production, not just a notebook.",
            'walk me through the whole-slide imaging project.': "At KMIT's R&D lab he built histopathology AI on ~8 GB whole-slide images. The hard part was scale, so he used a memory-bounded tiling pipeline to stream gigapixel slides into model-ready patches, then combined YOLOv5/8 detection with U-Net segmentation. A related stroke-classification model reached ~91% accuracy.",
            '_default': "Good question. I'm a demo grounded in Rishikesh's résumé and project notes, so I can speak to his work at Copart, Georgia State, and KMIT — his backend engineering, his ML research, and what he's looking for next. Try one of the suggested questions, or reach out directly from the Contact section."
        };
        var input = document.getElementById('ask');
        var form = input ? input.closest('form') : null;
        var typing = false;

        function makeEx(q) {
            var ex = document.createElement('article');
            ex.className = 'exchange';
            ex.innerHTML =
                '<div class="q"><span class="mono qlabel">Q.</span><p class="qtext"></p></div>' +
                '<div class="a"><span class="mono alabel">A.</span><div class="atext"><p></p></div></div>';
            ex.querySelector('.qtext').textContent = q;
            thread.appendChild(ex);
            return ex;
        }
        function typeOut(node, text, done) {
            var i = 0; typing = true;
            var caret = document.createElement('span'); caret.className = 'typing-caret';
            node.appendChild(caret);
            var speed = calm ? 0 : 12;
            function next() {
                if (i < text.length) {
                    caret.insertAdjacentText('beforebegin', text.charAt(i));
                    i++;
                    if (i % 6 === 0) window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' });
                    setTimeout(next, speed);
                } else { caret.remove(); typing = false; if (done) done(); }
            }
            if (calm) { node.textContent = text; caret.remove(); typing = false; if (done) done(); }
            else next();
        }
        function ask(q) {
            if (typing || !q.trim()) return;
            var ex = makeEx(q.trim());
            scrollToEl(ex.querySelector('.qtext'), 110);
            var ans = ANSWERS[q.trim().toLowerCase()] || ANSWERS._default;
            var p = ex.querySelector('.atext p');
            setTimeout(function () {
                typeOut(p, ans, function () {
                    var cite = document.createElement('a');
                    cite.className = 'cite'; cite.href = '/#work'; cite.textContent = 'Source — Rishikesh’s work';
                    ex.querySelector('.atext').appendChild(cite);
                });
            }, 320);
        }

        var chips = document.querySelectorAll('.chip');
        for (var ci = 0; ci < chips.length; ci++) {
            chips[ci].addEventListener('click', function () {
                ask(this.querySelector('.ct').textContent);
            });
        }
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                var v = input.value;
                if (!v.trim() || typing) return;
                input.value = '';
                ask(v);
            });
        }
    }
})();