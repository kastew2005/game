// Добавьте в конструктор UIManager новые кнопки
this.buttons = {
    // ... существующие кнопки
    companions: { x: 780, y: 80, radius: 38, label: '🤝', color: '#44aa88', activeColor: '#66ccaa' },
    base: { x: 880, y: 80, radius: 38, label: '🏰', color: '#aa8844', activeColor: '#ccaa66' },
    weather: { x: 980, y: 80, radius: 38, label: '🌤️', color: '#44aacc', activeColor: '#66ccdd' }
};

this.tabs = ['inventory', 'craft', 'quests', 'pets', 'buildings', 'stats', 'minigames', 'reputation', 'companions', 'base', 'weather'];
this.tabNames = {
    inventory: '📦 Инвентарь',
    craft: '🔧 Крафт',
    quests: '📋 Квесты',
    pets: '🐾 Питомцы',
    buildings: '🏗️ Строительство',
    stats: '📊 Статистика',
    minigames: '🎮 Мини-игры',
    reputation: '⭐ Репутация',
    companions: '🤝 Компаньоны',
    base: '🏰 База',
    weather: '🌤️ Погода'
};

// Добавьте новые методы отрисовки
drawCompanionsContent(ctx, y) {
    const companionSystem = window.companionSystem;
    if (!companionSystem) return;

    const companions = companionSystem.getCompanions();
    const companionTypes = companionSystem.getCompanionTypes();
    const active = companionSystem.getActiveCompanion();
    const startX = (this.W - 900) / 2;
    let currentY = y;

    // Активные компаньоны
    for (let i = 0; i < companions.length; i++) {
        const comp = companions[i];
        const isActive = comp === active;
        const type = companionTypes[comp.type];
        
        ctx.fillStyle = isActive ? 'rgba(50,100,50,0.5)' : 'rgba(30,40,30,0.3)';
        ctx.beginPath();
        ctx.roundRect(startX, currentY, 900, 60, 10);
        ctx.fill();
        
        ctx.fillStyle = isActive ? '#ffdd44' : '#e0e8d0';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(comp.name, startX + 20, currentY + 20);
        
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#b0c8a0';
        ctx.fillText(`Здоровье: ${Math.floor(comp.health)}/${comp.maxHealth}`, startX + 200, currentY + 20);
        ctx.fillText(`Уровень: ${comp.level}`, startX + 350, currentY + 20);
        
        if (isActive) {
            ctx.fillStyle = '#44dd44';
            ctx.textAlign = 'right';
            ctx.fillText('✅ Активен', startX + 880, currentY + 20);
        } else {
            ctx.fillStyle = '#8aaa7a';
            ctx.textAlign = 'right';
            ctx.fillText('▶ Активировать', startX + 880, currentY + 20);
        }
        currentY += 80;
    }

    // Доступные компаньоны
    ctx.fillStyle = '#8a9a7a';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🤝 Доступные компаньоны:', this.W/2, currentY + 10);
    currentY += 50;

    for (let [type, data] of Object.entries(companionTypes)) {
        ctx.fillStyle = 'rgba(40,70,40,0.3)';
        ctx.beginPath();
        ctx.roundRect(startX, currentY, 900, 50, 10);
        ctx.fill();
        ctx.fillStyle = '#b0c8a0';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${data.name} - ${data.description}`, startX + 20, currentY + 25);
        
        let costStr = '';
        for (let [resource, count] of Object.entries(data.cost)) {
            const emojis = { wood: '🪵', stone: '🪨', scrap: '🔩', food: '🍖', water: '💧', gold: '🪙', herbs: '🌿' };
            costStr += `${emojis[resource] || ''}${count} `;
        }
        ctx.fillStyle = '#8a9a7a';
        ctx.font = '14px sans-serif';
        ctx.fillText(`Стоимость: ${costStr}`, startX + 450, currentY + 25);
        
        ctx.fillStyle = '#8aaa7a';
        ctx.textAlign = 'right';
        ctx.fillText('▶ Нанять', startX + 880, currentY + 25);
        currentY += 60;
    }
}

drawBaseContent(ctx, y) {
    const baseSystem = window.baseSystem;
    if (!baseSystem) return;

    const info = baseSystem.getBaseInfo();
    const nextCost = baseSystem.getNextLevelCost();
    const startX = (this.W - 800) / 2;
    let currentY = y;

    // Информация о базе
    ctx.fillStyle = 'rgba(50,80,50,0.4)';
    ctx.beginPath();
    ctx.roundRect(startX, currentY, 800, 120, 10);
    ctx.fill();
    
    ctx.fillStyle = '#e0e8d0';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`🏰 База ${info.level} уровня`, this.W/2, currentY + 10);
    
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#b0c8a0';
    ctx.textAlign = 'left';
    ctx.fillText(`Здоровье: ${Math.floor(info.health)}/${info.maxHealth}`, startX + 30, currentY + 55);
    ctx.fillText(`Защита: ${info.defense}`, startX + 300, currentY + 55);
    ctx.fillText(`Рабочие: ${info.workers}`, startX + 550, currentY + 55);
    ctx.fillText(`Производство: 🪵${Math.floor(info.production?.wood || 0)}/ч`, startX + 30, currentY + 85);
    ctx.fillText(`🪨${Math.floor(info.production?.stone || 0)}/ч`, startX + 300, currentY + 85);
    ctx.fillText(`🍖${Math.floor(info.production?.food || 0)}/ч`, startX + 550, currentY + 85);
    
    currentY += 140;

    // Улучшение
    if (nextCost) {
        ctx.fillStyle = 'rgba(40,60,40,0.4)';
        ctx.beginPath();
        ctx.roundRect(startX, currentY, 800, 60, 10);
        ctx.fill();
        
        ctx.fillStyle = '#e0e8d0';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Следующий уровень: ${info.level + 1}`, startX + 30, currentY + 30);
        
        let costStr = '';
        for (let [resource, count] of Object.entries(nextCost)) {
            const emojis = { wood: '🪵', stone: '🪨', scrap: '🔩', gold: '🪙' };
            costStr += `${emojis[resource] || ''}${count} `;
        }
        ctx.fillStyle = '#b0c8a0';
        ctx.fillText(`Стоимость: ${costStr}`, startX + 300, currentY + 30);
        
        ctx.fillStyle = '#8aaa7a';
        ctx.textAlign = 'right';
        ctx.fillText('▶ Улучшить', startX + 770, currentY + 30);
    } else {
        ctx.fillStyle = '#8a9a7a';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 Максимальный уровень достигнут!', this.W/2, currentY + 30);
    }
}

