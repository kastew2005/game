export class UIManager {
    constructor(ctx, soundManager, toastManager) {
        this.ctx = ctx;
        this.soundManager = soundManager;
        this.toastManager = toastManager;
        this.W = 1600;
        this.H = 900;
        this.showMenu = false;
        this.sprintActive = false;
        this.selectedTab = 'inventory';
        this.tabs = ['inventory', 'stats'];
        this.tabNames = {
            inventory: '📦 Инвентарь',
            stats: '📊 Статистика'
        };
    }

    render(player, zombieManager, inputManager) {
        if (!player) return;
        this.drawUI(player);
        
        if (this.showMenu) {
            this.drawMenu(player);
        }
    }

    drawUI(player) {
        const ctx = this.ctx;
        if (!player) return;
        
        ctx.fillStyle = 'rgba(10,15,10,0.85)';
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.beginPath();
        ctx.roundRect(15, 15, 380, 110, 14);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#e0e8d0';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        const hpRatio = player.health / player.maxHealth;
        ctx.fillStyle = hpRatio > 0.5 ? '#44cc44' : hpRatio > 0.25 ? '#cccc44' : '#cc4444';
        ctx.fillRect(28, 24, 120, 6);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(28, 24, 120 * (1 - hpRatio), 6);
        ctx.fillStyle = '#e0e8d0';
        ctx.fillText(`❤️ ${Math.floor(player.health)}/${player.maxHealth}`, 30, 22);
        
        ctx.fillText(`🍖 ${Math.floor(player.hunger)}%  💧 ${Math.floor(player.thirst)}%`, 30, 44);
        ctx.fillText(`⚡ ${Math.floor(player.energy)}%  🏃 ${Math.floor(player.stamina)}%`, 30, 66);
        ctx.fillText(`🎯 ${player.kills || 0} убийств  ⭐ ${player.level}  🛡️ ${Math.floor(player.shield || 0)}`, 30, 88);

        // Кнопки
        this.drawButtons(player);
        
        if (player.poison > 0) {
            ctx.fillStyle = 'rgba(100,0,0,0.7)';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top';
            ctx.fillText(`☠️ ${player.poison}`, 410, 22);
        }
    }

    drawButtons(player) {
        const ctx = this.ctx;
        if (!player) return;
        
        const buttons = {
            attack: { x: 1200, y: 580, radius: 55, label: '⚔️', color: '#cc4444' },
            loot: { x: 1060, y: 580, radius: 48, label: '📦', color: '#44aacc' },
            craft: { x: 920, y: 580, radius: 48, label: '🔧', color: '#ccaa44' },
            menu: { x: 180, y: 80, radius: 40, label: '☰', color: '#8866aa' },
            sprint: { x: 340, y: 620, radius: 44, label: '🏃', color: '#66aa44' }
        };
        
        for (let key in buttons) {
            const btn = buttons[key];
            const isActive = key === 'sprint' && this.sprintActive;
            
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.fillStyle = isActive ? '#88dd66' : btn.color + 'cc';
            ctx.beginPath();
            ctx.arc(btn.x, btn.y, btn.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = isActive ? '#ffffff66' : 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#f0f8e0';
            ctx.font = 'bold 28px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(btn.label, btn.x, btn.y + 2);
            
            if (key === 'attack' && player.attackCooldown > 0) {
                const progress = player.attackCooldown / 18;
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.beginPath();
                ctx.moveTo(btn.x, btn.y);
                ctx.arc(btn.x, btn.y, btn.radius, -Math.PI/2, -Math.PI/2 + progress * Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
            
            if (key === 'sprint' && isActive) {
                ctx.fillStyle = 'rgba(255,255,200,0.15)';
                ctx.beginPath();
                ctx.arc(btn.x, btn.y, btn.radius + 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    drawMenu(player) {
        const ctx = this.ctx;
        const W = this.W, H = this.H;
        
        ctx.fillStyle = 'rgba(5,10,5,0.94)';
        ctx.fillRect(0, 0, W, H);
        
        ctx.fillStyle = '#c8d8b0';
        ctx.font = 'bold 34px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('📊 ИНФОРМАЦИЯ', W/2, 30);
        
        // Статистика
        const stats = [
            { label: 'Уровень', value: player.level },
            { label: 'Здоровье', value: `${Math.floor(player.health)}/${player.maxHealth}` },
            { label: 'Убийств', value: player.kills || 0 },
            { label: 'Дней выжито', value: player.daysSurvived || 0 },
            { label: 'Золото', value: window.inventory ? window.inventory.getItemCount('gold') : 0 },
            { label: 'Броня', value: player.armor || 0 },
            { label: 'Щит', value: Math.floor(player.shield || 0) },
            { label: 'Опыт', value: `${player.experience}/${player.level * 25}` }
        ];
        
        const startX = (W - 500) / 2;
        let y = 120;
        
        for (let stat of stats) {
            ctx.fillStyle = 'rgba(40,60,40,0.4)';
            ctx.beginPath();
            ctx.roundRect(startX, y, 500, 45, 10);
            ctx.fill();
            
            ctx.fillStyle = '#e0e8d0';
            ctx.font = '18px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(stat.label, startX + 20, y + 22);
            ctx.fillStyle = '#ffdd44';
            ctx.textAlign = 'right';
            ctx.fillText(stat.value, startX + 480, y + 22);
            y += 55;
        }
        
        // Кнопка закрытия
        ctx.fillStyle = '#5a7a4a';
        ctx.beginPath();
        ctx.roundRect(W/2 - 80, H - 80, 160, 45, 12);
        ctx.fill();
        ctx.fillStyle = '#f0f8e0';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✕ Закрыть', W/2, H - 58);
    }

    toggleSprint() {
        this.sprintActive = !this.sprintActive;
        if (this.sprintActive && this.soundManager) {
            this.soundManager.play('craft');
        }
        return this.sprintActive;
    }
}
