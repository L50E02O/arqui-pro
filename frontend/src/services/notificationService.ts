/**
 * Servicio de notificaciones para el navegador
 */

class NotificationService {
  private permissionGranted = false;

  constructor() {
    this.requestPermission();
  }

  /**
   * Solicitar permiso para mostrar notificaciones
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    }

    return false;
  }

  /**
   * Mostrar notificación de nuevo mensaje
   */
  async notifyNewMessage(senderName: string, message: string, conversacionId: string) {
    // Verificar si la página está en segundo plano
    if (document.hidden) {
      await this.showNotification(
        `Nuevo mensaje de ${senderName}`,
        message,
        conversacionId
      );
    }
    
    // Reproducir sonido
    this.playNotificationSound();
  }

  /**
   * Mostrar notificación del navegador
   */
  private async showNotification(title: string, body: string, conversacionId: string) {
    if (!this.permissionGranted) {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    const notification = new Notification(title, {
      body,
      icon: '/logo.png', // Puedes cambiar esto por tu logo
      badge: '/logo.png',
      tag: conversacionId, // Agrupa notificaciones de la misma conversación
      requireInteraction: false,
      silent: false
    });

    // Hacer clic en la notificación enfoca la ventana
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  /**
   * Reproducir sonido de notificación
   */
  private playNotificationSound() {
    try {
      // Crear un sonido simple usando Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Frecuencia del sonido
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('No se pudo reproducir el sonido de notificación:', error);
    }
  }

  /**
   * Mostrar notificación visual en la página (toast)
   */
  showToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    // Crear elemento de toast
    const toast = document.createElement('div');
    toast.className = `notification-toast notification-${type}`;
    toast.textContent = message;
    
    // Estilos inline (puedes moverlos a un CSS)
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '16px 24px',
      background: type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#007bff',
      color: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: '10000',
      fontSize: '14px',
      fontWeight: '500',
      maxWidth: '300px',
      animation: 'slideInRight 0.3s ease-out'
    });

    document.body.appendChild(toast);

    // Auto-remover después de 3 segundos
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}

// Exportar instancia única
export const notificationService = new NotificationService();
