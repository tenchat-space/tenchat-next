import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
  InputAdornment
} from '@mui/material';
import {
  PersonOutline,
  Security,
  NotificationsNone,
  PaletteOutlined,
  Close,
  Edit,
  Fingerprint,
  AccountBalanceWallet
} from '@mui/icons-material';
import { Models } from 'appwrite';
import { useAnimationContext } from '@/contexts/AnimationContext';
import { AnimationLevel, AnimationStyle } from '@/types/animation';
import { ToggleButton, ToggleButtonGroup, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  currentUser: Models.User<Models.Preferences> | null;
}

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
      style={{ height: '100%', overflowY: 'auto' }}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export function SettingsDialog({ open, onClose, currentUser }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState(0);
  const { level, setLevel, style, setStyle } = useAnimationContext();

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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: 700,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          backgroundImage: 'linear-gradient(135deg, rgba(19, 11, 31, 0.95), rgba(12, 4, 11, 0.98))',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          border: '1px solid rgba(250, 204, 21, 0.15)',
        }
      }}
    >
      <Box sx={{ display: 'flex', height: '100%' }}>
        {/* Sidebar Tabs */}
        <Box sx={{ 
          width: 240, 
          borderRight: 1, 
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'rgba(255, 255, 255, 0.02)'
        }}>
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" fontWeight={700}>Settings</Typography>
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
                alignItems: 'flex-start',
                textAlign: 'left',
                textTransform: 'none',
                fontSize: '0.95rem',
                minHeight: 56,
                pl: 3,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
                '&.Mui-selected': {
                  color: 'secondary.main',
                  bgcolor: 'rgba(250, 204, 21, 0.08)',
                  borderRight: '3px solid',
                  borderColor: 'secondary.main'
                }
              },
              '& .MuiTabs-indicator': {
                display: 'none' 
              }
            }}
          >
            <Tab icon={<PersonOutline />} iconPosition="start" label="My Account" />
            <Tab icon={<Security />} iconPosition="start" label="Privacy & Security" />
            <Tab icon={<PaletteOutlined />} iconPosition="start" label="Appearance" />
            <Tab icon={<NotificationsNone />} iconPosition="start" label="Notifications" />
            <Tab icon={<AccountBalanceWallet />} iconPosition="start" label="Wallet" />
          </Tabs>
        </Box>

        {/* Content Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
             <IconButton onClick={onClose} edge="end">
               <Close />
             </IconButton>
          </Box>

          {/* Account Tab */}
          <TabPanel value={activeTab} index={0}>
            <Stack spacing={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar 
                    src="" 
                    sx={{ width: 100, height: 100, fontSize: '2.5rem', border: '2px solid #facc15' }}
                  >
                    {currentUser?.name?.[0] || 'U'}
                  </Avatar>
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
                />
                <TextField 
                  label="Username" 
                  defaultValue={`@${currentUser?.name?.toLowerCase().replace(/\s/g, '') || 'guest'}`} 
                  fullWidth 
                  variant="outlined"
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

              <Box>
                <Button variant="contained" color="secondary">
                  Save Changes
                </Button>
              </Box>
            </Stack>
          </TabPanel>

          {/* Privacy Tab */}
          <TabPanel value={activeTab} index={1}>
            <Stack spacing={3}>
              <Box sx={{ p: 2, bgcolor: 'rgba(34, 197, 94, 0.1)', borderRadius: 2, border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                   <Security color="success" fontSize="large" />
                   <Box>
                     <Typography variant="subtitle1" color="success.main" fontWeight={600}>TEE Encryption Active</Typography>
                     <Typography variant="body2" color="text.secondary">Your messages are processed in a Trusted Execution Environment.</Typography>
                   </Box>
                </Stack>
              </Box>

              <List>
                <ListItem>
                  <ListItemText 
                    primary="Session Key Rotation" 
                    secondary="Automatically rotate encryption keys every 24 hours" 
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked color="secondary" />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="Block Screenshots" 
                    secondary="Prevent screenshots in secret chats" 
                  />
                  <ListItemSecondaryAction>
                    <Switch color="secondary" />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="Biometric Unlock" 
                    secondary="Require FaceID/TouchID to open app" 
                  />
                  <ListItemSecondaryAction>
                    <Switch color="secondary" />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Stack>
          </TabPanel>

          {/* Appearance Tab */}
          <TabPanel value={activeTab} index={2}>
             <Typography variant="h6" gutterBottom>Theme</Typography>
             <List>
               <ListItem>
                 <ListItemText primary="Dark Mode" />
                 <ListItemSecondaryAction>
                   <Switch defaultChecked color="secondary" />
                 </ListItemSecondaryAction>
               </ListItem>
             </List>

             <Divider sx={{ my: 2 }} />
             
             <Typography variant="h6" gutterBottom>Animations</Typography>
             <Typography variant="body2" color="text.secondary" gutterBottom>
               Adjust the intensity of interface animations.
             </Typography>
             
             <ToggleButtonGroup
                value={level}
                exclusive
                onChange={handleAnimationChange}
                aria-label="animation intensity"
                fullWidth
                color="secondary"
                sx={{ mt: 1, mb: 3 }}
              >
                <ToggleButton value="none">None</ToggleButton>
                <ToggleButton value="low">Low</ToggleButton>
                <ToggleButton value="mid">Mid</ToggleButton>
                <ToggleButton value="high">High</ToggleButton>
              </ToggleButtonGroup>

              <FormControl fullWidth sx={{ mb: 2 }}>
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
            <List>
               <ListItem>
                 <ListItemText primary="Message Previews" secondary="Show message content in notifications" />
                 <ListItemSecondaryAction>
                   <Switch defaultChecked color="secondary" />
                 </ListItemSecondaryAction>
               </ListItem>
               <ListItem>
                 <ListItemText primary="Sound" />
                 <ListItemSecondaryAction>
                   <Switch defaultChecked color="secondary" />
                 </ListItemSecondaryAction>
               </ListItem>
            </List>
          </TabPanel>

          {/* Wallet Tab */}
          <TabPanel value={activeTab} index={4}>
            <Stack spacing={3}>
              <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                <Fingerprint sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>Wallet Connected</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'monospace' }}>
                  0x71C...9A23
                </Typography>
                <Button variant="outlined" color="error">
                  Disconnect Wallet
                </Button>
              </Box>
            </Stack>
          </TabPanel>
        </Box>
      </Box>
    </Dialog>
  );
}

