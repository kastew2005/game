export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 18;
        this.health = 100;
        this.maxHealth = 100;
        this.energy = 100;
        this.hunger = 80;
        this.thirst = 75;
        this.attackCooldown = 0;
        this.direction = 0;
        this.speed = 2.4;
        this.stamina = 100;
        this.level = 1;
        this.experience = 0;
        this.kills = 0;
        this.inBush = false;
        this.sprinting = false;
        this.comboCount = 0;
        this.lastAttackTime = 0;
        this.shield = 0;
        this.shieldTimer = 0;
        this.poison = 0;
        this.poisonTimer = 0;
        this.armor = 0;
        this.weapon = null;
        this.gold = 0;
        this.daysSurvived = 0;
        this.temperature = 36.6;
        this.wetness = 0;
        this.fatigue = 0;
        this.speedBonus = 0;
        this.capacityBonus = 0;
        this.attackBonus = 0;
        this.hungerRate = 1;
        this.thirstRate = 1;
        this.comboMultiplier = 1;
        this.lastDamageTime = 0;
        this.invincibleTimer = 0;
        this.xpMultiplier = 1;
        this.lootMultiplier = 1;
    }

    reset() {
        this.x = 3000;
        this.y = 3000;
        this.health = 100;
        this.maxHealth = 100;
        this.energy = 100;
        this.hunger = 80;
        this.thirst = 75;
        this.attackCooldown = 0;
        this.stamina = 100;
        this.level = 1;
        this.experience = 0;
        this.kills = 0;
        this.sprinting = false;
        this.comboCount = 0;
        this.shield = 0;
        this.poison = 0;
        this.armor = 0;
        this.weapon = null;
        this.gold = 0;
        this.daysSurvived = 0;
        this.temperature = 36.6;
        this.wetness = 0;
        this.fatigue = 0;
        this.speedBonus = 0;
        this.capacityBonus = 0;
        this.attackBonus = 0;
        this.hungerRate = 1;
        this.thirstRate = 1;
        this.comboMultiplier = 1;
        this.invincibleTimer = 0;
        this.xpMultiplier = 1;
        this.lootMultiplier = 1;
    }

    update(tick) {
        // Инвинсибилити
        if (this.invincibleTimer > 0) {
            this.invincibleTimer--;
        }

        // Регенерация
        if (tick % 25 === 0 && this.health < this.maxHealth && this.hunger > 15 && this.thirst > 15 && this.fatigue < 50) {
            this.health = Math.min(this.maxHealth, this.health + 1.5);
        }
        if (tick % 15 === 0 && this.stamina < 100) {
            this.stamina = Math.min(100, this.stamina + 1);
        }

        // Голод/жажда
        if (tick % 90 === 0) {
            this.hunger = Math.max(0, this.hunger - 1.5 * this.hungerRate);
            this.thirst = Math.max(0, this.thirst - 2 * this.thirstRate);
            if (this.hunger === 0 || this.thirst === 0) {
                this.health = Math.max(0, this.health - 3);
            }
        }

        // Усталость
        if (this.sprinting && tick % 10 === 0) {
            this.fatigue = Math.min(100, this.fatigue + 2);
        } else if (tick % 30 === 0) {
            this.fatigue = Math.max(0, this.fatigue - 1);
        }

        // Температура
        const weather = window.weatherSystem;
        if (weather) {
            const weatherData = weather.getWeather();
            const targetTemp = 36.6 + (weatherData.temperature - 20) * 0.1;
            this.temperature += (targetTemp - this.temperature) * 0.01;
            
            if (this.temperature < 35 || this.temperature > 38) {
                this.health = Math.max(0, this.health - 0.5);
            }
        }

        // Мокрота
        if (this.wetness > 0) {
            this.wetness *= 0.99;
            if (tick % 30 === 0) {
                this.temperature -= 0.1;
            }
        }

        // Кулдаун атаки
        if (this.attackCooldown > 0) this.attackCooldown--;
        
        // Щит
        if (this.shieldTimer > 0) {
            this.shieldTimer--;
            if (this.shieldTimer === 0) this.shield = 0;
        }
        
        // Яд
        if (this.poisonTimer > 0) {
            this.poisonTimer--;
            if (tick % 20 === 0) {
                this.health = Math.max(0, this.health - this.poison);
            }
            if (this.poisonTimer === 0) this.poison = 0;
        }
        
        // Дни
        if (tick % 2400 === 0) {
            this.daysSurvived++;
            if (window.toastManager) {
                window.toastManager.show(`📅 День ${this.daysSurvived} выживания!`, 'special', 2000);
            }
        }
        
        // Комбо мультипликатор
        if (this.comboCount > 0 && tick % 100 === 0) {
            this.comboCount = Math.max(0, this.comboCount - 1);
        }
    }

    move(dx, dy, world) {
        const len = Math.hypot(dx, dy);
        if (len < 0.1) return false;

        const normX = dx / len;
        const normY = dy / len;
        
        let speed = this.speed + (this.speedBonus || 0);
        if (this.sprinting && this.stamina > 5 && this.fatigue < 80) {
            speed *= 1.6;
            this.stamina = Math.max(0, this.stamina - 0.8);
        } else if (this.sprinting && (this.stamina <= 5 || this.fatigue >= 80)) {
            this.sprinting = false;
            if (window.toastManager) {
                window.toastManager.show('😰 Вы слишком устали для спринта', 'warning', 1000);
            }
        }

        this.x += normX * speed;
        this.y += normY * speed;
        this.direction = Math.atan2(dy, dx);

        this.x = Math.max(20, Math.min(6000 - 20, this.x));
        this.y = Math.max(20, Math.min(6000 - 20, this.y));

        this.inBush = world.isInBush(this.x, this.y);
        return true;
    }

    attack() {
        if (this.attackCooldown > 0) return false;
        this.attackCooldown = 18;
        
        const now = Date.now();
        if (now - this.lastAttackTime < 500) {
            this.comboCount = Math.min(5, this.comboCount + 1);
            this.comboMultiplier = 1 + this.comboCount * 0.2;
        } else {
            this.comboCount = 0;
            this.comboMultiplier = 1;
        }
        this.lastAttackTime = now;
        return true;
    }

    getAttackDamage() {
        let damage = 20 + Math.floor(Math.random() * 15) + (this.level * 2) + (this.comboCount * 3);
        damage *= this.comboMultiplier;
        damage += this.attackBonus || 0;
        if (this.weapon) {
            damage += this.weapon.damage || 0;
        }
        return Math.floor(damage);
    }

    takeDamage(damage) {
        if (this.invincibleTimer > 0) return false;
        
        // Щит
        if (this.shield > 0) {
            const absorbed = Math.min(this.shield, damage);
            this.shield -= absorbed;
            damage -= absorbed;
        }
        
        // Броня
        if (this.armor > 0) {
            damage = Math.max(1, damage - this.armor * 0.5);
        }
        
        this.health = Math.max(0, this.health - damage);
        this.lastDamageTime = Date.now();
        this.invincibleTimer = 20;
        
        if (this.health <= 0) {
            return true;
        }
        return false;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    addExperience(amount) {
        const xp = Math.floor(amount * (this.xpMultiplier || 1));
        this.experience += xp;
        const needed = this.level * 25;
        if (this.experience >= needed) {
            this.experience -= needed;
            this.level++;
            this.maxHealth += 5;
            this.health = Math.min(this.health + 20, this.maxHealth);
            if (window.toastManager) {
                window.toastManager.show(`🎉 Уровень ${this.level}!`, 'special', 2000);
            }
            if (window.soundManager) {
                window.soundManager.play('levelup');
            }
            return true;
        }
        return false;
    }

    addShield(amount, duration) {
        this.shield += amount;
        this.shieldTimer = duration || 300;
    }

    addPoison(amount, duration) {
        this.poison += amount;
        this.poisonTimer = duration || 200;
        if (window.toastManager) {
            window.toastManager.show(`☠️ Вы отравлены!`, 'error', 1500);
        }
    }

    getStats() {
        return {
            health: this.health,
            maxHealth: this.maxHealth,
            hunger: this.hunger,
            thirst: this.thirst,
            stamina: this.stamina,
            fatigue: this.fatigue,
            temperature: this.temperature,
            wetness: this.wetness,
            shield: this.shield,
            armor: this.armor,
            poison: this.poison,
            speedBonus: this.speedBonus,
            attackBonus: this.attackBonus,
            comboCount: this.comboCount,
            comboMultiplier: this.comboMultiplier
        };
    }
}
