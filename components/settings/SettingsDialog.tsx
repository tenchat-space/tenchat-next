import React, { useState } from 'react';
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Stack,
  Avatar,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Paper,
  alpha,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  PersonOutline,
  Security,
  NotificationsNone,
  PaletteOutlined,
  Edit,
  AccountBalanceWallet,
  Extension,
  Lock,
  LockOpen,
  OpenInNew,
  CheckCircle
} from '@mui/icons-material';
import { useAppwrite } from '@/contexts/AppwriteContext';
import { useAnimationContext } from '@/contexts/AnimationContext';
import { AnimationLevel, AnimationStyle } from '@/types/animation';
import { useStyle } from '@/contexts/StyleContext';
import { BorderRadius, DepthLevel, BlurLevel } from '@/types/style';
import { usePerformance } from '@/contexts/PerformanceContext';
import { PerformanceMode } from '@/types/performance';
import { useWindow } from '@/contexts/WindowContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisualFeedback } from '@/hooks/useVisualFeedback';
import { useTheme } from '@mui/material/styles';
import { useWalletEncryption } from '@/contexts/WalletEncryptionContext';
import { EncryptionPromptDialog } from '@/components/auth/EncryptionPromptDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
      style={{ height: '100%', overflowY: 'auto', position: 'relative' }}
    >
      <AnimatePresence mode="wait">
        {value === index && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Box sx={{ p: 3 }}>
              {children}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MotionListItemProps {
  children?: React.ReactNode;
  button?: boolean;
  onClick?: () => void;
}

const MotionListItem = ({ children, button, onClick, ...props }: MotionListItemProps) => {
  const { whileHover, whileTap } = useVisualFeedback();
  const theme = useTheme();
  const paperBg = alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.25 : 0.75);

  return (
    <motion.div whileHover={whileHover} whileTap={whileTap}>
      <Paper elevation={0} sx={{ mb: 1, bgcolor: paperBg, borderRadius: 2, overflow: 'hidden' }}>
        <ListItem 
          component={button ? 'div' : undefined}
          onClick={onClick}
          sx={button ? { cursor: 'pointer' } : undefined}
          {...props}
        >
          {children}
        </ListItem>
      </Paper>
    </motion.div>
  );
};