drawWeatherContent(ctx, y) {
    const weatherSystem = window.weatherSystem;
    if (!weatherSystem) return;

    const weather = weatherSystem.getWeather();
    const startX = (this.W - 600) / 2;
    let currentY = y;

    const weatherData = [
        { label: '🌤️ Погода', value: weather.type },
        { label: '🌡️ Температура', value: `${Math.round(weather.temperature)}°C` },
        { label: '💧 Влажность', value: `${Math.round(weather.humidity)}%` },
        { label: '💨 Ветер', value: `${Math.round(weather.windLevel * 5)} км/ч` },
        { label: '🌧️ Дождь', value: weather.isRaining ? 'Да' : 'Нет' },
        { label: '🌫️ Туман', value: weather.isFoggy ? 'Да' : 'Нет' }
    ];

    for (let i = 0; i < weatherData.length; i++) {
        const data = weatherData[i];
        const yPos = currentY + i * 60;
        
        ctx.fillStyle = 'rgba(40,60,40,0.4)';
        ctx.beginPath();
        ctx.roundRect(startX, yPos, 600, 50, 10);
        ctx.fill();
        
        ctx.fillStyle = '#e0e8d0';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(data.label, startX + 20, yPos + 25);
        ctx.fillStyle = '#ffdd44';
        ctx.textAlign = 'right';
        ctx.fillText(data.value, startX + 580, yPos + 25);
    }

    // Эффекты погоды
    currentY += weatherData.length * 60 + 20;
    ctx.fillStyle = '#8a9a7a';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    
    let effects = [];
    if (weather.isRaining) effects.push('🌧️ Скорость передвижения снижена');
    if (weather.isStorm) effects.push('⛈️ Шторм! Опасно находиться на открытой местности');
    if (weather.isFoggy) effects.push('🌫️ Видимость снижена');
    if (weather.isWindy) effects.push('💨 Ветер замедляет движение');
    if (weather.temperature > 25) effects.push('☀️ Жарко! Быстрее расходуется вода');
    if (weather.temperature < 10) effects.push('❄️ Холодно! Быстрее расходуется еда');
    
    for (let effect of effects) {
        ctx.fillStyle = '#b0c8a0';
        ctx.fillText(effect, this.W/2, currentY);
        currentY += 30;
    }
}
