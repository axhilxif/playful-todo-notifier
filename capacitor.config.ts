import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.6f84554299c3464b862382e273d23ca7',
  appName: 'playful-todo-notifier',
  webDir: 'dist',
  server: {
    url: 'https://6f845542-99c3-464b-8623-82e273d23ca7.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;