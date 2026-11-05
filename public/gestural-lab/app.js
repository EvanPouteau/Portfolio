/* ============================================================
   EXPÉRIENCE GESTUELLE — mon bureau, piloté à la main
   MediaPipe Hands suit le bout de l'index ; il éclaire un bureau
   en bois plongé dans la pénombre, comme une lampe. Quatre objets
   y sont posés : on garde la lumière dessus pour les ouvrir.
   Sans caméra, la souris fait la même chose.
   ============================================================ */

const C = {
    clay: '#e8956b', sage: '#9bb197', mustard: '#f2c14e', cream: '#e9dccd',
    ink: '#2a140a', paper: '#f6efe4', postit: '#f6d77a'
};
const HAND = 'Caveat, "Segoe Print", cursive';
const SANS = '"Segoe UI Variable Display", "Segoe UI", Inter, system-ui, sans-serif';
const MONO = '"Cascadia Code", ui-monospace, Consolas, monospace';
const HOLD_MS = 900;

/* Aléatoire reproductible : le bois garde le même veinage à chaque redimensionnement. */
function rng(seed) {
    return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}

function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

class GesturalPortfolio {
    constructor() {
        this.video = document.getElementById('webcam');
        this.canvas = document.getElementById('output-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.startBtn = document.getElementById('start-btn');
        this.mouseBtn = document.getElementById('mouse-btn');
        this.startScreen = document.getElementById('start-screen');
        this.startError = document.getElementById('start-error');
        this.statusEl = document.getElementById('lab-status');
        this.panel = document.getElementById('info-panel');
        this.hints = document.getElementById('hints');
        this.note = document.getElementById('lab-note');
        this.pip = document.getElementById('pip');
        this.pipCanvas = document.getElementById('pip-canvas');
        this.pipCtx = this.pipCanvas.getContext('2d');

        this.mode = null;                 // 'hand' | 'mouse'
        this.target = { x: innerWidth / 2, y: innerHeight / 2 };
        this.cursor = { x: innerWidth / 2, y: innerHeight / 2 };
        this.light = 0;                   // intensité de la lampe (s'allume au démarrage)
        this.velocities = [];
        this.swipeCooldown = 0;
        this.pointerActive = false;
        this.activeId = null;
        this.lastT = performance.now();

        this.covers = [loadImage('/assets/covers/shelf/arabe-egyptien.webp'), loadImage('/assets/covers/shelf/muscu.webp')];

        this.items = [
            { id: 'about', kind: 'postit', color: C.mustard, icon: 'ph-user', title: 'À propos', label: 'À propos',
              content: `<span class="avail">Stage en développement web · à partir d'avril</span>
                <p>Je suis <strong>Evan Pouteau</strong>, étudiant en 2ᵉ année de <strong>BUT MMI</strong>, parcours Développement, à l'IUT Clermont Auvergne (Le Puy-en-Velay).</p>
                <p>Je développe des applications web de A à Z : je conçois la base de données, je code l'interface et je mets le projet en ligne. J'aime construire des outils qui servent vraiment, à commencer par les miens.</p>
                <p>Je cherche un stage de <strong>350 h minimum</strong>, en semaines pleines, autour du Puy-en-Velay (je suis véhiculé) ou à Paris et dans les Yvelines.</p>` },

            { id: 'skills', kind: 'notebook', color: C.sage, icon: 'ph-code', title: 'Compétences', label: 'Compétences',
              content: `<p class="label">Langages</p><div class="chips"><span>HTML</span><span>CSS</span><span>JavaScript</span><span>TypeScript</span></div>
                <p class="label">Frameworks</p><div class="chips"><span>React</span><span>Next.js</span><span>Three.js</span></div>
                <p class="label">Back-end & déploiement</p><div class="chips"><span>PHP / SQL</span><span>Supabase</span><span>Docker</span></div>
                <p class="label">Outils & UX</p><div class="chips"><span>Git</span><span>Figma</span><span>UX research</span></div>
                <p class="label">Langues</p><p>Français natif · Anglais B1 · Arabe égyptien en apprentissage</p>` },

            { id: 'projects', kind: 'polaroid', color: C.clay, icon: 'ph-folder-open', title: 'Projets', label: 'Mes projets',
              content: `<h4>Arabe égyptien</h4><p class="stack">NEXT.JS · TYPESCRIPT · SUPABASE · AZURE SPEECH · GEMINI</p>
                <p>Une application pour apprendre le dialecte du Caire : 30 modules, des quiz, un tuteur IA et 525 mots dont la prononciation a été validée avec une locutrice égyptienne.</p>
                <h4>Muscu</h4><p class="stack">NEXT.JS · SUPABASE · VERCEL</p>
                <p>Mon carnet d'entraînement, utilisé tous les jours : programme stocké en base, minuteur de repos, courbes de progression.</p>
                <h4>Le Lobby de l'Urbex</h4><p class="stack">PHP · SQL · JAVASCRIPT · DOCKER · RENDER</p>
                <p>Un site de référencement de lieux abandonnés : CRUD en PHP/PDO, conteneur Docker, mis en ligne.</p>
                <p><a href="/">Voir tous mes projets sur le portfolio →</a></p>` },

            { id: 'contact', kind: 'card', color: C.clay, icon: 'ph-envelope-simple', title: 'Contact', label: 'Me contacter',
              content: `<div class="contact">
                  <a href="mailto:pouteauevan@gmail.com"><i class="ph ph-envelope-simple"></i><span>pouteauevan@gmail.com<small>Réponse sous 48 h en général</small></span></a>
                  <a href="https://www.linkedin.com/in/evan-pouteau-06a9a7342" target="_blank" rel="noopener"><i class="ph ph-linkedin-logo"></i><span>LinkedIn<small>Parcours et expériences</small></span></a>
                  <a href="https://github.com/EvanPouteau" target="_blank" rel="noopener"><i class="ph ph-github-logo"></i><span>GitHub<small>Le code de mes projets</small></span></a>
                  <a href="/"><i class="ph ph-desktop"></i><span>Mon portfolio<small>Le bureau 3D complet</small></span></a>
                </div>` }
        ].map(it => ({ ...it, progress: 0, lift: 0, x: 0, y: 0, w: 0, h: 0, rot: 0, dx: 0, dy: 0 }));

        addEventListener('resize', () => this.layout());
        this.layout();

        document.getElementById('panel-close').addEventListener('click', () => this.closePanel());
        addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closePanel(); });

