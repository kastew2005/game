export class ToastManager {
    constructor(container) {
        this.container = container;
        this.toasts = [];
        this.maxToasts = 3;
        this.createContainer();
    }

    createContainer() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'toast-container';
        this.container.appendChild(this.toastContainer);
    }

    show(message, type = 'info', duration = 2500) {
        // Удаляем старые тосты если превышен лимит
        while (this.toasts.length >= this.maxToasts) {
            const old = this.toasts.shift();
            if (old && old.element) {
                old.element.remove();
            }
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        this.toastContainer.appendChild(toast);
        
        const toastObj = {
            element: toast,
            timer: null
        };
        
        this.toasts.push(toastObj);
        
        // Анимация появления
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // Авто-скрытие
        toastObj.timer = setTimeout(() => {
            this.hideToast(toastObj);
        }, duration);
        
        return toastObj;
    }

    hideToast(toastObj) {
        if (!toastObj || !toastObj.element) return;
        toastObj.element.classList.remove('show');
        setTimeout(() => {
            if (toastObj.element) {
                toastObj.element.remove();
                const index = this.toasts.indexOf(toastObj);
                if (index !== -1) this.toasts.splice(index, 1);
            }
        }, 400);
    }

    clear() {
        for (let toast of this.toasts) {
            if (toast && toast.timer) clearTimeout(toast.timer);
            if (toast && toast.element) {
                toast.element.remove();
            }
        }
        this.toasts = [];
    }
}
