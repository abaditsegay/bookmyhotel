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
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    const installedState = isStandalone || isInWebAppiOS;
    setIsInstalled(installedState);

    // Don't show prompts if already installed
    if (installedState) {
      return;
    }

    // Listen for the beforeinstallprompt event (Android Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('Before install prompt event triggered');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
      
      // For Android, show our custom prompt
      const isAndroid = /Android/i.test(navigator.userAgent);
      if (isAndroid && !sessionStorage.getItem('pwa-prompt-dismissed')) {
        setTimeout(() => {
          setShowAndroidPrompt(true);
        }, 3000); // Show after 3 seconds
      }
    };

    // Listen for successful app installation
    const handleAppInstalled = () => {
      console.log('App installed successfully');
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      setShowAndroidPrompt(false);
      setShowIOSPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check for iOS and show custom prompt after delay
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (isIOS && !sessionStorage.getItem('pwa-prompt-dismissed')) {
      const timer = setTimeout(() => {
        setShowIOSPrompt(true);
      }, 5000); // Show after 5 seconds

      return () => clearTimeout(timer);
    } else if (isAndroid && !sessionStorage.getItem('pwa-prompt-dismissed')) {
      // For Android devices, if no beforeinstallprompt is triggered, show manual prompt
      const timer = setTimeout(() => {
        if (!canInstall) {
          console.log('No beforeinstallprompt detected, showing manual Android prompt');
          setShowAndroidPrompt(true);
        }
      }, 8000); // Show after 8 seconds if no native prompt

      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled, canInstall]);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.log('No deferred prompt available');
      return false;
    }

    try {
      console.log('Triggering install prompt');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('User choice:', outcome);
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setCanInstall(false);
        setShowAndroidPrompt(false);
      }

      return outcome === 'accepted';
    } catch (error) {
      console.error('Error during app installation:', error);
      return false;
    }
  };

  const dismissIOSPrompt = () => {
    setShowIOSPrompt(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const dismissAndroidPrompt = () => {
    setShowAndroidPrompt(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
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