        this.mouseBtn.addEventListener('click', () => this.startMouse());
        this.initAI();
        this.drawIdle();
    }

    /* ---------- mise en page et décor ---------- */
    layout() {
        const W = innerWidth, H = innerHeight;
        this.canvas.width = W; this.canvas.height = H;
        this.mobile = W < 768;

        const sizes = {
            postit: [210, 200, -4], notebook: [250, 190, 3],
            polaroid: [215, 250, 2.5], card: [285, 165, -2.5]
        };
        if (this.mobile) {
            const w = Math.min(W * 0.78, 340), h = Math.min(92, (H - 300) / 4 - 14);
            const top = 150, gap = (H - top - 120 - h * 4) / 3;
            this.items.forEach((it, i) => {
                it.w = w; it.h = h; it.rot = i % 2 ? 1.2 : -1.2;
                it.x = W / 2; it.y = top + h / 2 + i * (h + gap);
            });
        } else {
            const rowA = Math.max(H * 0.41, 250), rowB = Math.min(H * 0.74, H - 175);
            const pos = { about: [0.28, rowA], skills: [0.72, rowA], projects: [0.3, rowB], contact: [0.7, rowB] };
            this.items.forEach(it => {
                const [w, h, r] = sizes[it.kind];
                it.w = w; it.h = h; it.rot = r;
                it.x = W * pos[it.id][0]; it.y = pos[it.id][1];
            });
        }
        this.buildDesk();
    }

    /* Le bureau est dessiné une fois dans un canevas hors écran (un peu plus
       grand que la fenêtre pour la parallaxe), puis recopié à chaque image. */
    buildDesk() {
        const M = 60, W = innerWidth + M * 2, H = innerHeight + M * 2;
        const d = document.createElement('canvas'); d.width = W; d.height = H;
        const g = d.getContext('2d');
        const rand = rng(42);

        // planches de noyer
        const plank = this.mobile ? 90 : 120;
        const tones = ['#3b261a', '#432b1d', '#37231a', '#402a1c'];
        for (let y = 0, i = 0; y < H; y += plank, i++) {
            g.fillStyle = tones[i % tones.length];
            g.fillRect(0, y, W, plank);
            // veinage : longues lignes ondulées très légères
            for (let k = 0; k < 26; k++) {
                const yy = y + rand() * plank, amp = 2 + rand() * 6, len = 180 + rand() * 260, ph = rand() * 10;
                g.strokeStyle = `rgba(${rand() > .5 ? '20,10,5' : '120,80,50'},${0.08 + rand() * 0.1})`;
                g.lineWidth = 0.6 + rand() * 1.4;
                g.beginPath();
                for (let x = -20; x < W + 20; x += 12) g.lineTo(x, yy + Math.sin(x / len + ph) * amp);
                g.stroke();
            }
            // nœud du bois
            if (rand() > 0.45) {
                const kx = rand() * W, ky = y + plank * (0.3 + rand() * 0.4);
                g.strokeStyle = 'rgba(25,12,6,.22)';
                for (let r = 3; r < 26; r += 4) { g.beginPath(); g.ellipse(kx, ky, r * 2.4, r * 0.7, 0, 0, Math.PI * 2); g.stroke(); }
            }
            // joint entre deux planches
            g.fillStyle = 'rgba(12,6,3,.55)'; g.fillRect(0, y + plank - 2, W, 2);
            g.fillStyle = 'rgba(255,220,180,.04)'; g.fillRect(0, y, W, 1);
        }

        const cx = (fx) => M + innerWidth * fx, cy = (fy) => M + innerHeight * fy;

        // feuilles de monstera aux coins, comme dans la pièce 3D
        const leaf = (x, y, s, a) => {
            g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s);
            g.fillStyle = 'rgba(0,0,0,.35)';
            g.beginPath(); g.ellipse(14, 18, 110, 70, 0, 0, Math.PI * 2); g.fill();
            g.fillStyle = '#4f6b4a';
            g.beginPath(); g.ellipse(0, 0, 110, 70, 0, 0, Math.PI * 2); g.fill();
            g.strokeStyle = '#3c5338'; g.lineWidth = 3;
            g.beginPath(); g.moveTo(-105, 0); g.lineTo(105, 0); g.stroke();
            g.fillStyle = '#3b2519';
            for (let i = -3; i <= 3; i++) {   // découpes caractéristiques
                if (!i) continue;
                g.beginPath(); g.ellipse(i * 26, i > 0 ? 46 : -46, 6, 26, i * 0.15, 0, Math.PI * 2); g.fill();
            }
            g.restore();
        };
        leaf(cx(1) + 10, cy(0) + 40, 1.3, 2.4);
        leaf(cx(1) - 60, cy(0) - 10, 0.9, 1.9);
        leaf(cx(0) - 20, cy(1) - 20, 1.25, -0.6);

        if (!this.mobile) {
            // tasse de café, vue de dessus
            const mx = cx(0.5), my = cy(0.58);
            g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.arc(mx + 8, my + 10, 46, 0, Math.PI * 2); g.fill();
            g.fillStyle = '#c86f47'; g.beginPath(); g.arc(mx, my, 44, 0, Math.PI * 2); g.fill();
            g.lineWidth = 11; g.strokeStyle = '#c86f47';
            g.beginPath(); g.arc(mx + 52, my, 16, -1.1, 1.1); g.stroke();
            g.fillStyle = '#2b170e'; g.beginPath(); g.arc(mx, my, 35, 0, Math.PI * 2); g.fill();
            g.fillStyle = 'rgba(255,220,180,.12)'; g.beginPath(); g.ellipse(mx - 10, my - 12, 14, 7, -0.6, 0, Math.PI * 2); g.fill();
            // trace de tasse
            g.strokeStyle = 'rgba(30,14,6,.35)'; g.lineWidth = 4;
            g.beginPath(); g.arc(cx(0.56), cy(0.86), 40, 0.3, 5.6); g.stroke();

            // crayon
            g.save(); g.translate(cx(0.1), cy(0.6)); g.rotate(-1.05);
            g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(4, 6, 170, 14);
            g.fillStyle = C.mustard; g.fillRect(0, 0, 150, 14);
            g.fillStyle = '#e9b23c'; g.fillRect(0, 5, 150, 4);
            g.fillStyle = '#d9b48a'; g.beginPath(); g.moveTo(150, 0); g.lineTo(172, 7); g.lineTo(150, 14); g.fill();
            g.fillStyle = '#2b170e'; g.beginPath(); g.moveTo(166, 5); g.lineTo(172, 7); g.lineTo(166, 9); g.fill();
            g.fillStyle = '#e88f8f'; g.fillRect(-14, 0, 14, 14);
            g.restore();

            // bout de clavier en haut à gauche
            g.save(); g.translate(cx(0.02), cy(0.17)); g.rotate(0.08);
            g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(8, 10, 300, 92);
            g.fillStyle = '#e7e2da'; g.fillRect(0, 0, 300, 92);
            g.fillStyle = '#cfc8be';
            for (let r = 0; r < 4; r++) for (let k = 0; k < 13; k++) g.fillRect(10 + k * 22 + (r % 2) * 6, 10 + r * 20, 17, 15);
            g.restore();
        }

        // vignette
        const v = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
        v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(8,4,2,.65)');
        g.fillStyle = v; g.fillRect(0, 0, W, H);

        this.desk = d; this.deskMargin = M;
    }

    /* ---------- démarrage ---------- */
    setStatus(text, state) {
        this.statusEl.querySelector('.dot').className = 'dot ' + (state || 'off');
        this.statusEl.querySelector('.status-text').textContent = text;
    }

    begin(mode) {
        this.mode = mode;
        document.body.classList.toggle('mouse-mode', mode === 'mouse');
        this.startScreen.classList.add('hidden');
        this.note.classList.remove('hidden');
        this.hints.classList.remove('hidden');
        if (mode === 'mouse' && matchMedia('(pointer: coarse)').matches) {
            this.hints.innerHTML = '<span><i class="ph-bold ph-hand-tap"></i> touchez un objet pour l’ouvrir</span><span class="sep">·</span><span>touchez à côté pour fermer</span>';
            document.getElementById('close-hint').innerHTML = '<i class="ph-bold ph-x"></i> Touchez à côté ou la croix pour refermer.';
        } else if (mode === 'mouse') {
            this.hints.innerHTML = '<span><i class="ph-bold ph-mouse-simple"></i> survolez</span><span class="sep">·</span><span><i class="ph-bold ph-timer"></i> maintenez ou cliquez</span><span class="sep">·</span><span><i class="ph-bold ph-x"></i> Échap pour fermer</span>';
            document.getElementById('note-sub').textContent = "la lampe suit votre souris · gardez-la sur un objet pour l'ouvrir";
            document.getElementById('close-hint').innerHTML = '<i class="ph-bold ph-x"></i> Cliquez à côté, sur la croix ou appuyez sur Échap pour refermer.';
        }
        if (!this.running) { this.running = true; this.renderLoop(); }
    }

    startMouse() {
        this.setStatus('sans caméra', 'mouse');
        this.canvas.addEventListener('pointermove', (e) => { this.target.x = e.clientX; this.target.y = e.clientY; this.pointerActive = true; });
        this.canvas.addEventListener('pointerleave', () => { this.pointerActive = false; });
        this.canvas.addEventListener('click', (e) => {
            if (this.activeId) { this.closePanel(); return; }
            // sur écran tactile, le toucher arrive sans mouvement préalable : on part de sa position
            this.target.x = this.cursor.x = e.clientX; this.target.y = this.cursor.y = e.clientY;
            const it = this.itemAt(e.clientX, e.clientY);
            if (it) this.openPanel(it);
        });
        this.pointerActive = true;
        this.begin('mouse');
    }

    async initAI() {
        let hands;
        try {
            hands = new Hands({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
            hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
            hands.onResults((r) => this.onResults(r));
        } catch (e) {
            this.showError("Le moteur de détection n'a pas pu se charger (connexion ?). Vous pouvez essayer sans caméra.");
            this.startBtn.disabled = true;
            return;
        }

        this.startBtn.addEventListener('click', async () => {
            this.startBtn.disabled = true;
            this.setStatus('démarrage de la caméra…', 'off');
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                this.video.srcObject = stream;
                this.video.addEventListener('loadeddata', () => {
                    this.pip.classList.remove('hidden');
                    this.setStatus('caméra active', 'live');
                    this.loopAI(hands);
                    this.begin('hand');
                }, { once: true });
            } catch (err) {
                this.startBtn.disabled = false;
                this.setStatus('caméra refusée', 'off');
                this.showError(err && err.name === 'NotAllowedError'
                    ? "Accès à la caméra refusé. Autorisez-le dans votre navigateur, ou essayez sans caméra."
                    : "Aucune caméra disponible sur cet appareil. Vous pouvez essayer sans caméra.");
            }
        });
    }

    showError(msg) {
        this.startError.textContent = msg;
        this.startError.classList.remove('hidden');
    }

    onResults(results) {
        const hand = results.multiHandLandmarks && results.multiHandLandmarks[0];
        this.pointerActive = !!hand;
        if (hand) {
            this.target.x = (1 - hand[8].x) * this.canvas.width;
            this.target.y = hand[8].y * this.canvas.height;
        }
        this.drawPip(results, hand);
    }

    /* Aperçu caméra en miroir, avec le squelette de la main aux couleurs du site. */
    drawPip(results, hand) {
        const w = this.pipCanvas.width, h = this.pipCanvas.height, c = this.pipCtx;
        c.save();
        c.clearRect(0, 0, w, h);
        c.translate(w, 0); c.scale(-1, 1);
        if (results.image) c.drawImage(results.image, 0, 0, w, h);
        c.fillStyle = 'rgba(21,16,14,.4)'; c.fillRect(0, 0, w, h);
        if (hand && typeof drawConnectors !== 'undefined') {
            drawConnectors(c, hand, HAND_CONNECTIONS, { color: 'rgba(232,149,107,.9)', lineWidth: 2 });
            drawLandmarks(c, hand, { color: C.ink, fillColor: C.cream, lineWidth: 1, radius: 2.5 });
            c.beginPath(); c.arc(hand[8].x * w, hand[8].y * h, 6, 0, Math.PI * 2);
            c.fillStyle = C.mustard; c.fill();
        }
        c.restore();
        if (!hand) {
            c.font = `600 18px ${HAND}`; c.fillStyle = '#ffd9a3'; c.textAlign = 'center';
            c.fillText('montrez votre main', w / 2, h - 14);
        }
    }

    async loopAI(hands) {
        if (this.video.readyState >= 2) {
            try { await hands.send({ image: this.video }); } catch (e) { /* image ignorée */ }
        }
        requestAnimationFrame(() => this.loopAI(hands));
    }

    /* ---------- boucle de rendu ---------- */
    itemAt(px, py) {
        for (let i = this.items.length - 1; i >= 0; i--) {
            const it = this.items[i];
            const a = -it.rot * Math.PI / 180, x = px - (it.x + it.dx), y = py - (it.y + it.dy);
            const lx = x * Math.cos(a) - y * Math.sin(a), ly = x * Math.sin(a) + y * Math.cos(a);
            if (Math.abs(lx) < it.w / 2 && Math.abs(ly) < it.h / 2) return it;
        }
        return null;
    }

    renderLoop() {
        const now = performance.now(), dt = Math.min(50, now - this.lastT); this.lastT = now;
        const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;

        const prevX = this.cursor.x;
        const k = 1 - Math.pow(this.mode === 'mouse' ? 0.0005 : 0.004, dt / 1000);
        this.cursor.x += (this.target.x - this.cursor.x) * k;
        this.cursor.y += (this.target.y - this.cursor.y) * k;
        this.light += ((this.pointerActive ? 1 : 0.35) - this.light) * 0.06;

        // balayage horizontal rapide = fermeture (mode main)
        if (this.mode === 'hand') {
            this.velocities.push((this.cursor.x - prevX) / dt * 16);
            if (this.velocities.length > 5) this.velocities.shift();
            const v = this.velocities.reduce((a, b) => a + b, 0) / this.velocities.length;
            if (Math.abs(v) > 40 && this.activeId && this.swipeCooldown <= 0) { this.closePanel(); this.swipeCooldown = 30; }
            if (this.swipeCooldown > 0) this.swipeCooldown--;
        }

        const px = (this.cursor.x - W / 2) * 0.02, py = (this.cursor.y - H / 2) * 0.02;
        ctx.drawImage(this.desk, -this.deskMargin - px * 0.5, -this.deskMargin - py * 0.5);

        // survol et ouverture
        const hovered = this.pointerActive && !(this.mode === 'mouse' && this.activeId) ? this.itemAt(this.cursor.x, this.cursor.y) : null;
        for (const it of this.items) {
            it.dx = -px; it.dy = -py;
            const over = it === hovered;
            if (over) {
                it.progress = Math.min(1, it.progress + dt / HOLD_MS);
                if (it.progress >= 1 && this.activeId !== it.id) this.openPanel(it);
            } else {
                it.progress = Math.max(0, it.progress - dt / 400);
            }
            it.lift += ((over || this.activeId === it.id ? 1 : 0) - it.lift) * 0.15;
        }
        if (this.mode === 'hand' && !hovered && this.activeId && this.swipeCooldown <= 0 && this.items.every(i => i.progress <= 0)) this.closePanel();

        for (const it of this.items) this.drawItem(it);
        this.drawLamp(W, H);
        if (hovered && hovered.progress > 0 && hovered.progress < 1) this.drawHold(hovered);
        this.drawCursor();

        requestAnimationFrame(() => this.renderLoop());
    }

    /* Avant le démarrage, le bureau reste visible dans la pénombre derrière la fenêtre. */
    drawIdle() {
        const ctx = this.ctx;
        ctx.drawImage(this.desk, -this.deskMargin, -this.deskMargin);
        for (const it of this.items) this.drawItem(it);
        ctx.fillStyle = 'rgba(10,6,4,.55)'; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (!this.running) requestAnimationFrame(() => this.drawIdle());
    }

    /* La pénombre, percée par un halo chaud autour du curseur. */
    drawLamp(W, H) {
        const ctx = this.ctx, x = this.cursor.x, y = this.cursor.y;
        const r = (this.mobile ? 240 : 380) * (0.75 + 0.25 * this.light);
        const g = ctx.createRadialGradient(x, y, r * 0.08, x, y, r);
        g.addColorStop(0, 'rgba(10,6,4,0)');
        g.addColorStop(0.55, `rgba(10,6,4,${0.18 + 0.2 * (1 - this.light)})`);
        g.addColorStop(1, `rgba(10,6,4,${0.62 + 0.15 * (1 - this.light)})`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const w = ctx.createRadialGradient(x, y, 0, x, y, r * 0.7);
        w.addColorStop(0, `rgba(255,170,90,${0.13 * this.light})`);
        w.addColorStop(1, 'rgba(255,170,90,0)');
        ctx.fillStyle = w; ctx.fillRect(x - r, y - r, r * 2, r * 2);
        ctx.restore();
    }

    /* ---------- objets du bureau ---------- */
    drawItem(it) {
        const ctx = this.ctx, l = it.lift, s = 1 + 0.05 * l;
        ctx.save();
        ctx.translate(it.x + it.dx, it.y + it.dy);
        ctx.rotate((it.rot * (1 - 0.5 * l)) * Math.PI / 180);
        ctx.scale(s, s);
        const w = it.w, h = it.h, x = -w / 2, y = -h / 2;

        // ombre portée, plus grande quand l'objet se soulève
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 14 + 22 * l;
        ctx.shadowOffsetX = 5 + 8 * l; ctx.shadowOffsetY = 8 + 14 * l;
        ctx.fillStyle = '#000';
        this.rr(x, y, w, h, it.kind === 'postit' ? 2 : 6); ctx.fill();
        ctx.restore();

        if (this.mobile) this.drawCompact(it, x, y, w, h);
        else this['draw_' + it.kind](it, x, y, w, h);

        // liseré argile quand la lumière est posée dessus
        if (it.progress > 0 || l > 0.05) {
            ctx.lineWidth = 2.5; ctx.strokeStyle = `rgba(232,149,107,${Math.max(it.progress, l * 0.8)})`;
            this.rr(x - 5, y - 5, w + 10, h + 10, 10); ctx.stroke();
        }
        ctx.restore();
    }

    draw_postit(it, x, y, w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = C.postit; ctx.fillRect(x, y, w, h);
        const g = ctx.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(120,80,0,.12)');
        ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
        // coin corné
        ctx.fillStyle = '#e2bf5b';
        ctx.beginPath(); ctx.moveTo(x + w, y + h - 26); ctx.lineTo(x + w - 26, y + h); ctx.lineTo(x + w, y + h); ctx.fill();
        // punaise
        ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.arc(3, y + 16, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#d9604a'; ctx.beginPath(); ctx.arc(0, y + 13, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(-3, y + 10, 3, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#4a3520'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = `700 40px ${HAND}`; ctx.fillText('À propos', 0, y + h * 0.43);
        ctx.font = `600 24px ${HAND}`; ctx.fillText('qui je suis,', 0, y + h * 0.66);
        ctx.fillText('ce que je cherche', 0, y + h * 0.8);
    }

    draw_notebook(it, x, y, w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#e9dccd'; this.rr(x + 6, y + 4, w, h - 4, 6); ctx.fill();   // tranche des pages
        ctx.fillStyle = '#5f7a5b'; this.rr(x, y, w, h, 6); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(x, y, 16, h);                // reliure
        ctx.fillStyle = '#2b1d14'; ctx.fillRect(x + w - 34, y, 9, h);               // élastique
        // étiquette
        ctx.fillStyle = C.paper; this.rr(x + 34, y + h / 2 - 40, w - 90, 80, 4); ctx.fill();
        ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.font = `700 21px ${SANS}`; ctx.fillText('Compétences', x + 48, y + h / 2 - 10);
        ctx.font = `500 12px ${MONO}`; ctx.fillStyle = '#6b7f67'; ctx.fillText('stack.json', x + 48, y + h / 2 + 16);
    }

    draw_polaroid(it, x, y, w, h) {
        const ctx = this.ctx;
        // second polaroïd glissé dessous
        ctx.save(); ctx.rotate(-8 * Math.PI / 180); ctx.translate(-14, 6);
        ctx.fillStyle = '#ece4d8'; ctx.fillRect(x, y, w, h);
        this.drawCover(this.covers[1], x + 12, y + 12, w - 24, h * 0.66);
        ctx.restore();

        ctx.fillStyle = C.paper; ctx.fillRect(x, y, w, h);
        this.drawCover(this.covers[0], x + 12, y + 12, w - 24, h * 0.66);
        ctx.fillStyle = '#4a3520'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = `700 34px ${HAND}`; ctx.fillText('Mes projets', 0, y + h * 0.83);
        // ruban adhésif
        ctx.fillStyle = 'rgba(233,220,205,.55)';
        ctx.save(); ctx.translate(0, y + 2); ctx.rotate(-0.05); ctx.fillRect(-36, -11, 72, 22); ctx.restore();
    }

    draw_card(it, x, y, w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#f5ede6'; this.rr(x, y, w, h, 6); ctx.fill();
        ctx.fillStyle = C.clay; ctx.fillRect(x, y, 10, h);
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = C.ink; ctx.font = `700 22px ${SANS}`; ctx.fillText('Evan Pouteau', x + 30, y + 46);
        ctx.fillStyle = '#7a6453'; ctx.font = `500 13px ${SANS}`; ctx.fillText('Développeur web full-stack', x + 30, y + 68);
        ctx.fillStyle = '#b85f34'; ctx.font = `600 11.5px ${MONO}`;
        ctx.fillText('pouteauevan@gmail.com', x + 30, y + h - 46);
        ctx.fillText('github.com/EvanPouteau', x + 30, y + h - 26);
        ctx.fillStyle = 'rgba(232,149,107,.9)'; ctx.font = `700 26px ${HAND}`; ctx.textAlign = 'right';
        ctx.fillText('Contact', x + w - 18, y + 40);
    }

    /* Sur téléphone, des étiquettes plus simples, empilées. */
    drawCompact(it, x, y, w, h) {
        const ctx = this.ctx;
        const bg = { postit: C.postit, notebook: '#5f7a5b', polaroid: C.paper, card: '#f5ede6' }[it.kind];
        ctx.fillStyle = bg; this.rr(x, y, w, h, 6); ctx.fill();
        ctx.fillStyle = it.kind === 'notebook' ? C.paper : C.clay; ctx.fillRect(x, y, 8, h);
        ctx.fillStyle = it.kind === 'notebook' ? C.paper : '#4a3520';
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.font = `700 30px ${HAND}`; ctx.fillText(it.label, x + 24, 2);
    }

    drawCover(img, x, y, w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#2b1d14'; ctx.fillRect(x, y, w, h);
        if (img.complete && img.naturalWidth) {
            const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
            const sw = w / s, sh = h / s;
            ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
        }
    }

    drawHold(it) {
        const ctx = this.ctx;
        ctx.save();
        ctx.lineCap = 'round'; ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(255,230,194,.25)';
        ctx.beginPath(); ctx.arc(this.cursor.x, this.cursor.y, 24, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = C.clay; ctx.shadowColor = C.clay; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(this.cursor.x, this.cursor.y, 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * it.progress); ctx.stroke();
        ctx.restore();
    }

    drawCursor() {
        const ctx = this.ctx, on = this.pointerActive;
        ctx.save();
        ctx.beginPath(); ctx.arc(this.cursor.x, this.cursor.y, 13, 0, Math.PI * 2);
        ctx.strokeStyle = on ? 'rgba(255,230,194,.85)' : 'rgba(255,230,194,.3)'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(this.cursor.x, this.cursor.y, 4, 0, Math.PI * 2);
        ctx.shadowBlur = on ? 14 : 0; ctx.shadowColor = '#ffb070';
        ctx.fillStyle = on ? '#ffe6c2' : 'rgba(255,230,194,.5)'; ctx.fill();
        ctx.restore();
    }

    rr(x, y, w, h, r) {
        const ctx = this.ctx;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
    }

    /* ---------- fenêtre d'information ---------- */
    openPanel(it) {
        this.activeId = it.id;
        document.getElementById('panel-title').textContent = it.title;
        document.getElementById('panel-file').textContent = it.label;
        document.getElementById('panel-icon').className = 'ph ' + it.icon;
        document.getElementById('panel-content').innerHTML = it.content;
        this.panel.style.setProperty('--accent', it.id === 'skills' ? C.sage : it.id === 'about' ? C.mustard : C.clay);
        this.panel.classList.remove('hidden');
        this.note.classList.add('hidden');
    }

    closePanel() {
        if (!this.activeId) return;
        this.activeId = null;
        this.items.forEach(i => { i.progress = 0; });
        this.panel.classList.add('hidden');
        if (this.mode) this.note.classList.remove('hidden');
    }
}

addEventListener('load', () => { window.gestureApp = new GesturalPortfolio(); });
