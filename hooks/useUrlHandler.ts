/**
 * URL Handler Hook
 * Handles deep linking and URL parameters for chat navigation
 */

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { userService, messagingService } from '@/lib/appwrite/services';
import { toast } from 'sonner';

interface UseUrlHandlerOptions {
  currentUserId?: string;
  onChatCreated?: (conversationId: string) => void;
  onPaymentRequest?: (data: any) => void;
}

export function useUrlHandler({
  currentUserId,
  onChatCreated,
  onPaymentRequest,
}: UseUrlHandlerOptions) {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!currentUserId) return;

    const handleUrlParams = async () => {
      // Handle username parameter
      const username = searchParams.get('username');
      if (username) {
        try {
          toast.loading('Finding user...');
          const user = await userService.getUserByUsername(username);
          
          if (user) {
            const conversation = await messagingService.getOrCreateDirectConversation(
              currentUserId,
              user.id
            );
            onChatCreated?.(conversation.$id);
            toast.success(`Started chat with @${username}`);
          } else {
            toast.error(`User @${username} not found`);
          }
        } catch (error) {
          console.error('Error handling username param:', error);
          toast.error('Failed to start chat');
        } finally {
          // Clean up URL param
          searchParams.delete('username');
          setSearchParams(searchParams);
        }
      }

      // Handle wallet parameter
      const wallet = searchParams.get('wallet');
      if (wallet) {
        try {
          toast.loading('Finding user...');
          const user = await userService.getUserByWallet(wallet);
          
          if (user) {
            const conversation = await messagingService.getOrCreateDirectConversation(
              currentUserId,
              user.id
            );
            onChatCreated?.(conversation.$id);
            toast.success(`Started chat with wallet user`);
          } else {
            toast.error('User not found');
          }
        } catch (error) {
          console.error('Error handling wallet param:', error);
          toast.error('Failed to start chat');
        } finally {
          searchParams.delete('wallet');
          setSearchParams(searchParams);
        }
      }

      // Handle payment request parameters
      const paymentTo = searchParams.get('to');
      if (paymentTo) {
        const paymentData = {
          recipientAddress: paymentTo,
          amount: searchParams.get('amount'),
          token: searchParams.get('token') || 'ETH',
          chain: searchParams.get('chain') || 'ethereum',
          message: searchParams.get('message'),
          recipientUsername: searchParams.get('username'),
        };

        onPaymentRequest?.(paymentData);

        // Clean up payment params
        ['to', 'amount', 'token', 'chain', 'message'].forEach(param => {
          searchParams.delete(param);
        });
        setSearchParams(searchParams);
      }

      // Handle QR code data parameter
      const qrData = searchParams.get('qr');
      if (qrData) {
        try {
          const parsed = userService.parseQRCodeData(qrData);
          
          if (parsed) {
            if (parsed.type === 'profile' && parsed.username) {
              // Redirect to chat with user
              searchParams.delete('qr');
              searchParams.set('username', parsed.username);
              setSearchParams(searchParams);
            } else if (parsed.type === 'payment') {
              // Handle payment request
              onPaymentRequest?.(parsed);
              searchParams.delete('qr');
              setSearchParams(searchParams);
            }
          }
        } catch (error) {
          console.error('Error parsing QR code:', error);
          searchParams.delete('qr');
          setSearchParams(searchParams);
        }
      }
    };

    handleUrlParams();
  }, [currentUserId, searchParams, setSearchParams, onChatCreated, onPaymentRequest]);

  return null;
}
