import { useState, useEffect } from 'react';
import { createActor } from '@/services/backend';
import type { _SERVICE } from '@/declarations/Backend/Backend.did';
import { useUserStore } from '@/stores/useUserStore';
import { useGroupsStore } from '@/stores/useGroupsStore';

export const useBackend = () => {
  const [actor, setActor] = useState<_SERVICE | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Get store actions
  const { setActor: setUserActor, initializeActor: initUserActor } = useUserStore();
  const { setActor: setGroupsActor, initializeActor: initGroupsActor } = useGroupsStore();

  const initializeBackend = async () => {
    try {
      setConnecting(true);
      setConnectionError(null);
      
      console.log('🚀 Initializing ICP Backend connection...');
      const icpActor = await createActor();
      
      // Set actor in all stores
      setActor(icpActor);
      setUserActor(icpActor);
      setGroupsActor(icpActor);
      
      console.log('✅ Backend connection successful - actor distributed to stores!');
      
    } catch (error) {
      console.error('❌ Failed to initialize backend:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setConnectionError(errorMessage);
      
      // Log more details for debugging
      console.error('🔍 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    initializeBackend();
  }, []);

  return {
    actor,
    connecting,
    connectionError,
    reconnect: initializeBackend,
    isConnected: actor !== null,
  };
};
