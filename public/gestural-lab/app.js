/* ============================================================
   GESTURE AI — portfolio piloté à la main (MediaPipe Hands)
   Refonte design "dev.studio" + aperçu caméra + retours visuels
   ============================================================ */

class GesturalPortfolio {
    constructor() {
        this.video    = document.getElementById('webcam');
        this.canvas   = document.getElementById('output-canvas');
        this.ctx      = this.canvas.getContext('2d');
        this.startBtn = document.getElementById('start-btn');
        this.startScreen = document.getElementById('start-screen');
        this.startError  = document.getElementById('start-error');
        this.statusEl = document.getElementById('lab-status');
        this.panel    = document.getElementById('info-panel');
        this.hints    = document.getElementById('hints');
        this.pip      = document.getElementById('pip');
        this.pipCanvas = document.getElementById('pip-canvas');
        this.pipCtx   = this.pipCanvas.getContext('2d');

        // Palette cohérente avec le portfolio principal
        const C = { cyan:'#1fe0d4', violet:'#7c5cff', green:'#b9f27c', pink:'#ff6b9d' };

        this.targetCursor   = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.smoothedCursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.cursorHistory  = [];
        this.swipeCooldown  = 0;
        this.handVisible    = false;
        this.lastHand       = null;

        // Particules d'ambiance (violet / cyan)
        this.particles = Array.from({ length: 46 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 1.8 + 0.6,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            alpha: Math.random() * 0.5 + 0.15,
            color: Math.random() > 0.5 ? C.cyan : C.violet
        }));

        this.blocks = [
            { id: 1, color: C.cyan, title: "À propos", file: "about.md", index: "01",
              content: `<p style="margin-top:0;"><strong>Étudiant en BUT MMI</strong> — Métiers du Multimédia et de l'Internet.</p>
                <p>Développeur web en formation, je conçois des expériences digitales où la rigueur du code rencontre une esthétique soignée. Vous découvrirez ici mes compétences techniques, mes créations graphiques (Photoshop, InDesign) et les technologies que je maîtrise ou que j'étudie.</p>`,
              hoverProgress: 0, x: 0, y: 0, w: 0, h: 0, drawX: 0, drawY: 0 },

            { id: 2, color: C.violet, title: "Compétences", file: "skills.json", index: "02",
              content: `<strong>Développement</strong>
                <ul>
                    <li><strong>HTML / CSS :</strong> <em>élevé</em></li>
                    <li><strong>JavaScript :</strong> <em>intermédiaire</em></li>
                    <li><strong>Python :</strong> <em>intermédiaire</em></li>
                    <li><strong>C++ :</strong> <em>débutant</em></li>
                </ul>
                <strong>Création graphique</strong>
                <ul>
                    <li><strong>Photoshop :</strong> <em>intermédiaire</em></li>
                    <li><strong>InDesign :</strong> <em>intermédiaire</em></li>
                </ul>
                <strong>Langues</strong>
                <p>Français (C2) · Anglais (B1)</p>`,
              hoverProgress: 0, x: 0, y: 0, w: 0, h: 0, drawX: 0, drawY: 0 },

            { id: 3, color: C.green, title: "Projets", file: "projects.dir", index: "03",
              content: `<h4>Conception d'un GDD</h4>
                <p>Création en équipe d'un Game Design Document sur un jeu narratif inspiré de <em>Detroit : Become Human</em> : mécaniques, visuels des personnages et arborescence de l'histoire.</p>
                <h4>Musée Crozatier — Identité visuelle</h4>
                <p>Projet collaboratif pour moderniser l'image du musée : création du logo, puis réalisation des supports de communication dans le respect strict de la charte graphique (Suite Adobe).</p>
                <h4>Lobby de l'Urbex</h4>
                <p>Plateforme web de référencement d'exploration urbaine avec système CRUD complet (PHP, SQL, JavaScript).</p>`,
              hoverProgress: 0, x: 0, y: 0, w: 0, h: 0, drawX: 0, drawY: 0 },

            { id: 4, color: C.pink, title: "Contact", file: "contact.sh", index: "04",
              content: `<div style="text-align:center; margin-top:10px;">
                    <p style="font-size:1.05rem; margin-bottom:12px;"><strong>Email</strong><br><a href="mailto:pouteauevan@gmail.com">pouteauevan@gmail.com</a></p>
                    <p style="font-size:1.05rem;"><strong>LinkedIn</strong><br><a href="https://www.linkedin.com/in/evan-pouteau-06a9a7342" target="_blank">Evan Pouteau</a></p>
                </div>`,
              hoverProgress: 0, x: 0, y: 0, w: 0, h: 0, drawX: 0, drawY: 0 }
        ];

        this.activeBlockId = null;

