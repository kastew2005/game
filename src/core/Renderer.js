export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.W = 1600;
        this.H = 900;
        this.cameraX = 0;
        this.cameraY = 0;
        this.particles = [];
        this.damageNumbers = [];
    }

    clear() {
        this.ctx.clearRect(0, 0, this.W, this.H);
    }

    setCamera(x, y) {
        this.cameraX = x;
        this.cameraY = y;
    }

    drawWorld(world, player) {
        const ctx = this.ctx;
        if (!world || !player) return;
        
        ctx.save();
        ctx.translate(-this.cameraX, -this.cameraY);

        ctx.fillStyle = '#3a5a3a';
        ctx.fillRect(0, 0, world.size, world.size);
        
        // Трава
        ctx.fillStyle = 'rgba(50, 80, 50, 0.3)';
        const step = 40;
        for (let x = 0; x < world.size; x += step) {
            for (let y = 0; y < world.size; y += step) {
                if ((x + y) % (step * 2) < step) {
                    ctx.fillRect(x, y, step, step);
                }
            }
        }

        // Объекты мира
        const viewport = {
            left: this.cameraX - 50,
            right: this.cameraX + this.W + 50,
            top: this.cameraY - 50,
            bottom: this.cameraY + this.H + 50
        };
        
        for (let obj of world.objects) {
            if (obj.x > viewport.left && obj.x < viewport.right && 
                obj.y > viewport.top && obj.y < viewport.bottom) {
                this.drawWorldObject(obj);
            }
        }

        ctx.restore();
    }

    drawWorldObject(obj) {
        if (obj.type === 'tree') this.drawTree(obj);
        else if (obj.type === 'bush') this.drawBush(obj);
        else if (obj.type === 'rock') this.drawRock(obj);
    }

    drawTree(obj) {
        const ctx = this.ctx;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#1a2a1a';
        ctx.beginPath();
        ctx.ellipse(obj.x + 3, obj.y + 10, obj.radius * 0.7, obj.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#5a3d2a';
        ctx.fillRect(obj.x - 4, obj.y - 3, 8, 18);
        const colors = ['#2a6a2a', '#3a8a3a', '#4a9a4a'];
        for (let i = 0; i < 4; i++) {
            const angle = i / 4 * Math.PI * 2 + 0.3;
            const radius = obj.radius * 0.5;
            const cx = obj.x + Math.cos(angle) * radius * 0.4;
            const cy = obj.y - 4 + Math.sin(angle) * radius * 0.3;
            ctx.fillStyle = colors[i % colors.length];
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawBush(obj) {
        const ctx = this.ctx;
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 10;
        const colors = ['#2a5a2a', '#3a7a3a'];
        for (let i = 0; i < 3; i++) {
            const angle = i / 3 * Math.PI * 2 + 0.5;
            const radius = obj.radius * 0.5;
            const cx = obj.x + Math.cos(angle) * radius * 0.3;
            const cy = obj.y + Math.sin(angle) * radius * 0.2;
            ctx.fillStyle = colors[i % colors.length];
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }

    drawRock(obj) {
        const ctx = this.ctx;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#6a6a6a';
        ctx.beginPath();
        ctx.ellipse(obj.x, obj.y + 2, obj.radius, obj.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.ellipse(obj.x - 3, obj.y - 4, obj.radius * 0.2, obj.radius * 0.15, -0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawPlayer(player) {
        const ctx = this.ctx;
        if (!player) return;
        
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 20;
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(player.x + 2, player.y + player.radius * 0.7, player.radius * 0.7, player.radius * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        const grad = ctx.createRadialGradient(player.x - 4, player.y - 4, 3, player.x, player.y, player.radius);
        grad.addColorStop(0, '#f0d5b0');
        grad.addColorStop(0.6, '#dbb894');
        grad.addColorStop(1, '#c4a080');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(20,50,20,0.3)';
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#3a5a3a';
        ctx.fillRect(player.x - 10, player.y - 2, 20, 14);
        ctx.fillStyle = '#4a6a4a';
        ctx.fillRect(player.x - 8, player.y + 4, 16, 6);

        ctx.fillStyle = '#f0d5b0';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(player.x, player.y - player.radius - 4, 11, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#3d2a1a';
        ctx.beginPath();
        ctx.arc(player.x, player.y - player.radius - 8, 11, Math.PI, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(player.x - 4, player.y - player.radius - 6, 3.5, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(player.x + 4, player.y - player.radius - 6, 3.5, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2a3a2a';
        ctx.beginPath();
        ctx.arc(player.x - 3, player.y - player.radius - 5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(player.x + 5, player.y - player.radius - 5, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#dbb894';
        ctx.fillRect(player.x - 14, player.y, 5, 8);
        ctx.fillRect(player.x + 9, player.y, 5, 8);

        ctx.fillStyle = '#2a3a2a';
        ctx.fillRect(player.x - 8, player.y + 12, 5, 10);
        ctx.fillRect(player.x + 3, player.y + 12, 5, 10);

        ctx.fillStyle = '#3d2a1a';
        ctx.fillRect(player.x - 10, player.y + 20, 7, 4);
        ctx.fillRect(player.x + 3, player.y + 20, 7, 4);

        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(player.x - 30, player.y - player.radius - 24, 60, 7);
        const hpRatio = player.health / player.maxHealth;
        ctx.fillStyle = hpRatio > 0.5 ? '#44cc44' : hpRatio > 0.25 ? '#cccc44' : '#cc4444';
        ctx.fillRect(player.x - 30, player.y - player.radius - 24, 60 * hpRatio, 7);
        
        ctx.fillStyle = '#ffdd44';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`Lv.${player.level}`, player.x, player.y - player.radius - 26);
    }

    drawZombies(zombies) {
        if (!zombies) return;
        for (let z of zombies) {
            this.drawZombie(z);
        }
    }

    drawZombie(z) {
        const ctx = this.ctx;
        if (!z) return;
        
        const isVisible = z.x > this.cameraX - 80 && z.x < this.cameraX + this.W + 80 && 
                         z.y > this.cameraY - 80 && z.y < this.cameraY + this.H + 80;
        if (!isVisible) return;

        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 15;
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(z.x, z.y + z.radius * 0.7, z.radius * 0.7, z.radius * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        const color = z.type === 'tank' ? '#3a4a3a' : z.type === 'runner' ? '#4a4a3a' : '#2a4a2a';
        ctx.fillStyle = color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(40,30,20,0.4)';
        ctx.fillRect(z.x - 8, z.y - 1, 16, 10);

        ctx.fillStyle = '#3a4a3a';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(z.x, z.y - z.radius - 3, 10, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#2a3a2a';
        ctx.beginPath();
        ctx.arc(z.x, z.y - z.radius - 7, 10, Math.PI, 2 * Math.PI);
        ctx.fill();

        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(255,0,0,0.5)';
        ctx.fillStyle = '#ff2222';
        ctx.beginPath();
        ctx.arc(z.x - 4, z.y - z.radius - 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(z.x + 4, z.y - z.radius - 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(z.x - 3, z.y - z.radius - 3, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(z.x + 5, z.y - z.radius - 3, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#8a2a2a';
        ctx.beginPath();
        ctx.arc(z.x, z.y - z.radius + 2, 5, 0.1, Math.PI - 0.1);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(z.x - 22, z.y - z.radius - 16, 44, 5);
        const hpRatio = z.health / z.maxHealth;
        ctx.fillStyle = hpRatio > 0.5 ? '#44cc44' : hpRatio > 0.25 ? '#cccc44' : '#cc4444';
        ctx.fillRect(z.x - 22, z.y - z.radius - 16, 44 * hpRatio, 5);

        ctx.fillStyle = 'rgba(200,200,200,0.5)';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        const typeNames = { walker: 'Ходок', runner: 'Бегун', tank: 'Танк', poisoned: 'Отравленный', hunter: 'Охотник', boss: 'Босс' };
        ctx.fillText(typeNames[z.type] || z.type, z.x, z.y - z.radius - 18);
        ctx.shadowBlur = 0;
    }

    drawLoot(lootItems) {
        if (!lootItems) return;
        const ctx = this.ctx;
        for (let item of lootItems) {
            const bobY = Math.sin(item.bob) * 4;
            
            ctx.shadowColor = '#ffdd44';
            ctx.shadowBlur = 15 * (item.glow || 1);
            ctx.fillStyle = '#f7d44a';
            ctx.beginPath();
            ctx.arc(item.x, item.y + bobY, item.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            const emojis = { wood: '🪵', stone: '🪨', scrap: '🔩', food: '🍖', water: '💧', ammunition: '🔫', gold: '🪙', herbs: '🌿', meat: '🥩' };
            ctx.font = '18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emojis[item.type] || '📦', item.x, item.y + bobY + 1);
        }
    }

    drawParticles() {
        const ctx = this.ctx;
        for (let p of this.particles) {
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * (p.life / p.maxLife), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    addParticles(x, y, count, color, speed, life) {
        for (let i=0; i<count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * speed;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                life: life || 30,
                maxLife: life || 30,
                radius: 2 + Math.random() * 3,
                color: color || '#ffaa44',
            });
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.vy += 0.05;
            p.life--;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    drawMainMenu() {
        const ctx = this.ctx;
        ctx.fillStyle = '#0a0f0a';
        ctx.fillRect(0, 0, this.W, this.H);
        
        ctx.shadowBlur = 40;
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.fillStyle = 'rgba(10,15,10,0.85)';
        ctx.beginPath();
        ctx.roundRect(this.W/2-350, 60, 700, 500, 30);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#c8d8b0';
        ctx.font = 'bold 64px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('⚔️ ВЫЖИВАНИЕ', this.W/2, 90);
        ctx.fillStyle = '#b0c8a0';
        ctx.font = '30px sans-serif';
        ctx.fillText('Last Day on Earth', this.W/2, 175);

        ctx.shadowBlur = 30;
        ctx.shadowColor = 'rgba(50,150,50,0.3)';
        ctx.fillStyle = '#4a8a3a';
        ctx.beginPath();
        ctx.roundRect(this.W/2-160, 300, 320, 75, 18);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#f0f8e0';
        ctx.font = 'bold 38px sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText('▶ ИГРАТЬ', this.W/2, 338);

        ctx.fillStyle = '#6a8a5a';
        ctx.font = '16px sans-serif';
        ctx.textBaseline = 'top';
        const features = ['🔫 Реалистичный бой', '🌳 Огромный мир', '📦 Крафт и инвентарь', '🏃 Спринт'];
        for (let i=0; i<features.length; i++) {
            ctx.fillText(features[i], this.W/2 - 150 + i * 100, 420);
        }

        ctx.fillStyle = '#4a5a4a';
        ctx.font = '14px sans-serif';
        ctx.textBaseline = 'bottom';
        ctx.fillText('v5.1 · Полная версия', this.W/2, 530);
    }

    drawTraders(traders) {
        if (!traders) return;
        for (let trader of traders) {
            this.drawTrader(trader);
        }
    }

    drawTrader(trader) {
        const ctx = this.ctx;
        if (!trader) return;
        
        const isVisible = trader.x > this.cameraX - 50 && trader.x < this.cameraX + this.W + 50 && 
                         trader.y > this.cameraY - 50 && trader.y < this.cameraY + this.H + 50;
        if (!isVisible) return;

        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 15;
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(trader.x + 2, trader.y + 15, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#4a6a4a';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(trader.x, trader.y, trader.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(trader.x - 10, trader.y - 2, 20, 16);
        
        ctx.fillStyle = '#dbb894';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(trader.x, trader.y - trader.radius - 4, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#3d2a1a';
        ctx.fillRect(trader.x - 12, trader.y - trader.radius - 10, 24, 4);
        ctx.fillRect(trader.x - 8, trader.y - trader.radius - 14, 16, 6);

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(trader.x - 3, trader.y - trader.radius - 5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(trader.x + 3, trader.y - trader.radius - 5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2a3a2a';
        ctx.beginPath();
        ctx.arc(trader.x - 2, trader.y - trader.radius - 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(trader.x + 4, trader.y - trader.radius - 4, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffdd44';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(trader.name, trader.x, trader.y - trader.radius - 16);
        
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(trader.x, trader.y + trader.radius + 8, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(trader.x, trader.y + trader.radius + 8, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawDungeonEnemies(enemies) {
        if (!enemies) return;
        for (let enemy of enemies) {
            this.drawDungeonEnemy(enemy);
        }
    }

    drawDungeonEnemy(enemy) {
        const ctx = this.ctx;
        if (!enemy) return;
        
        const isVisible = enemy.x > this.cameraX - 50 && enemy.x < this.cameraX + this.W + 50 && 
                         enemy.y > this.cameraY - 50 && enemy.y < this.cameraY + this.H + 50;
        if (!isVisible) return;

        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 15;
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(enemy.x + 2, enemy.y + 15, 15, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        const color = enemy.type === 'boss' ? '#6a2a2a' : 
                      enemy.type === 'dragon' ? '#2a4a6a' : 
                      enemy.type === 'tank' ? '#3a4a3a' : '#2a4a2a';
        ctx.fillStyle = color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ff2222';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(255,0,0,0.5)';
        ctx.beginPath();
        ctx.arc(enemy.x - 5, enemy.y - 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(enemy.x + 5, enemy.y - 4, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(enemy.x - 22, enemy.y - enemy.radius - 14, 44, 5);
        const hpRatio = enemy.health / enemy.maxHealth;
        ctx.fillStyle = hpRatio > 0.5 ? '#44cc44' : hpRatio > 0.25 ? '#cccc44' : '#cc4444';
        ctx.fillRect(enemy.x - 22, enemy.y - enemy.radius - 14, 44 * hpRatio, 5);

        ctx.fillStyle = 'rgba(200,200,200,0.5)';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(enemy.type.toUpperCase(), enemy.x, enemy.y - enemy.radius - 16);
    }

    drawDungeonInfo(dungeonSystem) {
        if (!dungeonSystem) return;
        const ctx = this.ctx;
        const progress = dungeonSystem.getDungeonProgress();
        const currentRoom = dungeonSystem.getCurrentRoom();
        const totalFloors = dungeonSystem.getTotalFloors();
        
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.beginPath();
        ctx.roundRect(this.W - 220, 140, 200, 60, 10);
        ctx.fill();
        
        ctx.fillStyle = '#ffdd44';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`🏛️ Подземелье`, this.W - 120, 155);
        ctx.fillStyle = '#e0e8d0';
        ctx.font = '12px sans-serif';
        ctx.fillText(`Этаж ${currentRoom + 1}/${totalFloors}`, this.W - 120, 175);
        ctx.fillText(`Прогресс: ${progress}%`, this.W - 120, 195);
    }
}
