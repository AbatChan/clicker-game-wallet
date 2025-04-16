import { Routes, Route } from 'react-router-dom';
import AdminPage from './AdminPage';

import {
  // React
  React, useState, useEffect, useMemo, useRef, useNavigate,
  
  // MUI Core
  useTheme, Container, Typography, Button, Box, Grid,
  Card, CardContent, CardActions, Paper, TextField,
  useMediaQuery, Skeleton, CircularProgress, Link,
  
  // MUI Table
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip,
  
  // MUI Dialog
  IconButton, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Alert, Slide, Fade, Tooltip, ClickAwayListener,
  Modal, Backdrop,
  
  // MUI Menu
  Menu, MenuItem, ListItemIcon, ListItemText,
  
  // MUI Icons
  SavingsIcon, UpgradeIcon, AccountBalanceWalletIcon, MouseIcon,
  AutoAwesomeIcon, MonetizationOnIcon, CheckCircleIcon, ErrorIcon,
  WarningIcon, InfoIcon, CloseIcon, ContentCopyIcon, SettingsIcon,
  AdminPanelSettingsIcon, CancelIcon, PendingIcon,
  
  // API 
  API_BASE_URL
} from './commonImports';

// Toast component for styled notifications
const Toast = ({ message, type, onClose }) => {
  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'linear-gradient(145deg, rgba(40, 167, 69, 0.1), rgba(25, 135, 84, 0.2))',
          border: 'rgba(40, 167, 69, 0.3)',
          icon: '#28a745',
          glow: '0 0 15px rgba(40, 167, 69, 0.5)'
        };
      case 'error':
        return {
          bg: 'linear-gradient(145deg, rgba(220, 53, 69, 0.1), rgba(190, 33, 49, 0.2))',
          border: 'rgba(220, 53, 69, 0.3)',
          icon: '#dc3545',
          glow: '0 0 15px rgba(220, 53, 69, 0.5)'
        };
      case 'warning':
        return {
          bg: 'linear-gradient(145deg, rgba(255, 193, 7, 0.1), rgba(235, 173, 0, 0.2))',
          border: 'rgba(255, 193, 7, 0.3)',
          icon: '#ffc107',
          glow: '0 0 15px rgba(255, 193, 7, 0.5)'
        };
      default:
        return {
          bg: 'linear-gradient(145deg, rgba(33, 150, 243, 0.1), rgba(13, 130, 223, 0.2))',
          border: 'rgba(33, 150, 243, 0.3)',
          icon: '#2196F3',
          glow: '0 0 15px rgba(33, 150, 243, 0.5)'
        };
    }
  };
  
  const colors = getColors();
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ color: colors.icon, filter: `drop-shadow(${colors.glow})` }} />;
      case 'error':
        return <ErrorIcon sx={{ color: colors.icon, filter: `drop-shadow(${colors.glow})` }} />;
      case 'warning':
        return <WarningIcon sx={{ color: colors.icon, filter: `drop-shadow(${colors.glow})` }} />;
      default:
        return <InfoIcon sx={{ color: colors.icon, filter: `drop-shadow(${colors.glow})` }} />;
    }
  };

  return (
    <Fade in>
      <Paper
        elevation={6}
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          borderRadius: 3,
          background: colors.bg,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${colors.border}`,
          boxShadow: `0 5px 20px rgba(0, 0, 0, 0.2)`,
          mb: 2
        }}
      >
        {getIcon()}
        <Typography sx={{ ml: 1.5, fontWeight: 500 }}>{message}</Typography>
        <IconButton 
          size="small" 
          onClick={onClose}
          sx={{ 
            ml: 'auto',
            opacity: 0.7,
            '&:hover': {
              opacity: 1
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Paper>
    </Fade>
  );
};

// Enhanced CoinSparkle component for coin animations
const EnhancedCoinSparkle = ({ x, y, amount }) => {
  const [visible, setVisible] = useState(true);
  const sparkleColor = useMemo(() => {
    // Choose color based on amount
    if (amount > 1000) return '#FF4500'; // Red-orange for huge amounts
    if (amount > 100) return '#FF8C00';  // Dark orange for large amounts
    if (amount > 10) return '#FFD700';   // Gold for medium amounts
    return '#FFC107';                    // Default amber
  }, [amount]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!visible) return null;
  
  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        transform: `translate(${x}px, ${y}px)`,
        pointerEvents: 'none',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'enhancedCoinFloat 2s forwards',
        '@keyframes enhancedCoinFloat': {
          '0%': {
            opacity: 0,
            transform: `translate(${x}px, ${y}px) scale(0.3)`,
          },
          '10%': {
            opacity: 1,
            transform: `translate(${x + 10}px, ${y - 20}px) scale(1.1)`, // Move slightly right
          },
          '20%': {
            transform: `translate(${x + 20}px, ${y - 40}px) scale(1)`, // Continue moving right
          },
          '80%': {
            opacity: 1,
          },
          '100%': {
            opacity: 0,
            transform: `translate(${x + 30}px, ${y - 150}px) scale(1.2)`, // Float up and to the right
          }
        }
      }}
    >
      <Paper
        elevation={10}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 16px',
          borderRadius: 10,
          background: 'rgba(25, 28, 35, 0.85)',
          backdropFilter: 'blur(8px)',
          border: `2px solid ${sparkleColor}`,
          boxShadow: `0 0 20px ${sparkleColor}`,
        }}
      >
        <MonetizationOnIcon 
          sx={{ 
            color: sparkleColor,
            mr: 0.5,
            animation: 'spin 1.5s infinite linear',
            '@keyframes spin': {
              from: { transform: 'rotate(0deg)' },
              to: { transform: 'rotate(360deg)' }
            }
          }} 
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: 'white',
            textShadow: `0 0 10px ${sparkleColor}`,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          +{amount}
        </Typography>
      </Paper>
      
      {/* Generate small star particles around the main indicator */}
      {[...Array(3)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 50 + Math.random() * 20;
        const size = 5 + Math.random() * 10;
        const delay = Math.random() * 0.3;
        
        return (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: size,
              height: size,
              backgroundColor: sparkleColor,
              borderRadius: '50%',
              boxShadow: `0 0 ${size/2}px ${sparkleColor}`,
              animation: `particleFloat 1.5s forwards ${delay}s`,
              '@keyframes particleFloat': {
                '0%': {
                  opacity: 0,
                  transform: 'scale(0) translate(0, 0)',
                },
                '20%': {
                  opacity: 1,
                },
                '100%': {
                  opacity: 0,
                  transform: `scale(1) translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`,
                }
              }
            }}
          />
        );
      })}
    </Box>
  );
};

// Cashout success animation component
const CashoutSuccessAnimation = ({ amount, onComplete }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  if (!visible) return null;
  
  // Create array of coin animations
  const coinCount = Math.min(15, Math.max(5, Math.floor(amount / 50)));
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9998,
        pointerEvents: 'none',
      }}
    >
      {/* Background flash effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 215, 0, 0.2)',
          animation: 'flashFade 3s forwards',
          '@keyframes flashFade': {
            '0%': { opacity: 0 },
            '10%': { opacity: 1 },
            '30%': { opacity: 0.7 },
            '100%': { opacity: 0 },
          }
        }}
      />
      
      {/* Cash out text overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          animation: 'scaleUp 0.5s forwards, fadeOut 0.5s 2.5s forwards',
          '@keyframes scaleUp': {
            '0%': { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0 },
            '100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
          },
          '@keyframes fadeOut': {
            '0%': { opacity: 1 },
            '100%': { opacity: 0 },
          }
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            textShadow: '0 0 20px rgba(255, 215, 0, 0.7)',
            mb: 2,
          }}
        >
          CASHED OUT!
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'white',
            textShadow: '0 0 10px rgba(255, 255, 255, 0.7)',
          }}
        >
          {amount} Coins
        </Typography>
      </Box>
      
      {/* Falling coins */}
      {[...Array(coinCount)].map((_, i) => {
        const startX = Math.random() * window.innerWidth;
        const endX = startX + (Math.random() * 300 - 150);
        const startY = -100;
        const size = 20 + Math.random() * 30;
        const duration = 1 + Math.random() * 2;
        const delay = Math.random() * 0.5;
        const rotation = Math.random() * 360;
        const rotationSpeed = Math.random() * 720 - 360;
        
        return (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              color: '#FFD700',
              fontSize: size,
              animation: `fallDown ${duration}s forwards ${delay}s`,
              '@keyframes fallDown': {
                '0%': {
                  opacity: 0,
                  transform: `translate(${startX}px, ${startY}px) rotate(${rotation}deg)`,
                },
                '10%': {
                  opacity: 1,
                },
                '90%': {
                  opacity: 1,
                },
                '100%': {
                  opacity: 0,
                  transform: `translate(${endX}px, ${window.innerHeight + 100}px) rotate(${rotation + rotationSpeed}deg)`,
                }
              }
            }}
          >
            <MonetizationOnIcon sx={{ fontSize: 'inherit', filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.7))' }} />
          </Box>
        );
      })}
    </Box>
  );
};

// Styled confirmation dialog for cashout
const StyledConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => {
  // Create a ref to track dialog content
  const confirmButtonRef = useRef(null);
  
  // Handle keydown events to manage focus
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && confirmButtonRef.current) {
      event.preventDefault();
      onConfirm();
    }
  };
  
  // Close dialog properly
  const handleClose = () => {
    // Ensure we properly return focus and close
    onCancel();
  };
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      // These props are important for accessibility
      disablePortal={false}
      disableEnforceFocus={false}
      disableAutoFocus={false}
      keepMounted={false}
      onKeyDown={handleKeyDown}
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(35, 39, 47, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 4,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          position: 'relative',
          minWidth: { xs: '90%', sm: '400px' },
          maxWidth: '500px',
        }
      }}
      TransitionComponent={Slide}
      TransitionProps={{ 
        direction: 'up',
        onExited: () => {
          // Ensure we clean up and restore UI state after closing
          document.body.style.overflow = 'auto';
        }
      }}
    >
      {/* Decorative corners */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '20px',
          height: '20px',
          borderTop: '2px solid rgba(255, 215, 0, 0.5)',
          borderLeft: '2px solid rgba(255, 215, 0, 0.5)'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '20px',
          height: '20px',
          borderTop: '2px solid rgba(255, 215, 0, 0.5)',
          borderRight: '2px solid rgba(255, 215, 0, 0.5)'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '20px',
          height: '20px',
          borderBottom: '2px solid rgba(255, 215, 0, 0.5)',
          borderLeft: '2px solid rgba(255, 215, 0, 0.5)'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '20px',
          height: '20px',
          borderBottom: '2px solid rgba(255, 215, 0, 0.5)',
          borderRight: '2px solid rgba(255, 215, 0, 0.5)'
        }}
      />
      
      <DialogTitle id="alert-dialog-title" sx={{ textAlign: 'center', pb: 0 }}>
        <Box
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
            background: 'linear-gradient(45deg, #FFD700, #FFC107)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            filter: 'drop-shadow(0 2px 3px rgba(255, 215, 0, 0.3))'
          }}
        >
          {title}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText
          id="alert-dialog-description"
          sx={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.9)',
            my: 2
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
        <Button
          variant="outlined"
          onClick={handleClose}
          tabIndex={0}
          sx={{
            borderRadius: 2,
            px: 3,
            borderColor: 'rgba(255, 255, 255, 0.3)',
            color: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          autoFocus
          ref={confirmButtonRef}
          tabIndex={0}
          sx={{
            borderRadius: 2,
            px: 3,
            background: 'linear-gradient(45deg, #FF8E53, #FE6B8B)',
            boxShadow: '0 5px 15px rgba(254, 107, 139, 0.4)',
            '&:hover': {
              background: 'linear-gradient(45deg, #FF512F, #F09819)',
              boxShadow: '0 7px 20px rgba(254, 107, 139, 0.5)',
            }
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Toast container component
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: { xs: '90%', sm: '400px' },
        maxWidth: '100%',
      }}
    >
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </Box>
  );
};

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [walletId, setWalletId] = useState(localStorage.getItem('walletId') || null);
  const [coinBalance, setCoinBalance] = useState(0);
  const coinBalanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [availableUpgrades, setAvailableUpgrades] = useState([]);
  const [ownedUpgradeIds, setOwnedUpgradeIds] = useState([]);
  const [purchaseLoading, setPurchaseLoading] = useState(null);
  const [clickAnimation, setClickAnimation] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const [coinSparkle, setCoinSparkle] = useState(null);
  const [passiveRatePerSecond, setPassiveRatePerSecond] = useState(0);
  const [displayBalance, setDisplayBalance] = useState(0);
  const previousDisplayBalanceRef = useRef(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const [copyTooltipOpen, setCopyTooltipOpen] = useState(false);

  const [userPayouts, setUserPayouts] = useState([]);
  const [isPayoutsModalOpen, setIsPayoutsModalOpen] = useState(false);
  const [loadingPayouts, setLoadingPayouts] = useState(false);

  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [showCashoutAnimation, setShowCashoutAnimation] = useState(false);
  const [cashoutAmount, setCashoutAmount] = useState(0);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Automatically remove toast after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };
  
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleAdminClick = () => {
    navigate('/admin');
    handleMenuClose();
  };
  
  // Confirmation dialog functions
  const showConfirmation = (title, message, onConfirm) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm
    });
  };
  
  const closeConfirmation = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

  // --- Copy Wallet ID Handler ---
  const handleCopyWalletId = async () => {
    if (!walletId || !navigator.clipboard) {
        addToast('Cannot copy ID.', 'error');
        return;
    }
    try {
        await navigator.clipboard.writeText(walletId);
        addToast('Wallet ID copied to clipboard!', 'success');
        setCopyTooltipOpen(true);
    } catch (err) {
        console.error('Failed to copy wallet ID:', err);
        addToast('Failed to copy Wallet ID.', 'error');
        setCopyTooltipOpen(false);
    }
  };

  // Handler to close the tooltip
  const handleTooltipClose = () => {
    setCopyTooltipOpen(false);
  };

  const fetchUserPayouts = async () => {
    if (!walletId) {
      addToast("Wallet not initialized", "error");
      return;
    }
    setLoadingPayouts(true);
    setUserPayouts([]);
    try {
      // No auth needed for user's own payouts
      const response = await fetch(`${API_BASE_URL}/wallets/${walletId}/payouts`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch payout history');
      setUserPayouts(data);
    } catch (err) {
      console.error("Fetch user payouts error:", err);
      addToast(err.message, 'error');
    } finally {
      setLoadingPayouts(false);
    }
  };

  const handleViewPayoutsClick = () => {
    fetchUserPayouts();
    setIsPayoutsModalOpen(true);
    handleMenuClose();
  };

  // Effect for initialization remains largely the same logic, just fetches data
  useEffect(() => {
    const initializeApp = async () => {
      // Reset states on init unless walletId persists
      setLoading(true);
      setAvailableUpgrades([]);
      setOwnedUpgradeIds([]);
      let currentWalletId = localStorage.getItem('walletId');
      let initialBalance = 0;

      try {
        // --- 1. Initialize Wallet ---
        if (!currentWalletId) {
          console.log('No wallet ID found, creating one...');
          const response = await fetch(`${API_BASE_URL}/wallets`, { method: 'POST' });
          if (!response.ok) throw new Error(`Wallet creation failed: ${response.status}`);
          const data = await response.json();
          currentWalletId = data.wallet_id;
          localStorage.setItem('walletId', currentWalletId);
          setWalletId(currentWalletId);
          addToast('Wallet created successfully! Start clicking to earn.', 'success');
        } else {
          console.log('Found wallet ID:', currentWalletId);
          setWalletId(currentWalletId);
        }

        // --- 2. Fetch Wallet Balance ---
        console.log('Fetching balance for wallet:', currentWalletId);
        const balanceResponse = await fetch(`${API_BASE_URL}/wallets/${currentWalletId}`);
        if (!balanceResponse.ok) {
           if (balanceResponse.status === 404) {
              console.error('Stored wallet ID not found on backend. Clearing...');
              localStorage.removeItem('walletId');
              window.location.reload();
              return;
           } else {
             throw new Error(`Balance fetch failed: ${balanceResponse.status}`);
           }
        }
        const balanceData = await balanceResponse.json();
        initialBalance = parseInt(balanceData.coin_balance, 10) || 0;
        setCoinBalance(initialBalance);
        setDisplayBalance(initialBalance);
        previousDisplayBalanceRef.current = initialBalance;
   
        const upgradesResponse = await fetch(`${API_BASE_URL}/upgrades`);
        if (!upgradesResponse.ok) throw new Error(`Upgrades fetch failed: ${upgradesResponse.status}`);
        const upgradesData = await upgradesResponse.json();
        
        // Add slight delay for demo purposes to see skeleton loader
        await new Promise(resolve => setTimeout(resolve, 800));
        setAvailableUpgrades(upgradesData);
        console.log('Fetched available upgrades:', upgradesData);

        // --- 4. Fetch Owned Upgrade IDs ---
        console.log('Fetching owned upgrades for wallet:', currentWalletId);
        const ownedResponse = await fetch(`${API_BASE_URL}/wallets/${currentWalletId}/upgrades`);
        if (!ownedResponse.ok) throw new Error(`Owned upgrades fetch failed: ${ownedResponse.status}`);
        const ownedData = await ownedResponse.json();
        setOwnedUpgradeIds(ownedData);
        console.log('Fetched owned upgrade IDs:', ownedData);

        // --- 5. Calculate Passive Rate (Client-side) ---
        let calculatedRate = 0;
        if (upgradesData && ownedData) {
            ownedData.forEach(ownedId => {
                const upgrade = upgradesData.find(upg => upg.upgrade_id === ownedId);
                if (upgrade && upgrade.effect_type === 'PASSIVE_RATE_PER_SECOND') {
                  calculatedRate += parseFloat(upgrade.effect_value) || 0;
                }
            });
        }
        setPassiveRatePerSecond(calculatedRate);
        console.log('Calculated client-side passive rate:', calculatedRate, 'coins/sec');

        setDisplayBalance(initialBalance);
      } catch (err) {
        console.error("Initialization error:", err);
        if (err.message.includes('Wallet ID mismatch') || err.message.includes('Wallet creation failed')) {
           localStorage.removeItem('walletId');
           setWalletId(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

   // Effect for visual passive income timer
  useEffect(() => {
    if (passiveRatePerSecond <= 0 || loading) {
      return;
    }

    let lastTickTime = Date.now();

    const intervalId = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = (now - lastTickTime) / 1000;
      const earnedVisually = elapsedSeconds * passiveRatePerSecond;

      // Update display balance, allowing decimals for smoother ticking
      setDisplayBalance(prev => prev + earnedVisually);

      lastTickTime = now;
    }, 100);

    // Cleanup function to clear interval when component unmounts or rate changes
    return () => clearInterval(intervalId);

  }, [passiveRatePerSecond, loading]);

  // Track balance changes to show coin sparkle
  useEffect(() => {
    const previousDisplayNum = Math.floor(previousDisplayBalanceRef.current);
    const currentDisplayNum = Math.floor(displayBalance);

    // Trigger sparkle based on visual change
    if (currentDisplayNum > previousDisplayNum && previousDisplayNum !== 0) {
      const amountAdded = currentDisplayNum - previousDisplayNum;

      let x, y;
      if (coinBalanceRef.current) {
        const rect = coinBalanceRef.current.getBoundingClientRect();
        const x = rect.right - 20;
        const y = rect.top + (rect.height / 2);
        setCoinSparkle({ id: Date.now(), x, y, amount: amountAdded });
      } else {
        x = window.innerWidth / 2;
        y = window.innerHeight / 2;
        setCoinSparkle({ id: Date.now(), x, y, amount: amountAdded });
      }
    }
    previousDisplayBalanceRef.current = displayBalance;
  }, [displayBalance]);

  // Create sparkle effect
  const createSparkles = (x, y) => {
    const newSparkles = [];
    const colors = ['#FFD700', '#FFC107', '#FF8E53', '#FE6B8B', '#2196F3', '#00BCD4'];
    
    // Create 3 sparkles in random directions
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 80;
      const size = 5 + Math.random() * 10;
      const duration = 500 + Math.random() * 500;
      
      newSparkles.push({
        id: Date.now() + i,
        x: x,
        y: y,
        targetX: x + Math.cos(angle) * distance,
        targetY: y + Math.sin(angle) * distance,
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration
      });
    }
    
    setSparkles(newSparkles);
    
    // Clean up sparkles after animation completes
    setTimeout(() => {
      setSparkles([]);
    }, 1000);
  };
  
  // When rendering sparkles, use this approach:
  {sparkles.map(sparkle => (
    <Box
      key={sparkle.id}
      className="sparkle"
      sx={{
        width: `${sparkle.size}px`,
        height: `${sparkle.size}px`,
        backgroundColor: sparkle.color,
        boxShadow: `0 0 ${sparkle.size/2}px ${sparkle.color}`,
        '--x': `${sparkle.x}px`,
        '--y': `${sparkle.y}px`,
        '--targetX': `${sparkle.targetX}px`,
        '--targetY': `${sparkle.targetY}px`,
        '--duration': `${sparkle.duration}ms`,
      }}
    />
  ))}

  // --- Click Handler ---
  const handleCoinClick = async (event) => {
    if (!walletId) {
      addToast("Wallet not initialized yet.", "error");
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.right) / 2;
    const y = (rect.top + rect.bottom) / 2;

    setClickAnimation(true);
    createSparkles(x, y);
    setTimeout(() => setClickAnimation(false), 300);

    try {
      const response = await fetch(`${API_BASE_URL}/wallets/${walletId}/click`, { method: 'POST' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const newAuthBalance = parseInt(data.coin_balance, 10) || 0;
      setCoinBalance(newAuthBalance);
      setDisplayBalance(newAuthBalance);
    } catch (err) {
      console.error("Click error:", err);
      addToast(`Click failed: ${err.message}`, "error");
    }
  };

  // --- Purchase Upgrade Handler ---
  const handlePurchaseUpgrade = async (upgradeIdToBuy, cost) => {
    if (!walletId) {
      addToast("Wallet not initialized yet.", "error");
      return;
    }
    const currentDisplayBalance = Math.floor(displayBalance);
    if (currentDisplayBalance < cost) {
      addToast("Not enough coins!", "warning");
      return;
    }
    if (ownedUpgradeIds.includes(upgradeIdToBuy)) {
      addToast("Upgrade already owned!", "info");
      return;
    }

    setPurchaseLoading(upgradeIdToBuy);
    try {
      // Backend call remains the same (backend uses authoritative balance)
      const response = await fetch(`${API_BASE_URL}/wallets/${walletId}/upgrades`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upgradeId: upgradeIdToBuy }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Purchase failed: ${response.status}`);

      const newAuthBalance = parseInt(data.new_balance, 10) || 0;
      setCoinBalance(newAuthBalance);
      setDisplayBalance(newAuthBalance);
      setOwnedUpgradeIds([...ownedUpgradeIds, upgradeIdToBuy]);
      addToast("Upgrade purchased successfully!", "success");
    } catch (err) {
      console.error("Purchase error:", err);
      addToast(`Purchase failed: ${err.message}`, "error");
    } finally {
      setPurchaseLoading(null);
    }
  };

  // --- Cashout Handler ---
  const handleCashout = async () => {
    if (!walletId) {
      addToast("Wallet not initialized yet.", "error");
      return;
    }

    const currentDisplayBalance = Math.floor(displayBalance);
    if (currentDisplayBalance <= 0) {
      addToast("No coins to cash out!", "warning");
      return;
    }

    showConfirmation(
      "Cash Out Confirmation",
      `Are you sure you want to cash out ~${currentDisplayBalance} coins? The exact amount may vary slightly due to timing. Balance will reset to 0.`,
      async () => {
        try {
          closeConfirmation();
          // Backend call remains the same (uses authoritative balance)
          const response = await fetch(`${API_BASE_URL}/wallets/${walletId}/cashout`, { method: 'POST' });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || `Cashout failed: ${response.status}`);

          // Use the *actual* amount from the response if available, otherwise fallback
          const actualCashedOutAmount = data.coin_amount || currentDisplayBalance; // Prefer backend amount if returned, else use display
          setCashoutAmount(actualCashedOutAmount);

          setCoinBalance(0);
          setDisplayBalance(0);
          setShowCashoutAnimation(true);
          setTimeout(() => { addToast(data.message || 'Cashout successful!', 'success'); }, 2000);
        } catch (err) {
          console.error("Cashout error:", err);
          addToast(`Cashout failed: ${err.message}`, 'error');
        }
      }
    );
  };

  // --- Render Skeletons with Improved Styling ---
  const renderSkeletons = () => (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header Skeleton */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Skeleton 
          variant="text" 
          width={isMobile ? "80%" : "40%"}
          sx={{ 
            fontSize: isMobile ? '2rem' : '2.5rem', 
            margin: '0 auto', 
            borderRadius: 2,
            animation: 'pulse 1.5s ease-in-out 0.5s infinite'
          }} 
        />
        <Skeleton 
          variant="text" 
          width={isMobile ? "90%" : "60%"}
          sx={{ 
            margin: '15px auto', 
            borderRadius: 2, 
            minWidth: isMobile ? 150 : 200,
            animation: 'pulse 1.5s ease-in-out 0.6s infinite'
          }} 
        />
        
        {/* Coin Display Skeleton */}
        <Skeleton 
          variant="rounded" 
          width={isMobile ? 180 : 240} 
          height={isMobile ? 80 : 100} 
          sx={{ 
            margin: '30px auto', 
            borderRadius: 4,
            animation: 'pulse 1.5s ease-in-out 0.7s infinite'
          }} 
        />
        
        {/* Click Button Skeleton */}
        <Skeleton 
          variant="rounded" 
          width={isMobile ? 150 : 180} 
          height={isMobile ? 50 : 60} 
          sx={{ 
            margin: '25px auto', 
            borderRadius: 3,
            animation: 'pulse 1.5s ease-in-out 0.8s infinite'
          }} 
        />
      </Box>
  
      {/* Upgrades Skeleton */}
      <Box>
        <Skeleton 
          variant="text" 
          width={isMobile ? "50%" : "30%"}
          sx={{ 
            fontSize: isMobile ? '1.5rem' : '1.8rem', 
            mb: 3, 
            borderRadius: 2, 
            minWidth: 150,
            animation: 'pulse 1.5s ease-in-out 0.9s infinite'
          }} 
        />
        
        {/* Updated Grid for skeleton with same flex settings */}
        <Grid 
          container 
          spacing={isMobile ? 2 : 3}
          className="upgrades-grid"
          sx={{ 
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            overflow: { xs: 'visible', md: 'auto' },
            pb: 2
          }}
        >
          {[1, 2, 3].map((n) => (
            <Grid
              xs={12} 
              sm={6} 
              md={4} 
              key={n}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                minWidth: { xs: '100%', sm: '260px' }
              }}
            >
              <Paper
                elevation={4}
                sx={{
                  height: 280,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: 'rgba(35, 39, 47, 0.8)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease-in-out',
                  animation: `pulse 1.5s ease-in-out ${n * 0.1 + 1}s infinite`,
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
                  }
                }}
              >
                <Box sx={{ p: 2.5, flexGrow: 1 }}>
                  <Skeleton variant="text" sx={{ fontSize: '1.5rem', borderRadius: 2, width: '80%' }} />
                  <Skeleton variant="text" sx={{ borderRadius: 2, mt: 1.5 }}/>
                  <Skeleton variant="text" sx={{ borderRadius: 2, width: '90%' }}/>
                  <Skeleton variant="text" sx={{ borderRadius: 2, width: '60%', mt: 1 }}/>
                  <Skeleton variant="text" sx={{ borderRadius: 2, width: '50%', mt: 1.5 }}/>
                </Box>
                <Box sx={{ px: 2.5, pb: 2.5 }}>
                  <Skeleton 
                    variant="rounded" 
                    width="100%" 
                    height={50} 
                    sx={{ borderRadius: 3 }} 
                  />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );

  // --- Render Game Component ---
  const renderGame = () => {
    if (loading) {
      return renderSkeletons();
    }
    const currentDisplayBalance = Math.floor(displayBalance);
    return (
      <Container maxWidth="md" sx={{ 
        py: isMobile ? 2 : .5,
        height: '100%',
        position: 'relative', 
        zIndex: 1,
      }}>
        <Box sx={{ 
          position: 'absolute',
          top: isMobile ? 20 : 30,
          right: isMobile ? 20 : 30,
          zIndex: 2
        }}>
          <IconButton
            onClick={handleMenuOpen}
            aria-controls={menuOpen ? 'admin-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? 'true' : undefined}
            sx={{ 
              background: 'rgba(30, 34, 42, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(45, 50, 60, 0.9)',
                transform: 'translateY(-2px)',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
              }
            }}
          >
            <SettingsIcon 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                transition: 'transform 0.3s ease',
                transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }} 
            />
          </IconButton>
          <Menu
            id="admin-menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 4,
              sx: {
                borderRadius: 2,
                minWidth: 180,
                background: 'rgba(30, 34, 42, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                mt: 1,
                '& .MuiList-root': {
                  py: 1
                }
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleViewPayoutsClick} sx={{ py: 1.5 }}>
              <ListItemIcon>
                  <MonetizationOnIcon sx={{ color: '#ffc107' }} />
              </ListItemIcon>
              <ListItemText primary="Payout History" />
            </MenuItem>
            <MenuItem onClick={handleAdminClick} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <AdminPanelSettingsIcon sx={{ color: '#2196F3' }} />
              </ListItemIcon>
              <ListItemText primary="Admin Dashboard" />
            </MenuItem>
          </Menu>
        </Box>
        {/* Game Title */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 5,
          position: 'relative' 
        }}>
          <Typography 
            variant={isMobile ? "h4" : "h2"} 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              mb: 2,
              letterSpacing: '0.5px',
              textShadow: '0 5px 25px rgba(0, 0, 0, 0.1)',
              filter: 'drop-shadow(0 2px 5px rgba(254, 107, 139, 0.3))'
            }}
          >
            Clicker Game
          </Typography>

          {/* Wallet ID Display */}
          <ClickAwayListener onClickAway={handleTooltipClose}>
            <Tooltip
              PopperProps={{ disablePortal: true }}
              onClose={handleTooltipClose}
              open={copyTooltipOpen}
              disableFocusListener
              disableHoverListener
              disableTouchListener
              title="Copied!"
              placement="top"
              arrow
            >
              <Typography
                onClick={handleCopyWalletId}
                variant="caption"
                sx={{
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: 'rgba(35, 39, 47, 0.7)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 5,
                  padding: '8px 16px',
                  width: 'fit-content',
                  margin: '0 auto',
                  fontFamily: 'monospace',
                  letterSpacing: '0.5px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(45, 50, 60, 0.9)',
                    color: theme.palette.primary.light,
                    transform: 'translateY(-1px) scale(1.02)'
                  }
                }}
              >
                <AccountBalanceWalletIcon sx={{ mr: 1, fontSize: 'inherit' }} />
                Wallet ID: {walletId ? `${walletId.substring(0, 8)}...${walletId.substring(walletId.length - 4)}` : 'N/A'}
                <ContentCopyIcon sx={{ ml: 0.5, fontSize: '0.8em', verticalAlign: 'middle', opacity: 0.7 }} />
              </Typography>
            </Tooltip>
          </ClickAwayListener>

          {/* Coin Balance Display */}
          <Paper
            ref={coinBalanceRef}
            elevation={8}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? '15px 30px' : '20px 40px',
              borderRadius: 4,
              my: isMobile ? 3 : 4,
              minWidth: isMobile ? '180px' : '220px',
              background: 'linear-gradient(145deg, rgba(40, 44, 52, 0.9), rgba(30, 34, 42, 0.8))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)'
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
              }
            }}
          >
            <SavingsIcon 
              sx={{ 
                mr: 2, 
                fontSize: isMobile ? '2.5rem' : '3rem',
                color: '#FFD700',
                filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))'
              }} 
            />
            <Typography 
              ref={coinBalanceRef}
              variant={isMobile ? "h4" : "h3"}
              component="p"
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #FFD700, #FFC107)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 3px rgba(255, 215, 0, 0.3))',
                position: 'relative'
              }}
            >
              {currentDisplayBalance}
            </Typography>
          </Paper>
          {/* Click Button */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 2, sm: 3 }
          }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleCoinClick}
              sx={{
                py: isMobile ? 1.2 : 1.5,
                px: isMobile ? 3 : 4,
                borderRadius: 3,
                fontSize: isMobile ? '1rem' : '1.1rem',
                fontWeight: 600,
                background: clickAnimation 
                  ? 'linear-gradient(45deg, #FF512F, #F09819)' 
                  : 'linear-gradient(45deg, #FE6B8B, #FF8E53)',
                boxShadow: clickAnimation 
                  ? '0 5px 15px rgba(254, 107, 139, 0.4), inset 0 -2px 5px rgba(0, 0, 0, 0.2)' 
                  : '0 8px 25px rgba(254, 107, 139, 0.4)',
                transform: clickAnimation ? 'scale(0.95)' : 'scale(1)', 
                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FE6B8B, #FF8E53)',
                  boxShadow: '0 10px 30px rgba(254, 107, 139, 0.5)',
                  transform: 'translateY(-3px)'
                },
                '&:active': {
                  transform: 'scale(0.95)',
                  boxShadow: '0 5px 15px rgba(254, 107, 139, 0.4), inset 0 -2px 5px rgba(0, 0, 0, 0.2)'
                }
              }}
              startIcon={<MouseIcon />}
            >
              Click Me!
            </Button>
            {/* Cashout Button */}
            <Button
              variant="outlined"
              color="warning"
              size="large"
              onClick={handleCashout}
              disabled={currentDisplayBalance <= 0}
              sx={{
                py: { xs: 1.2, sm: 1.5 },
                px: { xs: 3, sm: 4 },
                borderRadius: 3,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                fontWeight: 600,
                borderColor: 'warning.main',
                '&:hover': {
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                  borderColor: 'warning.dark',
                },
                '&:disabled': {
                  borderColor: 'action.disabledBackground',
                }
              }}
            >
              Cash Out
            </Button>
          </Box>
        </Box>

        {/* Sparkles Animation */}
        {sparkles.map(sparkle => (
          <Box
            key={sparkle.id}
            sx={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              borderRadius: '50%',
              backgroundColor: sparkle.color,
              boxShadow: `0 0 ${sparkle.size/2}px ${sparkle.color}`,
              pointerEvents: 'none',
              zIndex: 9999,
              transform: `translate(${sparkle.x}px, ${sparkle.y}px) scale(0)`,
              animation: `sparkleAnimation-${sparkle.id} ${sparkle.duration}ms forwards`,
              '@keyframes': {
                [`sparkleAnimation-${sparkle.id}`]: {
                  '0%': {
                    transform: `translate(${sparkle.x}px, ${sparkle.y}px) scale(0)`,
                    opacity: 1
                  },
                  '100%': {
                    transform: `translate(${sparkle.targetX}px, ${sparkle.targetY}px) scale(1)`,
                    opacity: 0
                  }
                }
              }
            }}
          />
        ))}

        {/* Upgrades Section */}
        <Box sx={{ mt: isMobile ? 4 : 6 }}>
          <Box 
            sx={{ 
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              mb: 3,
              padding: isMobile ? '8px 16px' : '10px 20px',
              borderRadius: 4,
              background: 'rgba(30, 34, 42, 0.6)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(33, 150, 243, 0.2)',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, rgba(33, 150, 243, 0.7), transparent)',
              }
            }}
          >
            <AutoAwesomeIcon 
              sx={{ 
                mr: 1, 
                fontSize: isMobile ? '1.5rem' : '1.8rem',
                color: '#2196F3',
                filter: 'drop-shadow(0 0 8px rgba(33, 150, 243, 0.7))',
                animation: 'pulse 2s infinite'
              }} 
            />
            <Typography 
              variant={isMobile ? "h6" : "h5"}
              component="h2" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #00BCD4, #2196F3)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 5px rgba(33, 150, 243, 0.4))'
              }}
            >
              Upgrades
            </Typography>
            <UpgradeIcon 
              sx={{ 
                ml: 1, 
                fontSize: isMobile ? '1.5rem' : '1.8rem',
                color: '#2196F3',
                filter: 'drop-shadow(0 0 8px rgba(33, 150, 243, 0.7))',
                animation: 'pulse 2s infinite reverse'
              }} 
            />
          </Box>
          
          {availableUpgrades.length === 0 && !loading && (
            <Typography>No upgrades available.</Typography>
          )}
            <Grid 
              container 
              spacing={isMobile ? 2 : 3} 
              sx={{ 
                flexWrap: { xs: 'wrap', md: 'nowrap' },
                pb: 2,
                pt: 1,
                px: { xs: 0, md: 1 }
              }}
            >
              {availableUpgrades.map((upgrade) => {
                const isOwned = ownedUpgradeIds.includes(upgrade.upgrade_id);
                const canAfford = currentDisplayBalance >= upgrade.cost;
                const isLoadingPurchase = purchaseLoading === upgrade.upgrade_id;

                return (
                  <Grid 
                    xs={12} 
                    sm={6} 
                    md={4} 
                    key={upgrade.upgrade_id}
                    sx={{ 
                      width: { xs: '100%', sm: 'auto' },
                      minWidth: { xs: '100%', sm: '260px' }
                    }}
                  >
                    <Card 
                      elevation={6}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 4,
                        position: 'relative',
                        width: '100%',
                        background: isOwned 
                          ? 'linear-gradient(145deg, rgba(40, 167, 69, 0.05), rgba(25, 135, 84, 0.1))' 
                          : 'linear-gradient(145deg, rgba(40, 44, 52, 0.9), rgba(30, 34, 42, 0.8))',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid',
                        borderColor: isOwned ? 'rgba(40, 167, 69, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                        boxShadow: isOwned 
                          ? '0 10px 20px rgba(40, 167, 69, 0.15)' 
                          : '0 10px 20px rgba(0, 0, 0, 0.15)',
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        '&:hover': {
                          transform: isMobile ? 'translateY(-5px)' : 'translateY(-10px) scale(1.02)',
                          boxShadow: isOwned 
                            ? '0 15px 30px rgba(40, 167, 69, 0.25)' 
                            : '0 15px 30px rgba(0, 0, 0, 0.25)',
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '2px',
                          background: isOwned 
                            ? 'linear-gradient(90deg, transparent, rgba(40, 167, 69, 0.7), transparent)'
                            : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                        }
                      }}
                    >
                    <CardContent sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        gutterBottom
                        sx={{ 
                          fontWeight: 600,
                          fontSize: isMobile ? '1.1rem' : '1.25rem',
                          color: isOwned ? '#28a745' : 'inherit' 
                        }}
                      >
                        {upgrade.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          minHeight: '60px', 
                          mb: 2,
                          opacity: 0.9
                        }}
                      >
                        {upgrade.description}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          color: canAfford ? '#FFD700' : 'text.secondary',
                          opacity: canAfford ? 1 : 0.7
                        }}
                      >
                        <SavingsIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                        Cost: {upgrade.cost} Coins
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ p: isMobile ? 2 : 3, pt: 0 }}>
                      <Button
                        fullWidth
                        variant={isOwned ? "outlined" : "contained"}
                        onClick={() => handlePurchaseUpgrade(upgrade.upgrade_id, upgrade.cost)}
                        disabled={isOwned || !canAfford || isLoadingPurchase}
                        sx={{ 
                          textTransform: 'none', 
                          fontWeight: 600,
                          py: 1.2,
                          borderRadius: 2,
                          fontSize: isMobile ? '0.85rem' : '0.95rem',
                          background: isOwned 
                            ? 'transparent' 
                            : (canAfford 
                                ? 'linear-gradient(45deg, #2196F3, #00BCD4)' 
                                : 'rgba(90, 90, 90, 0.15)'),
                          color: isOwned ? '#28a745' : 'white',
                          border: isOwned ? '1px solid #28a745' : 'none',
                          boxShadow: isOwned || !canAfford 
                            ? 'none' 
                            : '0 5px 15px rgba(33, 150, 243, 0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: isOwned 
                              ? 'rgba(40, 167, 69, 0.1)' 
                              : (canAfford 
                                ? 'linear-gradient(45deg, #1976D2, #00ACC1)' 
                                : 'rgba(90, 90, 90, 0.15)'),
                            boxShadow: isOwned || !canAfford 
                              ? 'none' 
                              : '0 8px 20px rgba(33, 150, 243, 0.4)',
                            transform: 'translateY(-2px)'
                          },
                          '&:disabled': {
                            opacity: 0.7,
                            color: isOwned ? '#28a745' : 'rgba(255, 255, 255, 0.5)'
                          }
                        }}
                      >
                        {isLoadingPurchase ? <CircularProgress size={24} color="inherit"/> : (isOwned ? 'Owned ✓' : (canAfford ? 'Purchase Upgrade' : 'Not Enough Coins'))}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
        <ToastContainer 
          toasts={toasts} 
          removeToast={removeToast} 
        />
        
        {/* Styled confirmation dialog */}
        <StyledConfirmDialog
          open={confirmDialog.open}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={closeConfirmation}
        />
        
        {/* Cashout success animation */}
        {showCashoutAnimation && (
          <CashoutSuccessAnimation 
            amount={cashoutAmount}
            onComplete={() => setShowCashoutAnimation(false)}
          />
        )}
        
        {/* Enhanced coin sparkle */}
        {coinSparkle && (
          <EnhancedCoinSparkle
            key={coinSparkle.id}
            x={coinSparkle.x}
            y={coinSparkle.y}
            amount={coinSparkle.amount}
          />
        )}
        {/* Payout History Modal */}
        <Dialog 
          open={isPayoutsModalOpen} 
          onClose={() => setIsPayoutsModalOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: 'linear-gradient(145deg, rgba(40, 44, 52, 0.95), rgba(30, 34, 42, 0.9))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, rgba(255, 193, 7, 0.7), transparent)',
              }
            }
          }}
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 500 }}
        >
          <DialogTitle 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              py: 2,
              px: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <MonetizationOnIcon 
                sx={{ 
                  color: '#FFD700',
                  fontSize: '1.8rem',
                  filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))'
                }} 
              />
              <Typography 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #FFD700, #FFC107)',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  filter: 'drop-shadow(0 2px 3px rgba(255, 215, 0, 0.3))'
                }}
              >
                Your Payout History
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setIsPayoutsModalOpen(false)}
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: 'white',
                  transform: 'rotate(90deg)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent 
            sx={{ 
              p: 0, // Remove default padding
              '&:first-of-type': { 
                pt: 0 // Override MUI's default padding top
              }
            }}
          >
            {/* Loading state */}
            {loadingPayouts && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 6, flexDirection: 'column', gap: 2 }}>
                <CircularProgress 
                  size={40} 
                  sx={{ 
                    color: '#FFD700',
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    }
                  }} 
                />
                <Typography color="text.secondary" variant="body2">
                  Loading your payout history...
                </Typography>
              </Box>
            )}
            
            {/* Empty state */}
            {!loadingPayouts && userPayouts.length === 0 && (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  p: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'rgba(255, 193, 7, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <MonetizationOnIcon 
                    sx={{ 
                      fontSize: 40, 
                      color: '#FFD700',
                      opacity: 0.7
                    }} 
                  />
                </Box>
                <Typography variant="h6" color="text.primary">No payouts yet</Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                  When you cash out your coins, your payout requests will appear here.
                </Typography>
              </Box>
            )}
            
            {/* Payouts table */}
            {!loadingPayouts && userPayouts.length > 0 && (
              <TableContainer sx={{ maxHeight: 400, overflowY: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell 
                        sx={{ 
                          fontWeight: 700, 
                          background: 'linear-gradient(145deg, rgba(40, 44, 52, 0.9), rgba(30, 34, 42, 0.8))',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        Req ID
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          fontWeight: 700, 
                          background: 'linear-gradient(145deg, rgba(40, 44, 52, 0.9), rgba(30, 34, 42, 0.8))',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        Coins
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          fontWeight: 700, 
                          background: 'linear-gradient(145deg, rgba(40, 44, 52, 0.9), rgba(30, 34, 42, 0.8))',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        Value ($)
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 700, 
                          background: 'linear-gradient(145deg, rgba(40, 44, 52, 0.9), rgba(30, 34, 42, 0.8))',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 700, 
                          background: 'linear-gradient(145deg, rgba(40, 44, 52, 0.9), rgba(30, 34, 42, 0.8))',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        Requested
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 700, 
                          background: 'linear-gradient(145deg, rgba(40, 44, 52, 0.9), rgba(30, 34, 42, 0.8))',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        Processed
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userPayouts.map((payout) => (
                      <TableRow 
                        key={payout.request_id}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'rgba(255, 255, 255, 0.05)' 
                          },
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <TableCell sx={{ fontFamily: 'monospace', opacity: 0.9 }}>
                          {typeof payout.request_id === 'string' && payout.request_id.length > 8 
                            ? payout.request_id.substring(0, 8) + '...' 
                            : String(payout.request_id)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: '#FFD700' }}>
                          {payout.coin_amount}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          ${parseFloat(payout.dollar_value).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            let color, icon, bgColor;
                            
                            switch(payout.status) {
                              case 'Paid':
                                color = '#28a745';
                                bgColor = 'rgba(40, 167, 69, 0.1)';
                                icon = <CheckCircleIcon fontSize="small" />;
                                break;
                              case 'Cancelled':
                                color = '#dc3545';
                                bgColor = 'rgba(220, 53, 69, 0.1)';
                                icon = <CancelIcon fontSize="small" />;
                                break;
                              case 'Pending':
                              default:
                                color = '#ffc107';
                                bgColor = 'rgba(255, 193, 7, 0.1)';
                                icon = <PendingIcon fontSize="small" />;
                            }
                            
                            return (
                              <Chip
                                size="small"
                                label={payout.status}
                                icon={icon}
                                sx={{
                                  fontWeight: 'bold',
                                  color: color,
                                  backgroundColor: bgColor,
                                  border: `1px solid ${color}`,
                                  '& .MuiChip-icon': {
                                    color: color,
                                  }
                                }}
                              />
                            );
                          })()}
                        </TableCell>
                        <TableCell sx={{ opacity: 0.9 }}>
                          {new Date(payout.requested_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell sx={{ opacity: payout.processed_at ? 0.9 : 0.5 }}>
                          {payout.processed_at 
                            ? new Date(payout.processed_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) 
                            : 'Pending'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          
          <DialogActions 
            sx={{ 
              justifyContent: 'center', 
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              py: 2,
              px: 3
            }}
          >
            <Button 
              onClick={() => setIsPayoutsModalOpen(false)}
              variant="outlined"
              startIcon={<CloseIcon />}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setIsPayoutsModalOpen(false);
                handleCashout();
              }}
              variant="contained"
              startIcon={<MonetizationOnIcon />}
              disabled={currentDisplayBalance <= 0}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                boxShadow: '0 5px 15px rgba(255, 215, 0, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FFA500, #FF8C00)',
                  boxShadow: '0 7px 20px rgba(255, 215, 0, 0.4)',
                },
                '&:disabled': {
                  opacity: 0.5,
                  background: 'rgba(255, 215, 0, 0.3)',
                }
              }}
            >
              Cash Out Now
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }
  // --- Main App Return with Routes ---
  return (
    <Routes>
      <Route path="/" element={renderGame()} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}
export default App;