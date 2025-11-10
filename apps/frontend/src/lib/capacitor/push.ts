import {
  PushNotifications,
  PushNotificationSchema,
  ActionPerformed,
  Token,
} from '@capacitor/push-notifications';

export interface PushNotificationConfig {
  onRegistration?: (token: string) => void;
  onRegistrationError?: (error: any) => void;
  onNotificationReceived?: (notification: PushNotificationSchema) => void;
  onNotificationActionPerformed?: (action: ActionPerformed) => void;
}

/**
 * Inicializar push notifications
 */
export async function initializePushNotifications(config: PushNotificationConfig): Promise<void> {
  try {
    // Pedir permissões
    const permission = await PushNotifications.requestPermissions();

    if (permission.receive === 'granted') {
      // Registar para receber push notifications
      await PushNotifications.register();

      // Listener: Token registado com sucesso
      await PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push registration success, token:', token.value);
        if (config.onRegistration) {
          config.onRegistration(token.value);
        }
      });

      // Listener: Erro no registo
      await PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on push registration:', error);
        if (config.onRegistrationError) {
          config.onRegistrationError(error);
        }
      });

      // Listener: Notificação recebida
      await PushNotifications.addListener(
        'pushNotificationReceived',
        (notification: PushNotificationSchema) => {
          console.log('Push notification received:', notification);
          if (config.onNotificationReceived) {
            config.onNotificationReceived(notification);
          }
        }
      );

      // Listener: Ação na notificação (tap)
      await PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (action: ActionPerformed) => {
          console.log('Push notification action performed:', action);
          if (config.onNotificationActionPerformed) {
            config.onNotificationActionPerformed(action);
          }
        }
      );
    } else {
      console.warn('Push notification permission not granted');
    }
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    throw error;
  }
}

/**
 * Verificar permissões de push notifications
 */
export async function checkPushPermissions(): Promise<boolean> {
  try {
    const permission = await PushNotifications.checkPermissions();
    return permission.receive === 'granted';
  } catch (error) {
    console.error('Error checking push permissions:', error);
    return false;
  }
}

/**
 * Pedir permissões de push notifications
 */
export async function requestPushPermissions(): Promise<boolean> {
  try {
    const permission = await PushNotifications.requestPermissions();
    return permission.receive === 'granted';
  } catch (error) {
    console.error('Error requesting push permissions:', error);
    return false;
  }
}

/**
 * Obter notificações entregues (iOS)
 */
export async function getDeliveredNotifications(): Promise<PushNotificationSchema[]> {
  try {
    const result = await PushNotifications.getDeliveredNotifications();
    return result.notifications;
  } catch (error) {
    console.error('Error getting delivered notifications:', error);
    return [];
  }
}

/**
 * Remover todas as notificações entregues
 */
export async function removeAllDeliveredNotifications(): Promise<void> {
  try {
    await PushNotifications.removeAllDeliveredNotifications();
  } catch (error) {
    console.error('Error removing delivered notifications:', error);
    throw error;
  }
}

/**
 * Remover listeners (cleanup)
 */
export async function removePushListeners(): Promise<void> {
  try {
    await PushNotifications.removeAllListeners();
  } catch (error) {
    console.error('Error removing push listeners:', error);
  }
}
