export class ZombieManager {
    constructor(world) {
        this.world = world;
        this.zombies = [];
        this.lootItems = [];
        this.maxZombies = 25;
        this.respawnTimer = 0;
        this.respawnInterval = 300;
        this.zombieTypes = {
            walker: { health: 50, speed: 0.7, damage: 6, radius: 18, color: '#2a4a2a', exp: 10 },
            runner: { health: 35, speed: 1.4, damage: 8, radius: 16, color: '#3a4a3a', exp: 15 },
            tank: { health: 90, speed: 0.5, damage: 12, radius: 24, color: '#3a3a2a', exp: 20 },
            poisoned: { health: 45, speed: 0.9, damage: 5, radius: 18, color: '#4a2a3a', exp: 12 },
            hunter: { health: 55, speed: 1.2, damage: 10, radius: 20, color: '#2a3a3a', exp: 18 }
        };
        this.spawnedZombies = new Set();
        this.deathZones = [];
    }

    reset() {
        this.zombies = [];
        this.lootItems = [];
        this.spawnedZombies = new Set();
        this.deathZones = [];
        this.respawnTimer = 0;
    }

    update(player, tick, soundManager) {
        if (!player) return 0;
        
        // Респавн зомби
        this.respawnTimer++;
        if (this.respawnTimer >= this.respawnInterval) {
            this.respawnTimer = 0;
            this.respawnZombies(player);
        }

        let damageDealt = 0;
        
        for (let i = this.zombies.length - 1; i >= 0; i--) {
            const z = this.zombies[i];
            const damage = this.updateZombie(z, player, soundManager);
            if (damage) damageDealt = damage;
            
            if (z.health <= 0) {
                this.dropLoot(z.x, z.y, player);
                this.deathZones.push({ x: z.x, y: z.y, timer: 300 });
                this.zombies.splice(i, 1);
                if (soundManager) soundManager.play('death');
            }
        }

        // Обновление лута
        for (let i = this.lootItems.length - 1; i >= 0; i--) {
            const item = this.lootItems[i];
            item.life--;
            item.bob += 0.06;
            item.glow = Math.sin(item.bob) * 0.3 + 0.7;
            if (item.life <= 0) {
                this.lootItems.splice(i, 1);
            }
        }

        // Обновление зон смерти
        for (let i = this.deathZones.length - 1; i >= 0; i--) {
            this.deathZones[i].timer--;
            if (this.deathZones[i].timer <= 0) {
                this.deathZones.splice(i, 1);
            }
        }

        return damageDealt;
    }

    respawnZombies(player) {
        if (!player) return;
        if (this.zombies.length >= this.maxZombies) return;
        
        const worldSize = this.world ? this.world.size : 5000;
        const attempts = 20;
        
        for (let attempt = 0; attempt < attempts; attempt++) {
            const x = 100 + Math.random() * (worldSize - 200);
            const y = 100 + Math.random() * (worldSize - 200);
            
            if (Math.hypot(x - player.x, y - player.y) < 300) continue;
            
            let inDeathZone = false;
            for (let dz of this.deathZones) {
                if (Math.hypot(x - dz.x, y - dz.y) < 100) {
                    inDeathZone = true;
                    break;
                }
            }
            if (inDeathZone) continue;
            
            const types = ['walker', 'walker', 'walker', 'runner', 'tank', 'poisoned', 'hunter'];
            const type = types[Math.floor(Math.random() * types.length)];
            const template = this.zombieTypes[type];
            if (!template) continue;
            
            const health = template.health + (Math.random() - 0.5) * 20;
            
            this.zombies.push({
                x, y,
                radius: template.radius,
                health: Math.max(20, health),
                maxHealth: Math.max(20, health),
                speed: template.speed + (Math.random() - 0.5) * 0.2,
                attackCooldown: 0,
                type: type,
                attackDamage: template.damage + Math.floor(Math.random() * 3),
                aggroRange: type === 'runner' || type === 'hunter' ? 400 : 250,
                color: template.color,
                exp: template.exp,
                isBoss: false,
                patrolAngle: Math.random() * Math.PI * 2,
                patrolTimer: 0
            });
            
            return;
        }
    }

    updateZombie(z, player, soundManager) {
        if (!z || !player) return 0;
        
        const dx = player.x - z.x;
        const dy = player.y - z.y;
        const dist = Math.hypot(dx, dy);
        let damage = 0;
        
        if (dist < z.aggroRange) {
            const move = z.speed * (z.type === 'runner' ? 1.4 : z.type === 'tank' ? 0.7 : 1);
            z.x += (dx / dist) * move;
            z.y += (dy / dist) * move;
            
            if (dist < 35 && z.attackCooldown <= 0) {
                damage = z.attackDamage + Math.floor(Math.random() * 4);
                player.takeDamage(damage);
                z.attackCooldown = 30 + (z.type === 'runner' ? 10 : 0);
                if (soundManager) soundManager.play('damage');
                
                if (z.type === 'poisoned') {
                    player.addPoison(2, 100);
                }
            }
        } else {
            z.patrolTimer++;
            if (z.patrolTimer > 120) {
                z.patrolTimer = 0;
                z.patrolAngle += (Math.random() - 0.5) * 0.5;
            }
            z.x += Math.cos(z.patrolAngle) * z.speed * 0.3;
            z.y += Math.sin(z.patrolAngle) * z.speed * 0.3;
        }
        
        if (z.attackCooldown > 0) z.attackCooldown--;
        
        const worldSize = this.world ? this.world.size : 5000;
        z.x = Math.max(10, Math.min(worldSize - 10, z.x));
        z.y = Math.max(10, Math.min(worldSize - 10, z.y));
        
        return damage;
    }

    getZombies() {
        return this.zombies;
    }

    getLootItems() {
        return this.lootItems;
    }

    getDeathZones() {
        return this.deathZones;
    }

    dropLoot(x, y, player) {
        if (!player) return;
        
        const types = ['wood', 'stone', 'scrap', 'food', 'water', 'ammunition', 'gold', 'herbs', 'meat'];
        const weights = [0.15, 0.12, 0.12, 0.12, 0.12, 0.08, 0.08, 0.11, 0.10];
        const count = 2 + Math.floor(Math.random() * 5);
        
        for (let i=0; i<count; i++) {
            let r = Math.random();
            let type = types[0];
            let cum = 0;
            for (let j=0; j<types.length; j++) {
                cum += weights[j];
                if (r < cum) { type = types[j]; break; }
            }
            this.lootItems.push({
                x: x + (Math.random() - 0.5) * 70,
                y: y + (Math.random() - 0.5) * 70,
                type: type,
                radius: type === 'gold' ? 10 : 14,
                life: 900,
                bob: Math.random() * Math.PI * 2,
                glow: 0,
            });
        }
        
        const exp = 10 + Math.floor(Math.random() * 5);
        const levelUp = player.addExperience(exp);
        player.kills = (player.kills || 0) + 1;
        
        if (levelUp && window.toastManager) {
            window.toastManager.show(`🎉 Уровень ${player.level}!`, 'special', 2000);
        }
    }
}
