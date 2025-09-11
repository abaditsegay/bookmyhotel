import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWAInstall = () => {
  // PWA install functionality completely disabled
  const [deferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall] = useState(false);
  const [isInstalled] = useState(false);
  const [showIOSPrompt] = useState(false);
  const [showAndroidPrompt] = useState(false);

  // No event listeners or background functionality
  useEffect(() => {
    console.log('PWA Install: Functionality disabled');
  }, []);

  const installApp = async () => {
    console.log('PWA Install: Installation disabled');
    return false;
  };

  const dismissIOSPrompt = (permanently = false) => {
    console.log('PWA Install: iOS prompt dismissal disabled');
  };

  const dismissAndroidPrompt = (permanently = false) => {
    console.log('PWA Install: Android prompt dismissal disabled');
  };

  return {
    canInstall,
    isInstalled,
    installApp,
    showIOSPrompt,
    showAndroidPrompt,
    dismissIOSPrompt,
    dismissAndroidPrompt,
    deferredPrompt,
  };
};