        window.addEventListener('resize', () => this.updateLayout());
        this.updateLayout();
        this.initAI();
    }

    /* --- MOTEUR RESPONSIVE --- */
    updateLayout() {
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;

        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            const blockW = window.innerWidth * 0.82;
            const blockH = 64;
            const startX = (window.innerWidth - blockW) / 2;
            const topPad = 120, botPad = 140;
            const usable = window.innerHeight - topPad - botPad;
            const spacingY = (usable - blockH * 4) / 3;
            for (let i = 0; i < 4; i++) {
                this.blocks[i].w = blockW;
                this.blocks[i].h = blockH;
                this.blocks[i].x = startX;
                this.blocks[i].y = topPad + i * (blockH + spacingY);
            }
        } else {
            const blockW = 280, blockH = 130;
            this.blocks[0].x = window.innerWidth * 0.14; this.blocks[0].y = window.innerHeight * 0.24;
            this.blocks[1].x = window.innerWidth * 0.64; this.blocks[1].y = window.innerHeight * 0.24;
            this.blocks[2].x = window.innerWidth * 0.14; this.blocks[2].y = window.innerHeight * 0.60;
            this.blocks[3].x = window.innerWidth * 0.64; this.blocks[3].y = window.innerHeight * 0.60;
            for (let i = 0; i < 4; i++) { this.blocks[i].w = blockW; this.blocks[i].h = blockH; }
        }
    }

    setStatus(text, state) {
        if (!this.statusEl) return;
        const dot = this.statusEl.querySelector('.dot');
        this.statusEl.childNodes[this.statusEl.childNodes.length - 1].textContent = ' ' + text;
        if (dot) dot.className = 'dot ' + (state || 'off');
    }

    async initAI() {
        let hands;
        try {
            hands = new Hands({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
            hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
            hands.onResults((r) => this.onResults(r));
        } catch (e) {
            this.showError("Impossible de charger le moteur de détection (vérifiez votre connexion).");
            return;
        }

        this.startBtn.addEventListener('click', async () => {
            this.startBtn.disabled = true;
            this.setStatus('caméra : démarrage…', 'off');
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                this.video.srcObject = stream;
                this.video.addEventListener('loadeddata', () => {
                    this.startScreen.classList.add('hidden');
                    this.pip.classList.remove('hidden');
                    this.hints.classList.remove('hidden');
                    this.setStatus('caméra : active', 'live');
                    this.loopAI(hands);
                    this.renderLoop();
                }, { once: true });
            } catch (err) {
                this.startBtn.disabled = false;
                this.setStatus('caméra : refusée', 'off');
                const msg = (err && err.name === 'NotAllowedError')
                    ? "Accès caméra refusé. Autorisez la caméra dans votre navigateur puis réessayez."
                    : "Aucune caméra disponible ou accès impossible sur cet appareil.";
                this.showError(msg);
            }
        });
    }

    showError(msg) {
        if (!this.startError) return;
        this.startError.textContent = '⚠ ' + msg;
        this.startError.classList.remove('hidden');
    }

    onResults(results) {
        const hasHand = results.multiHandLandmarks && results.multiHandLandmarks.length > 0;
        this.handVisible = hasHand;
        if (hasHand) {
            const lm = results.multiHandLandmarks[0];
            this.lastHand = lm;
            const indexTip = lm[8];
            this.targetCursor.x = (1 - indexTip.x) * this.canvas.width;
            this.targetCursor.y = indexTip.y * this.canvas.height;
        } else {
            this.lastHand = null;
        }
        this.drawPip(results, hasHand);
    }

    /* --- Aperçu caméra miroir + squelette de main --- */
    drawPip(results, hasHand) {
        const w = this.pipCanvas.width, h = this.pipCanvas.height;
        const c = this.pipCtx;
        c.save();
        c.clearRect(0, 0, w, h);
        // image miroir
        c.translate(w, 0); c.scale(-1, 1);
        if (results.image) c.drawImage(results.image, 0, 0, w, h);
        // voile sombre pour lisibilité
        c.fillStyle = 'rgba(10,11,15,0.35)';
        c.fillRect(0, 0, w, h);
        // squelette
        if (hasHand && typeof drawConnectors !== 'undefined' && typeof HAND_CONNECTIONS !== 'undefined') {
            drawConnectors(c, results.multiHandLandmarks[0], HAND_CONNECTIONS, { color: 'rgba(31,224,212,0.85)', lineWidth: 2 });
            drawLandmarks(c, results.multiHandLandmarks[0], { color: '#7c5cff', fillColor: '#ffffff', lineWidth: 1, radius: 2.5 });
            // point fort sur le bout de l'index
            const tip = results.multiHandLandmarks[0][8];
            c.beginPath();
            c.arc(tip.x * w, tip.y * h, 5, 0, Math.PI * 2);
            c.fillStyle = '#1fe0d4'; c.fill();
        }
        c.restore();
        // cadre "pas de main"
        if (!hasHand) {
            c.font = '600 11px "JetBrains Mono", monospace';
            c.fillStyle = 'rgba(255,255,255,0.6)';
            c.textAlign = 'center';
            c.fillText('montrez votre main', w / 2, h - 12);
        }
    }

    async loopAI(hands) {
        if (this.video.readyState >= 2) {
            try { await hands.send({ image: this.video }); } catch (e) { /* frame ignorée */ }
        }
        requestAnimationFrame(() => this.loopAI(hands));
    }

    /* --- BOUCLE DE RENDU PRINCIPALE --- */
    renderLoop() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const previousX = this.smoothedCursor.x;
        this.smoothedCursor.x += (this.targetCursor.x - this.smoothedCursor.x) * 0.2;
        this.smoothedCursor.y += (this.targetCursor.y - this.smoothedCursor.y) * 0.2;

        // détection de balayage (fermeture)
        const velocityX = this.smoothedCursor.x - previousX;
        this.cursorHistory.push(velocityX);
        if (this.cursorHistory.length > 5) this.cursorHistory.shift();
        const avgVel = this.cursorHistory.reduce((a, b) => a + b, 0) / this.cursorHistory.length;
        if (Math.abs(avgVel) > 40 && this.activeBlockId !== null && this.swipeCooldown <= 0) {
            this.closePanel(); this.swipeCooldown = 30;
        }
        if (this.swipeCooldown > 0) this.swipeCooldown--;

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const parallaxX = (this.smoothedCursor.x - centerX) * 0.03;
        const parallaxY = (this.smoothedCursor.y - centerY) * 0.03;

        this.drawBackgroundGrid(parallaxX, parallaxY);
        this.drawAmbient(parallaxX, parallaxY);
        this.drawConnections(centerX, centerY, parallaxX, parallaxY);

        let isHandOverAnyBlock = false;
        for (let block of this.blocks) {
            const bcx = block.x + block.w / 2;
            const bcy = block.y + block.h / 2;
            const dist = Math.hypot(this.smoothedCursor.x - bcx, this.smoothedCursor.y - bcy);

            if (dist < 250) {
                block.drawX = block.x - parallaxX + (this.smoothedCursor.x - bcx) * 0.05;
                block.drawY = block.y - parallaxY + (this.smoothedCursor.y - bcy) * 0.05;
            } else {
                block.drawX = block.x - parallaxX;
                block.drawY = block.y - parallaxY;
            }

            const over = this.smoothedCursor.x > block.drawX && this.smoothedCursor.x < block.drawX + block.w &&
                         this.smoothedCursor.y > block.drawY && this.smoothedCursor.y < block.drawY + block.h;

            if (over && this.handVisible) {
                isHandOverAnyBlock = true;
                block.hoverProgress = Math.min(100, block.hoverProgress + 3);
                this.drawLoadingArc(block);
                if (block.hoverProgress >= 100 && this.activeBlockId !== block.id) this.openPanel(block);
            } else if (block.hoverProgress > 0) {
                block.hoverProgress -= 3;
            }
        }

        if (!isHandOverAnyBlock && this.activeBlockId !== null && this.swipeCooldown <= 0) {
            if (this.blocks.every(b => b.hoverProgress <= 0)) this.closePanel();
        }

        this.drawBlocks();
        this.drawCursor();

        requestAnimationFrame(() => this.renderLoop());
    }

    drawBackgroundGrid(pX, pY) {
        const ctx = this.ctx;
        ctx.strokeStyle = 'rgba(124,140,200,0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const step = 70;
        const offX = -pX % step, offY = -pY % step;
        for (let i = -step + offX; i < this.canvas.width + step; i += step) { ctx.moveTo(i, 0); ctx.lineTo(i, this.canvas.height); }
        for (let j = -step + offY; j < this.canvas.height + step; j += step) { ctx.moveTo(0, j); ctx.lineTo(this.canvas.width, j); }
        ctx.stroke();
    }

    drawAmbient(pX, pY) {
        const ctx = this.ctx;
        this.particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x - pX * 0.5, p.y - pY * 0.5, p.size, 0, Math.PI * 2);
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    drawConnections(centerX, centerY, pX, pY) {
        const ctx = this.ctx;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 7]);
        for (let block of this.blocks) {
            if (block.hoverProgress > 0) {
                ctx.strokeStyle = block.color;
                ctx.globalAlpha = 0.2 + block.hoverProgress / 200;
            } else {
                ctx.strokeStyle = 'rgba(124,140,200,0.10)';
                ctx.globalAlpha = 1;
            }
            ctx.beginPath();
            ctx.moveTo(centerX - pX, centerY - pY);
            const tx = (block.drawX > centerX - pX) ? block.drawX : block.drawX + block.w;
            ctx.lineTo(tx, block.drawY + block.h / 2);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
    }

    drawLoadingArc(block) {
        const ctx = this.ctx;
        ctx.save();
        ctx.shadowBlur = 14; ctx.shadowColor = block.color;
        ctx.beginPath();
        ctx.arc(this.smoothedCursor.x, this.smoothedCursor.y, 22, -Math.PI / 2, (-Math.PI / 2) + Math.PI * 2 * (block.hoverProgress / 100));
        ctx.strokeStyle = block.color; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();
    }

    drawBlocks() {
        const ctx = this.ctx;
        const isMobile = window.innerWidth < 768;
        for (let block of this.blocks) {
            const r = 14;
            const hp = block.hoverProgress / 100;

            // fond
            ctx.save();
            this.roundRect(block.drawX, block.drawY, block.w, block.h, r);
            ctx.fillStyle = 'rgba(20,22,30,0.62)';
            ctx.fill();

            // glow + bordure selon le survol
            if (hp > 0) {
                ctx.shadowBlur = 26 * hp; ctx.shadowColor = block.color;
            }
            ctx.lineWidth = 1 + hp;
            ctx.strokeStyle = hp > 0
                ? this.rgba(block.color, 0.35 + 0.55 * hp)
                : 'rgba(124,140,200,0.14)';
            ctx.stroke();
            ctx.restore();

            // teinte de remplissage au survol
            if (hp > 0) {
                ctx.save();
                this.roundRect(block.drawX, block.drawY, block.w, block.h, r);
                ctx.fillStyle = this.rgba(block.color, 0.05 + 0.10 * hp);
                ctx.fill();
                ctx.restore();
            }

            // pastille d'accent (gauche)
            ctx.fillStyle = block.color;
            ctx.globalAlpha = 0.5 + 0.5 * hp;
            this.roundRect(block.drawX + 16, block.drawY + block.h / 2 - 12, 4, 24, 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            // index + fichier (mono) — uniquement en disposition large (blocs hauts)
            ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
            if (!isMobile) {
                ctx.font = '500 12px "JetBrains Mono", monospace';
                ctx.fillStyle = this.rgba(block.color, 0.9);
                ctx.fillText(block.index, block.drawX + 30, block.drawY + 28);

                ctx.fillStyle = 'rgba(139,143,158,0.8)';
                ctx.font = '400 11px "JetBrains Mono", monospace';
                ctx.fillText(block.file, block.drawX + 30, block.drawY + block.h - 18);
            }

            // titre (sans)
            ctx.fillStyle = '#ffffff';
            ctx.font = `700 ${isMobile ? 18 : 22}px "Space Grotesk", system-ui, sans-serif`;
            ctx.textBaseline = 'middle';
            const ty = isMobile ? block.drawY + block.h / 2 : block.drawY + block.h / 2 + 4;
            ctx.fillText(block.title, block.drawX + 30, ty);
        }
    }

    drawCursor() {
        const ctx = this.ctx;
        const active = this.handVisible;
        ctx.save();
        // anneau
        ctx.beginPath();
        ctx.arc(this.smoothedCursor.x, this.smoothedCursor.y, 13, 0, Math.PI * 2);
        ctx.strokeStyle = active ? 'rgba(31,224,212,0.8)' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // point central
        ctx.beginPath();
        ctx.arc(this.smoothedCursor.x, this.smoothedCursor.y, 3, 0, Math.PI * 2);
        ctx.shadowBlur = active ? 12 : 0; ctx.shadowColor = '#1fe0d4';
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
    }

    /* --- utilitaires --- */
    roundRect(x, y, w, h, r) {
        const ctx = this.ctx;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
        else ctx.rect(x, y, w, h);
    }
    rgba(hex, a) {
        const n = parseInt(hex.slice(1), 16);
        return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    }

    openPanel(block) {
        this.activeBlockId = block.id;
        document.getElementById('panel-title').textContent = block.title;
        document.getElementById('panel-file').textContent = block.file;
        document.getElementById('panel-content').innerHTML = block.content;
        this.panel.style.setProperty('--accent', block.color);
        this.panel.style.borderColor = this.rgba(block.color, 0.5);
        this.panel.classList.remove('hidden');
    }

    closePanel() {
        this.activeBlockId = null;
        this.blocks.forEach(b => b.hoverProgress = 0);
        this.panel.classList.add('hidden');
    }
}

window.onload = () => { window.gestureApp = new GesturalPortfolio(); };
