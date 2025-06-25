import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, Clock, Check, X } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface ReminderSettings {
  enabled: boolean;
  dailyReminder: boolean;
  weeklyReminder: boolean;
  reminderTime: string;
}

export const NotificationManager: React.FC = () => {
  const { 
    isSupported, 
    permission, 
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    showLocalNotification,
    scheduleReminder
  } = usePushNotifications();

  const [settings, setSettings] = useLocalStorage<ReminderSettings>('notification-settings', {
    enabled: false,
    dailyReminder: false,
    weeklyReminder: false,
    reminderTime: '09:00',
  });

  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Провери и закажи подсетнике
  useEffect(() => {
    if (settings.enabled && permission === 'granted') {
      scheduleReminders();
    }
  }, [settings, permission]);

  const scheduleReminders = () => {
    const now = new Date();
    const [hours, minutes] = settings.reminderTime.split(':').map(Number);

    if (settings.dailyReminder) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(hours, minutes, 0, 0);
      
      const delay = tomorrow.getTime() - now.getTime();
      scheduleReminder(
        'Дневни подсетник - Линк-Дрво',
        'Време је да проверите и организујете своје линкове!',
        delay
      );
    }

    if (settings.weeklyReminder) {
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(hours, minutes, 0, 0);
      
      const delay = nextWeek.getTime() - now.getTime();
      scheduleReminder(
        'Недељни подсетник - Линк-Дрво',
        'Време је за недељну организацију ваших линкова и група!',
        delay
      );
    }
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    
    try {
      const granted = await requestPermission();
      if (granted) {
        await subscribe();
        setSettings(prev => ({ ...prev, enabled: true }));
        
        showLocalNotification('Нотификације укључене!', {
          body: 'Сада ћете добијати подсетнике за организовање линкова.',
          tag: 'notification-enabled'
        });
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);
    
    try {
      await unsubscribe();
      setSettings(prev => ({ ...prev, enabled: false }));
    } catch (error) {
      console.error('Error disabling notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = () => {
    showLocalNotification('Тест нотификација', {
      body: 'Ово је тест нотификација из Линк-Дрво апликације!',
      tag: 'test-notification',
      requireInteraction: true,
    });
  };

  if (!isSupported) return null;

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className={`p-3 rounded-full transition-all ${
          settings.enabled 
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
        title="Подешавања нотификација"
      >
        {settings.enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-xl z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Нотификације
            </h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Enable/Disable Notifications */}
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">Укључи нотификације</span>
              <button
                onClick={settings.enabled ? handleDisableNotifications : handleEnableNotifications}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  settings.enabled
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`}
              >
                {isLoading ? '...' : settings.enabled ? 'Искључи' : 'Укључи'}
              </button>
            </div>

            {/* Permission Status */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-blue-200">Статус:</span>
              <span className={`font-medium ${
                permission === 'granted' ? 'text-green-400' : 
                permission === 'denied' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {permission === 'granted' ? 'Дозвољено' : 
                 permission === 'denied' ? 'Одбијено' : 'Чека одобрење'}
              </span>
            </div>

            {settings.enabled && permission === 'granted' && (
              <>
                {/* Daily Reminder */}
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Дневни подсетник</span>
                  <button
                    onClick={() => setSettings(prev => ({ 
                      ...prev, 
                      dailyReminder: !prev.dailyReminder 
                    }))}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      settings.dailyReminder ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.dailyReminder ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Weekly Reminder */}
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Недељни подсетник</span>
                  <button
                    onClick={() => setSettings(prev => ({ 
                      ...prev, 
                      weeklyReminder: !prev.weeklyReminder 
                    }))}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      settings.weeklyReminder ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.weeklyReminder ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Reminder Time */}
                {(settings.dailyReminder || settings.weeklyReminder) && (
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Време подсетника
                    </span>
                    <input
                      type="time"
                      value={settings.reminderTime}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        reminderTime: e.target.value 
                      }))}
                      className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                    />
                  </div>
                )}

                {/* Test Notification */}
                <button
                  onClick={testNotification}
                  className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Тестирај нотификацију
                </button>
              </>
            )}

            {/* Subscription Status */}
            {subscription && (
              <div className="text-xs text-green-400 bg-green-500/10 p-2 rounded">
                <Check className="w-3 h-3 inline mr-1" />
                Претплаћени на push нотификације
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};