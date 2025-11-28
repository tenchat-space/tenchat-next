import { Box, Typography, Stack, Button, Card, CardContent, Chip } from "@mui/material";
import { AccountBalanceWalletOutlined } from "@mui/icons-material";
import { useWallets } from "@/hooks/useWeb3";
import { useAppwrite } from "@/contexts/AppwriteContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function WalletPanel() {
  const { currentAccount } = useAppwrite();
  const userId = currentAccount?.$id || "";
  const { primaryWallet, connectWallet } = useWallets(userId);
  const [_balance, _setBalance] = useState<{ eth: string, ten: string } | null>(null);

  const handleConnect = async () => {
    if (!userId) {
      toast.error("You must be logged in to connect a wallet");
      return;
    }
    try {
      await connectWallet("", "ten", "metamask"); // Address will be auto-filled
      toast.success("Wallet connected successfully");
    } catch (error) {
      console.error("Connection failed", error);
      toast.error("Failed to connect wallet");
    }
  };

  useEffect(() => {
    // Fetch real balances if connected
    const fetchBalances = async () => {
      if (primaryWallet?.address) {
         try {
           // This would ideally use tenchatContracts.contracts.token.read.balanceOf(...)
           // For now we'll just log or set a mock if contract read fails (safe integration)
           // const tenBalance = await tenchatContracts.contracts.token.read.balanceOf([primaryWallet.address as `0x${string}`]);
           // setBalance(...)
         } catch (e) {
           console.error("Failed to fetch contract balance", e);
         }
      }
    };
    fetchBalances();
  }, [primaryWallet]);

  return (
    <Box
      sx={{
        width: 280,
        bgcolor: "background.paper",
        borderLeft: 1,
        borderColor: "divider",
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        backgroundImage:
          "linear-gradient(120deg, rgba(250,204,21,0.1), rgba(124,58,237,0.05))",
        overflowY: "auto",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between">
        <Stack direction="row" spacing={1} alignItems="center">
           <AccountBalanceWalletOutlined color="secondary" />
           <Typography variant="h6" fontWeight={600}>
             Wallet
           </Typography>
        </Stack>
        {!primaryWallet && (
           <Button size="small" variant="outlined" onClick={handleConnect}>
             Connect
           </Button>
        )}
      </Stack>

      <Card variant="outlined" sx={{ bgcolor: "background.default", borderRadius: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {primaryWallet ? `Connected: ${primaryWallet.address.slice(0, 6)}...` : "Total Balance"}
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ my: 1 }}>
            {/* Placeholder until live price feed */}
            $1,240.50 
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip label="0.45 ETH" size="small" variant="outlined" />
            <Chip label="500 TEN" size="small" color="secondary" />
          </Stack>
        </CardContent>
      </Card>

      <Stack direction="row" spacing={1}>
        <Button sx={{ flex: 1 }} variant="contained" color="primary" startIcon={<Send />}>
          Send
        </Button>
        <Button sx={{ flex: 1 }} variant="outlined" color="secondary" startIcon={<CallReceived />}>
          Receive
        </Button>
      </Stack>
      <Button fullWidth variant="text" startIcon={<SwapHoriz />}>
        Swap Tokens
      </Button>

      <Divider />

      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Recent Transactions
        </Typography>
        <List dense>
          <ListItem disablePadding sx={{ py: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CallReceived fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText primary="Received 100 TEN" secondary="From Alice" />
            <Typography variant="caption" color="text.secondary">2h ago</Typography>
          </ListItem>
          <ListItem disablePadding sx={{ py: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Send fontSize="small" color="action" />
            </ListItemIcon>
            <ListItemText primary="Sent 0.1 ETH" secondary="To Bob" />
            <Typography variant="caption" color="text.secondary">1d ago</Typography>
          </ListItem>
        </List>
        <Button fullWidth size="small" startIcon={<History />} sx={{ mt: 1 }}>
          View All History
        </Button>
      </Box>
    </Box>
  );
}

