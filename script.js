document.addEventListener('DOMContentLoaded', () => {
    /* --- 1. Scroll Animations (Intersection Observer) --- */
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    /* --- 2. 3D Tilt & Glow for Bento Cards --- */
    document.querySelectorAll('.bento-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
            
            // 3D Tilt effect
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });

    /* --- 3. Scroll Timeline --- */
    const scrollLine = document.getElementById('scroll-line');
    window.addEventListener('scroll', () => {
        if (!scrollLine) return;
        const scrollPx = document.documentElement.scrollTop;
        const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = `${(scrollPx / winHeightPx) * 100}%`;
        scrollLine.style.height = scrolled;
    });

    /* --- 4. Text Scramble Effect --- */
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.update = this.update.bind(this);
        }
        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                this.queue.push({ from, to, start, end });
            }
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }
        update() {
            let output = '';
            let complete = 0;
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.randomChar();
                        this.queue[i].char = char;
                    }
                    output += `<span style="color:#888">${char}</span>`;
                } else {
                    output += from;
                }
            }
            this.el.innerHTML = output;
            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }
        randomChar() {
            return this.chars[Math.floor(Math.random() * this.chars.length)];
        }
    }
    document.querySelectorAll('.scramble-text').forEach(el => {
        const text = el.getAttribute('data-text');
        const fx = new TextScramble(el);
        setTimeout(() => fx.setText(text), 500);
    });

    /* --- 5. FAQ Accordion --- */
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('active');
            const answer = button.nextElementSibling;
            if (button.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = 0;
            }
        });
    });

    /* --- 6. Terminal Simulator --- */
    const termBody = document.getElementById('term-typing');
    const commands = [
        { text: "$ block run production.blk", type: "cmd", delay: 1000 },
        { text: "[System] Parsing AST for polyglot execution...", type: "info", delay: 800 },
        { text: "[Node.js] Spawning V8 Engine process... OK", type: "info", delay: 500 },
        { text: "[Python] Activating Virtual Environment... OK", type: "info", delay: 600 },
        { text: "[Security] 3-Stage string mask applied to cross-boundary variables.", type: "warning", delay: 700 },
        { text: "[Orchestrator] Execution completed successfully in 42ms.", type: "success", delay: 400 }
    ];
    
    let cmdIndex = 0;
    const typeCommand = async () => {
        if (cmdIndex >= commands.length) return;
        const cmd = commands[cmdIndex];
        const line = document.createElement('div');
        line.className = `term-line ${cmd.type === 'cmd' ? '' : cmd.type}`;
        termBody.appendChild(line);
        
        if (cmd.type === 'cmd') {
            line.innerHTML = `<span class="prompt">root@server:~#</span>`;
            const textNode = document.createTextNode('');
            line.appendChild(textNode);
            for (let i = 0; i < cmd.text.length; i++) {
                textNode.textContent += cmd.text.charAt(i);
                await new Promise(r => setTimeout(r, 50));
            }
        } else {
            const d = new Date();
            const timeStr = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}.0${Math.floor(Math.random()*9)}`;
            line.innerHTML = `<span class="timestamp">[${timeStr}]</span> ${cmd.text}`;
        }
        
        cmdIndex++;
        setTimeout(typeCommand, cmd.delay);
    };
    
    // Start terminal animation when it comes into view
    const termObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            setTimeout(typeCommand, 500);
            termObserver.disconnect();
        }
    }, { threshold: 0.5 });
    if (termBody) termObserver.observe(termBody);

    /* --- 7. Canvas 3D Starfield --- */
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    const stars = [];
    
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();
    
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            z: Math.random() * 2,
            opacity: Math.random()
        });
    }
    
    let mouseX = width / 2;
    let mouseY = height / 2;
    window.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function drawStars() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        
        const diffX = (mouseX - width / 2) * 0.05;
        const diffY = (mouseY - height / 2) * 0.05;
        
        stars.forEach(star => {
            ctx.globalAlpha = star.opacity;
            ctx.beginPath();
            ctx.arc(
                star.x - diffX * star.z,
                star.y - diffY * star.z,
                star.z * 1.5,
                0, Math.PI * 2
            );
            ctx.fill();
            
            star.y -= 0.2 * star.z;
            if (star.y < 0) {
                star.y = height;
                star.x = Math.random() * width;
            }
        });
        requestAnimationFrame(drawStars);
    }
    drawStars();

    /* --- 8. Custom Geometric Cursor --- */
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    document.body.appendChild(cursor);

    window.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    });
});
