import { useContext } from 'react';
import { AddressContext, AddressContextType } from '@/contexts/AddressContext';

export const useAddress = (): AddressContextType => {
  const context = useContext(AddressContext);
  
  if (context === undefined) {
    throw new Error('useAddress must be used within AddressProvider');
  }
  
  return context;
};