export function SettingsWindow() {
  const { currentAccount: currentUser } = useAppwrite();
  const [activeTab, setActiveTab] = useState(0);
  const { level, setLevel, style, setStyle } = useAnimationContext();
  const { styleConfig, updateStyle, availablePalettes } = useStyle();
  const { mode, setMode } = usePerformance();
  const { openWindow } = useWindow();
  const { whileHover, whileTap } = useVisualFeedback();
  const theme = useTheme();
  const { 
    isEncryptionReady, 
    hasWalletConnected,
    connectedWalletAddress,
    connectWallet,
    disconnectWallet,
    isInitializing,
    isConnectingWallet
  } = useWalletEncryption();
  const [showEncryptionPrompt, setShowEncryptionPrompt] = useState(false);

  // Auth subdomain URL - uses the same domain but with 'auth' subdomain
  const getAuthUrl = () => {
    if (typeof window === 'undefined') return '#';
    const hostname = window.location.hostname;
    // Handle localhost differently
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001'; // Assuming auth runs on different port locally
    }
    // For production, use auth subdomain
    const parts = hostname.split('.');
    if (parts[0] === 'auth') {
      return window.location.origin; // Already on auth subdomain
    }
    // Replace first subdomain or prepend 'auth'
    if (parts.length >= 2) {
      parts[0] = 'auth';
    } else {
      parts.unshift('auth');
    }
    return `${window.location.protocol}//${parts.join('.')}`;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAnimationChange = (
    event: React.MouseEvent<HTMLElement>,
    newLevel: AnimationLevel | null,
  ) => {
    if (newLevel !== null) {
      setLevel(newLevel);
    }
  };

  const handleStyleChange = (event: SelectChangeEvent<AnimationStyle>) => {
    setStyle(event.target.value as AnimationStyle);
  };

  const handleRadiusChange = (event: React.MouseEvent<HTMLElement>, newRadius: BorderRadius | null) => {
    if (newRadius !== null) updateStyle({ borderRadius: newRadius });
  };

  const handleDepthChange = (event: React.MouseEvent<HTMLElement>, newDepth: DepthLevel | null) => {
    if (newDepth !== null) updateStyle({ depth: newDepth });
  };

  const handleBlurChange = (event: React.MouseEvent<HTMLElement>, newBlur: BlurLevel | null) => {
    if (newBlur !== null) updateStyle({ blur: newBlur });
  };

  const handleModeChange = (event: React.MouseEvent<HTMLElement>, newMode: PerformanceMode | null) => {
    if (newMode !== null) setMode(newMode);
  };

  const handleOpenPerformanceWidget = () => {
    openWindow({
      title: 'Performance',
      type: 'PERFORMANCE',
      component: null,
    });
  };

  const handleOpenExtensionManager = () => {
    openWindow({
      title: 'Extension Manager',
      type: 'EXTENSION_MANAGER',
      component: null,
    });
  };

  const sidebarBg = alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.45 : 0.95);
  const sidebarBorderColor = alpha(theme.palette.divider, 0.3);

  return (
      <Box sx={{ display: 'flex', height: '100%', bgcolor: 'background.paper' }}>
        {/* Sidebar Tabs */}
        <Box sx={{ 
          width: 240, 
          borderRight: 1, 
          borderColor: sidebarBorderColor,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: sidebarBg
        }}>
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 1 }}>SETTINGS</Typography>
          </Box>
          
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              borderRight: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                alignItems: 'center',
                justifyContent: 'flex-start',
                textAlign: 'left',
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
                minHeight: 48,
                pl: 3,
                gap: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: alpha(theme.palette.action.hover, 0.05),
                },
                '&.Mui-selected': {
                  color: 'secondary.main',
                  bgcolor: alpha(theme.palette.secondary.main, 0.08),
                  borderRight: '3px solid',
                  borderColor: 'secondary.main'
                }
              },
              '& .MuiTabs-indicator': {
                display: 'none' 
              }
            }}
          >
            <Tab icon={<PersonOutline fontSize="small" />} iconPosition="start" label="My Account" />
            <Tab icon={<Security fontSize="small" />} iconPosition="start" label="Privacy & Security" />
            <Tab icon={<PaletteOutlined fontSize="small" />} iconPosition="start" label="Appearance" />
            <Tab icon={<NotificationsNone fontSize="small" />} iconPosition="start" label="Notifications" />
            <Tab icon={<AccountBalanceWallet fontSize="small" />} iconPosition="start" label="Wallet" />
            <Tab icon={<Extension fontSize="small" />} iconPosition="start" label="Extensions" />
          </Tabs>
        </Box>

        {/* Content Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Account Tab */}
          <TabPanel value={activeTab} index={0}>
            <Stack spacing={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Avatar 
                      src="" 
                      sx={{ width: 100, height: 100, fontSize: '2.5rem', border: '2px solid #facc15', boxShadow: '0 0 20px rgba(250, 204, 21, 0.2)' }}
                    >
                      {currentUser?.name?.[0] || 'U'}
                    </Avatar>
                  </motion.div>
                  <IconButton 
                    sx={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      right: 0, 
                      bgcolor: 'secondary.main',
                      color: 'black',
                      '&:hover': { bgcolor: 'secondary.dark' },
                      width: 32,
                      height: 32
                    }}
                  >
                    <Edit sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{currentUser?.name || 'Guest User'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                     {currentUser?.email || 'Not signed in'}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box component="form" sx={{ display: 'grid', gap: 3 }}>
                <TextField 
                  label="Display Name" 
                  defaultValue={currentUser?.name} 
                  fullWidth 
                  variant="outlined"
                  size="small"
                />
                <TextField 
                  label="Username" 
                  defaultValue={`@${currentUser?.name?.toLowerCase().replace(/\s/g, '') || 'guest'}`} 
                  fullWidth 
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">@</InputAdornment>,
                  }}
                />
                <TextField 
                  label="Bio" 
                  multiline 
                  rows={3} 
                  placeholder="Write a few words about yourself..." 
                  fullWidth 
                  variant="outlined"
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <motion.div whileHover={whileHover} whileTap={whileTap}>
                  <Button variant="contained" color="secondary">
                    Save Changes
                  </Button>
                </motion.div>
              </Box>
            </Stack>
          </TabPanel>

          {/* Privacy Tab */}
          <TabPanel value={activeTab} index={1}>
            <Stack spacing={3}>
              <motion.div whileHover={{ scale: 1.01 }}>
                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.3) }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                     <Security color="success" fontSize="large" />
                     <Box>
                       <Typography variant="subtitle1" color="success.main" fontWeight={600}>TEE Encryption Active</Typography>
                       <Typography variant="body2" color="text.secondary">Your messages are processed in a Trusted Execution Environment.</Typography>
                     </Box>
                  </Stack>
                </Box>
              </motion.div>

              <List disablePadding>
                <MotionListItem>
                  <ListItemText 
                    primary="Session Key Rotation" 
                    secondary="Automatically rotate encryption keys every 24 hours" 
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked color="secondary" />
                  </ListItemSecondaryAction>
                </MotionListItem>
                
                <MotionListItem>
                  <ListItemText 
                    primary="Block Screenshots" 
                    secondary="Prevent screenshots in secret chats" 
                  />
                  <ListItemSecondaryAction>
                    <Switch color="secondary" />
                  </ListItemSecondaryAction>
                </MotionListItem>
                
                <MotionListItem>
                  <ListItemText 
                    primary="Biometric Unlock" 
                    secondary="Require FaceID/TouchID to open app" 
                  />
                  <ListItemSecondaryAction>
                    <Switch color="secondary" />
                  </ListItemSecondaryAction>
                </MotionListItem>
              </List>
            </Stack>
          </TabPanel>

          {/* Appearance Tab */}
          <TabPanel value={activeTab} index={2}>
             <Typography variant="overline" color="text.secondary" fontWeight={700}>THEME</Typography>
             <List disablePadding sx={{ mb: 2 }}>
               <MotionListItem>
                 <ListItemText primary="Dark Mode" />
                 <ListItemSecondaryAction>
                   <Switch 
                     checked={styleConfig.themeMode === 'dark'} 
                     onChange={(e) => updateStyle({ themeMode: e.target.checked ? 'dark' : 'light' })}
                     color="secondary" 
                   />
                 </ListItemSecondaryAction>
               </MotionListItem>
             </List>

             <Box sx={{ mb: 3, px: 1 }}>
               <Typography variant="caption" color="text.secondary" gutterBottom>Color Palette</Typography>
               <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                 <Select
                   value={styleConfig.paletteId}
                   onChange={(e) => updateStyle({ paletteId: e.target.value })}
                   sx={{ borderRadius: 2 }}
                 >
                   {Object.entries(availablePalettes).map(([id, group]) => (
                     <MenuItem key={id} value={id}>
                       {group.light.name}
                     </MenuItem>
                   ))}
                 </Select>
               </FormControl>
             </Box>

             <Typography variant="overline" color="text.secondary" fontWeight={700}>PERFORMANCE</Typography>
             <Box sx={{ mb: 3, mt: 1 }}>
               <ToggleButtonGroup
                  value={mode}
                  exclusive
                  onChange={handleModeChange}
                  aria-label="performance mode"
                  fullWidth
                  color="secondary"
                  size="small"
                >
                  <ToggleButton value="low">Low</ToggleButton>
                  <ToggleButton value="medium">Medium</ToggleButton>
                  <ToggleButton value="high">High</ToggleButton>
                  <ToggleButton value="dynamic">Dynamic</ToggleButton>
                </ToggleButtonGroup>
                <Box sx={{ mt: 2 }}>
                  <motion.div whileHover={whileHover} whileTap={whileTap}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      onClick={handleOpenPerformanceWidget}
                    >
                      Open Performance Monitor
                    </Button>
                  </motion.div>
                </Box>
             </Box>

             <Typography variant="overline" color="text.secondary" fontWeight={700}>INTERFACE STYLE</Typography>
             
             <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
               <Box>
                 <Typography variant="caption" gutterBottom>Border Radius</Typography>
                 <ToggleButtonGroup
                    value={styleConfig.borderRadius}
                    exclusive
                    onChange={handleRadiusChange}
                    fullWidth
                    size="small"
                    color="secondary"
                  >
                    <ToggleButton value="none">None</ToggleButton>
                    <ToggleButton value="sm">Sm</ToggleButton>
                    <ToggleButton value="md">Md</ToggleButton>
                    <ToggleButton value="lg">Lg</ToggleButton>
                    <ToggleButton value="xl">Xl</ToggleButton>
                  </ToggleButtonGroup>
               </Box>

               <Box>
                 <Typography variant="caption" gutterBottom>Depth (3D Effect)</Typography>
                 <ToggleButtonGroup
                    value={styleConfig.depth}
                    exclusive
                    onChange={handleDepthChange}
                    fullWidth
                    size="small"
                    color="secondary"
                  >
                    <ToggleButton value="flat">Flat</ToggleButton>
                    <ToggleButton value="low">Low</ToggleButton>
                    <ToggleButton value="medium">Mid</ToggleButton>
                    <ToggleButton value="high">High</ToggleButton>
                    <ToggleButton value="extreme">Max</ToggleButton>
                  </ToggleButtonGroup>
               </Box>

               <Box>
                 <Typography variant="caption" gutterBottom>Glass Blur</Typography>
                 <ToggleButtonGroup
                    value={styleConfig.blur}
                    exclusive
                    onChange={handleBlurChange}
                    fullWidth
                    size="small"
                    color="secondary"
                  >
                    <ToggleButton value="none">None</ToggleButton>
                    <ToggleButton value="low">Low</ToggleButton>
                    <ToggleButton value="medium">Mid</ToggleButton>
                    <ToggleButton value="high">High</ToggleButton>
                  </ToggleButtonGroup>
               </Box>
             </Box>

             <List disablePadding sx={{ mt: 2 }}>
               <MotionListItem>
                 <ListItemText primary="Scale on Hover" secondary="Elements grow slightly when hovered" />
                 <ListItemSecondaryAction>
                   <Switch 
                     checked={styleConfig.scaleOnHover} 
                     onChange={(e) => updateStyle({ scaleOnHover: e.target.checked })} 
                     color="secondary" 
                   />
                 </ListItemSecondaryAction>
               </MotionListItem>
               <MotionListItem>
                 <ListItemText primary="Active Glow" secondary="Elements glow when active or hovered" />
                 <ListItemSecondaryAction>
                   <Switch 
                     checked={styleConfig.activeGlow} 
                     onChange={(e) => updateStyle({ activeGlow: e.target.checked })} 
                     color="secondary" 
                   />
                 </ListItemSecondaryAction>
               </MotionListItem>
             </List>

             <Divider sx={{ my: 2 }} />
             
             <Typography variant="overline" color="text.secondary" fontWeight={700}>ANIMATIONS</Typography>
             
             <ToggleButtonGroup
                value={level}
                exclusive
                onChange={handleAnimationChange}
                fullWidth
                color="secondary"
                size="small"
                sx={{ mt: 1, mb: 2 }}
              >
                <ToggleButton value="none">None</ToggleButton>
                <ToggleButton value="low">Low</ToggleButton>
                <ToggleButton value="mid">Mid</ToggleButton>
                <ToggleButton value="high">High</ToggleButton>
              </ToggleButtonGroup>

              <FormControl fullWidth size="small">
                <InputLabel id="animation-style-label">Animation Style</InputLabel>
                <Select
                  labelId="animation-style-label"
                  value={style}
                  label="Animation Style"
                  onChange={handleStyleChange}
                >
                  <MenuItem value="genie">Genie Effect</MenuItem>
                  <MenuItem value="scale">Scale & Fade</MenuItem>
                  <MenuItem value="slide">Slide Up</MenuItem>
                  <MenuItem value="fade">Simple Fade</MenuItem>
                </Select>
              </FormControl>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={activeTab} index={3}>
            <List disablePadding>
               <MotionListItem>
                 <ListItemText primary="Message Previews" secondary="Show message content in notifications" />
                 <ListItemSecondaryAction>
                   <Switch defaultChecked color="secondary" />
                 </ListItemSecondaryAction>
               </MotionListItem>
               <MotionListItem>
                 <ListItemText primary="Sound" />
                 <ListItemSecondaryAction>
                   <Switch defaultChecked color="secondary" />
                 </ListItemSecondaryAction>
               </MotionListItem>
            </List>
          </TabPanel>

          {/* Wallet Tab */}
          <TabPanel value={activeTab} index={4}>
            <Stack spacing={3}>
              {/* Wallet Connection Status Card */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring" }}
              >
                <Box sx={{ 
                  p: 4, 
                  bgcolor: hasWalletConnected 
                    ? alpha(theme.palette.success.main, 0.1) 
                    : alpha(theme.palette.warning.main, 0.1), 
                  borderRadius: 2, 
                  border: '1px solid', 
                  borderColor: hasWalletConnected 
                    ? alpha(theme.palette.success.main, 0.3)
                    : alpha(theme.palette.warning.main, 0.3),
                }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <AccountBalanceWallet sx={{ 
                      fontSize: 40, 
                      color: hasWalletConnected ? 'success.main' : 'warning.main' 
                    }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {hasWalletConnected ? 'Wallet Connected' : 'No Wallet Connected'}
                      </Typography>
                      {connectedWalletAddress ? (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace', 
                            color: 'text.secondary',
                            wordBreak: 'break-all' 
                          }}
                        >
                          {connectedWalletAddress}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Connect a wallet to enable encrypted messaging.
                        </Typography>
                      )}
                    </Box>
                    {hasWalletConnected ? (
                      <Button 
                        variant="outlined" 
                        color="error"
                        size="small"
                        onClick={disconnectWallet}
                        disabled={isConnectingWallet}
                      >
                        {isConnectingWallet ? 'Disconnecting...' : 'Disconnect'}
                      </Button>
                    ) : (
                      <Button 
                        variant="contained" 
                        color="secondary"
                        onClick={connectWallet}
                        disabled={isConnectingWallet}
                        startIcon={isConnectingWallet ? <CircularProgress size={16} color="inherit" /> : <AccountBalanceWallet />}
                      >
                        {isConnectingWallet ? 'Connecting...' : 'Connect Wallet'}
                      </Button>
                    )}
                  </Stack>
                </Box>
              </motion.div>

              {/* Encryption Status Card - Only show if wallet is connected */}
              {hasWalletConnected && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                >
                  <Box sx={{ 
                    p: 4, 
                    bgcolor: isEncryptionReady 
                      ? alpha(theme.palette.success.main, 0.1) 
                      : alpha(theme.palette.info.main, 0.1), 
                    borderRadius: 2, 
                    border: '1px solid', 
                    borderColor: isEncryptionReady 
                      ? alpha(theme.palette.success.main, 0.3)
                      : alpha(theme.palette.info.main, 0.3),
                  }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      {isEncryptionReady ? (
                        <Lock sx={{ fontSize: 40, color: 'success.main' }} />
                      ) : (
                        <LockOpen sx={{ fontSize: 40, color: 'info.main' }} />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          {isEncryptionReady ? 'Encryption Active' : 'Encryption Not Enabled'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {isEncryptionReady 
                            ? 'Your messages are end-to-end encrypted with your wallet.'
                            : 'Sign a message with your wallet to enable encrypted messaging.'}
                        </Typography>
                      </Box>
                      {isEncryptionReady ? (
                        <Chip 
                          icon={<CheckCircle />}
                          label="Active"
                          color="success"
                          variant="outlined"
                        />
                      ) : (
                        <Button 
                          variant="contained" 
                          color="secondary"
                          onClick={() => setShowEncryptionPrompt(true)}
                          disabled={isInitializing}
                          startIcon={<Lock />}
                        >
                          Enable Encryption
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </motion.div>
              )}

              <Divider />

              {/* Wallet Management Section */}
              <Box>
                <Typography variant="overline" color="text.secondary" fontWeight={700} gutterBottom>
                  WALLET MANAGEMENT
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Manage your connected wallets in the Tenchat Auth portal.
                </Typography>
                <motion.div whileHover={whileHover} whileTap={whileTap}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    endIcon={<OpenInNew />}
                    onClick={() => window.open(`${getAuthUrl()}/settings`, '_blank')}
                    sx={{ justifyContent: 'space-between', py: 1.5 }}
                  >
                    Open Auth Settings
                  </Button>
                </motion.div>
              </Box>

              {/* Security Info */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.info.main, 0.2),
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Security sx={{ color: 'info.main', mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      How Wallet Encryption Works
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="div">
                      • Your wallet is stored in your Tenchat account<br />
                      • Encryption key is derived from a wallet signature<br />
                      • The same wallet always produces the same key<br />
                      • No passwords or recovery phrases needed<br />
                      • Switch devices? Just sign again with the same wallet
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Link to Auth App */}
              <List disablePadding>
                <MotionListItem
                  button
                  onClick={() => window.open(`${getAuthUrl()}/settings`, '_blank')}
                >
                  <ListItemText 
                    primary="Account Settings" 
                    secondary="Manage your Tenchat account in the Auth portal" 
                  />
                  <OpenInNew sx={{ color: 'text.secondary' }} />
                </MotionListItem>
                <MotionListItem
                  button
                  onClick={() => window.open(`${getAuthUrl()}/settings`, '_blank')}
                >
                  <ListItemText 
                    primary="Security Settings" 
                    secondary="Passkeys, sessions, and connected wallets" 
                  />
                  <OpenInNew sx={{ color: 'text.secondary' }} />
                </MotionListItem>
              </List>
            </Stack>

            {/* Encryption Prompt Dialog */}
            <EncryptionPromptDialog 
              open={showEncryptionPrompt} 
              onClose={() => setShowEncryptionPrompt(false)} 
            />
          </TabPanel>

          {/* Extensions Tab */}
          <TabPanel value={activeTab} index={5}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{ display: 'inline-block' }}
              >
                <Extension sx={{ fontSize: 80, color: 'secondary.main', mb: 2, opacity: 0.8 }} />
              </motion.div>
              <Typography variant="h4" gutterBottom fontWeight={700}>Extension Kernel</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}>
                Manage system extensions and kernel-level plugins. This allows you to modify the behavior of the application safely.
              </Typography>
              <motion.div whileHover={whileHover} whileTap={whileTap}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  onClick={handleOpenExtensionManager}
                  sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                >
                  Open Extension Manager
                </Button>
              </motion.div>
            </Box>
          </TabPanel>
        </Box>
      </Box>
  );
}

export const SettingsDialog = SettingsWindow;

