export class WeatherSystem {
    constructor() {
        this.weathers = ['clear', 'cloudy', 'rainy', 'stormy', 'foggy', 'windy', 'sunny'];
        this.currentWeather = 'clear';
        this.nextWeather = 'clear';
        this.weatherTimer = 0;
        this.weatherDuration = 600 + Math.random() * 600;
        this.transition = 0;
        this.rainParticles = [];
        this.windParticles = [];
        this.temperature = 20;
        this.humidity = 50;
        this.weatherEffects = {
            clear: { temp: 22, humidity: 45, wind: 1 },
            cloudy: { temp: 18, humidity: 60, wind: 2 },
            rainy: { temp: 15, humidity: 85, wind: 3 },
            stormy: { temp: 12, humidity: 90, wind: 6 },
            foggy: { temp: 16, humidity: 80, wind: 1 },
            windy: { temp: 20, humidity: 50, wind: 8 },
            sunny: { temp: 28, humidity: 40, wind: 0.5 }
        };
        this.rainIntensity = 0;
        this.fogLevel = 0;
        this.windLevel = 0;
    }

    update(tick) {
        this.weatherTimer++;
        
        if (this.weatherTimer > this.weatherDuration) {
            this.changeWeather();
        }
        
        this.transition = Math.min(1, this.transition + 0.01);
        
        // Обновление погодных эффектов
        const effect = this.weatherEffects[this.currentWeather];
        this.temperature = effect.temp + (Math.random() - 0.5) * 2;
        this.humidity = effect.humidity + (Math.random() - 0.5) * 5;
        this.windLevel = effect.wind + (Math.random() - 0.5) * 0.5;
        
        // Дождь
        if (this.currentWeather === 'rainy' || this.currentWeather === 'stormy') {
            this.rainIntensity = this.currentWeather === 'stormy' ? 1 : 0.6;
            this.updateRain();
        } else {
            this.rainIntensity *= 0.95;
        }
        
        // Туман
        if (this.currentWeather === 'foggy') {
            this.fogLevel = Math.min(1, this.fogLevel + 0.01);
        } else {
            this.fogLevel = Math.max(0, this.fogLevel - 0.01);
        }
        
        // Ветер
        if (this.currentWeather === 'windy' || this.currentWeather === 'stormy') {
            this.updateWind();
        }
    }

    changeWeather() {
        const available = this.weathers.filter(w => w !== this.currentWeather);
        this.nextWeather = available[Math.floor(Math.random() * available.length)];
        this.currentWeather = this.nextWeather;
        this.weatherTimer = 0;
        this.weatherDuration = 400 + Math.random() * 800;
        this.transition = 0;
        
        if (window.toastManager) {
            const names = {
                clear: '☀️ Ясно',
                cloudy: '☁️ Облачно',
                rainy: '🌧️ Дождь',
                stormy: '⛈️ Шторм',
                foggy: '🌫️ Туман',
                windy: '💨 Ветрено',
                sunny: '☀️ Солнечно'
            };
            window.toastManager.show(`Погода: ${names[this.currentWeather]}`, 'info', 1500);
        }
    }

    updateRain() {
        const count = Math.floor(50 * this.rainIntensity);
        for (let i = 0; i < count; i++) {
            this.rainParticles.push({
                x: Math.random() * 6000,
                y: Math.random() * 6000,
                speed: 5 + Math.random() * 15,
                length: 10 + Math.random() * 30,
                opacity: 0.2 + Math.random() * 0.4
            });
        }
        
        for (let p of this.rainParticles) {
            p.x -= this.windLevel * 0.5;
            p.y += p.speed;
            if (p.y > 6000) {
                p.y = -20;
                p.x = Math.random() * 6000;
            }
        }
        
        if (this.rainParticles.length > 300) {
            this.rainParticles.splice(0, 20);
        }
    }

    updateWind() {
        for (let i = 0; i < 5; i++) {
            this.windParticles.push({
                x: Math.random() * 6000,
                y: Math.random() * 6000,
                speed: 2 + Math.random() * 5,
                size: 2 + Math.random() * 4,
                opacity: 0.1 + Math.random() * 0.2
            });
        }
        
        for (let p of this.windParticles) {
            p.x += p.speed * this.windLevel * 0.1;
            p.y += (Math.random() - 0.5) * 0.5;
            if (p.x > 6000) {
                p.x = -20;
                p.y = Math.random() * 6000;
            }
        }
        
        if (this.windParticles.length > 100) {
            this.windParticles.splice(0, 10);
        }
    }

    getWeather() {
        return {
            type: this.currentWeather,
            temperature: this.temperature,
            humidity: this.humidity,
            windLevel: this.windLevel,
            rainIntensity: this.rainIntensity,
            fogLevel: this.fogLevel,
            isRaining: this.currentWeather === 'rainy' || this.currentWeather === 'stormy',
            isStorm: this.currentWeather === 'stormy',
            isFoggy: this.currentWeather === 'foggy',
            isWindy: this.currentWeather === 'windy' || this.currentWeather === 'stormy',
            rainParticles: this.rainParticles,
            windParticles: this.windParticles
        };
    }
}
