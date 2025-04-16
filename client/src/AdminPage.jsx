import {
    // React
    React, useState, useEffect, useNavigate,

    // MUI Core
    useTheme, Container, Typography, Button, Box,
    Paper, TextField, useMediaQuery, Skeleton, CircularProgress,

    // MUI Table
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip,

    // MUI Dialog
    IconButton, Alert, Fade, Modal, Backdrop,

    // MUI Form
    Select, MenuItem, FormControl, InputLabel,

    // MUI Icons
    ArrowBackIcon, AdminPanelSettingsIcon, FilterListIcon, SearchIcon,
    CheckCircleIcon, CancelIcon, PendingIcon, RefreshIcon, SecurityIcon,

    // API 
    API_BASE_URL
} from './commonImports';

function AdminPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(null);
    const [filterStatus, setFilterStatus] = useState('Pending');
    const [showRefreshAnimation, setShowRefreshAnimation] = useState(false);
    const [walletIdSearch, setWalletIdSearch] = useState('');
    const [authError, setAuthError] = useState('');

    // Function to fetch payouts
    const fetchPayouts = async (currentPassword, status, searchWalletId) => {
        if (!currentPassword) {
            setError('Admin password is required.');
            setPayouts([]);
            setIsAuthenticated(false);
            return;
        }
        setLoading(true);
        setError(null);

        setShowRefreshAnimation(true);

        const headers = { 'Authorization': `Bearer ${currentPassword}` };
        let url = `${API_BASE_URL}/admin/payouts?`;
        const params = new URLSearchParams();

        if (status && status !== 'All') {
            params.append('status', status);
        }
        if (searchWalletId) {
            params.append('walletId', searchWalletId.trim());
        }

        url += params.toString();

        try {
            const response = await fetch(url, { headers });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.error || `Failed to fetch: ${response.status}`); }
            setPayouts(data);
            console.log('Fetched payouts:', data);
        } catch (err) {
            console.error("Fetch payouts error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
            setTimeout(() => setShowRefreshAnimation(false), 500);
        }
    };

    const handleAdminLogin = (event) => {
        // Prevent default form submission if it's in a form
        event.preventDefault();
        setAuthError(''); // Clear previous auth errors
    
        // Compare entered password with environment variable
        // NOTE: INSECURE for production apps! Password check should be on backend.
        const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    
        if (!correctPassword) {
            console.error("VITE_ADMIN_PASSWORD environment variable not set!");
            setAuthError("Admin auth configuration error.");
            return;
        }
    
        if (password === correctPassword) {
            setIsAuthenticated(true);
            setError(null); // Clear general errors on successful auth
            // Fetch initial data immediately after successful login
            fetchPayouts(password, filterStatus, walletIdSearch); // Pass password, current filter, and search term
        } else {
            setIsAuthenticated(false);
            setAuthError('Incorrect password.');
        }
    };

    // Handler to initiate fetch
    const handleFetchClick = () => {
        if (!isAuthenticated) {
            setError("Please authenticate first.");
            return;
        }
        fetchPayouts(password, filterStatus, walletIdSearch);
    };

    // Handler to update status
    const handleUpdateStatus = async (requestId, newStatus) => {
        if (!password) {
            setError('Admin password is required.');
            return;
        }
        setUpdateLoading(requestId);
        setError(null);

        const headers = {
            'Authorization': `Bearer ${password}`,
            'Content-Type': 'application/json',
        };

        try {
            const response = await fetch(`${API_BASE_URL}/admin/payouts/${requestId}/status`, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify({ newStatus }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Update failed: ${response.status}`);
            }

            // Update the payout list locally
            setPayouts(prevPayouts =>
                prevPayouts.map(p =>
                    p.request_id === requestId ? { ...p, status: data.status, processed_at: data.processed_at } : p
                )
            );
            console.log('Update successful:', data);
        } catch (err) {
            console.error(`Update status error for ${requestId}:`, err);
            setError(err.message);
        } finally {
            setUpdateLoading(null);
        }
    };

    // Get status chip color and icon
    const getStatusChip = (status) => {
        let color, icon, bgColor;
        
        switch(status) {
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
                label={status}
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
    };

    return (
        <>
            <Modal
            open={!isAuthenticated}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                timeout: 500,
                sx: { backdropFilter: 'blur(8px)' }
                },
            }}
            disableEscapeKeyDown
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
            <Fade in={!isAuthenticated}>
                <Paper 
                elevation={10} 
                sx={{ 
                    p: 0, 
                    borderRadius: 3, 
                    maxWidth: '400px', 
                    width: '90%', 
                    outline: 'none',
                    background: 'linear-gradient(145deg, rgba(40, 44, 52, 0.95), rgba(30, 34, 42, 0.9))',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(33, 150, 243, 0.2)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                    overflow: 'hidden',
                    position: 'relative',
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
                    borderTop: '2px solid rgba(33, 150, 243, 0.5)',
                    borderLeft: '2px solid rgba(33, 150, 243, 0.5)'
                    }}
                />
                <Box
                    sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '20px',
                    height: '20px',
                    borderTop: '2px solid rgba(33, 150, 243, 0.5)',
                    borderRight: '2px solid rgba(33, 150, 243, 0.5)'
                    }}
                />
                <Box
                    sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '20px',
                    height: '20px',
                    borderBottom: '2px solid rgba(33, 150, 243, 0.5)',
                    borderLeft: '2px solid rgba(33, 150, 243, 0.5)'
                    }}
                />
                <Box
                    sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '20px',
                    height: '20px',
                    borderBottom: '2px solid rgba(33, 150, 243, 0.5)',
                    borderRight: '2px solid rgba(33, 150, 243, 0.5)'
                    }}
                />
                
                {/* Header */}
                <Box
                    sx={{
                    p: 3,
                    textAlign: 'center',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative',
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
                    <AdminPanelSettingsIcon 
                    sx={{ 
                        fontSize: 60, 
                        mb: 1.5,
                        color: '#2196F3',
                        filter: 'drop-shadow(0 0 8px rgba(33, 150, 243, 0.7))',
                        animation: 'pulse 2s infinite'
                    }} 
                    />
                    <Typography 
                    variant="h5" 
                    component="h2" 
                    sx={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, #00BCD4, #2196F3)',
                        backgroundClip: 'text',
                        textFillColor: 'transparent',
                        filter: 'drop-shadow(0 2px 5px rgba(33, 150, 243, 0.4))'
                    }}
                    >
                    Secure Admin Access
                    </Typography>
                </Box>
                
                {/* Form */}
                <Box 
                    component="form" 
                    onSubmit={handleAdminLogin} 
                    noValidate 
                    sx={{ 
                    mt: 0,
                    p: 3,
                    pt: 2
                    }}
                >
                    <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 2, textAlign: 'center' }}
                    >
                    Enter your administrator password to access the management dashboard.
                    </Typography>
                    
                    <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Admin Password"
                    type="password"
                    id="admin-password"
                    autoComplete="current-password"
                    autoFocus
                    value={password}
                    onChange={(e) => { 
                        setPassword(e.target.value); 
                        setAuthError(''); 
                    }}
                    error={!!authError}
                    helperText={authError || ''}
                    sx={{ 
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(33, 150, 243, 0.5)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#2196F3',
                            borderWidth: 2,
                        }
                        }
                    }}
                    InputProps={{
                        startAdornment: <SecurityIcon color="primary" sx={{ mr: 1, opacity: 0.7 }} />,
                        sx: { 
                        py: 0.5,
                        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)'
                        }
                    }}
                    />
                    
                    <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ 
                        mt: 1, 
                        mb: 2,
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #2196F3, #00BCD4)',
                        boxShadow: '0 5px 15px rgba(33, 150, 243, 0.3)',
                        '&:hover': {
                        background: 'linear-gradient(45deg, #1976D2, #00ACC1)',
                        boxShadow: '0 8px 20px rgba(33, 150, 243, 0.4)',
                        }
                    }}
                    startIcon={<AdminPanelSettingsIcon />}
                    >
                    Access Admin Panel
                    </Button>
                    
                    <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                        display: 'block', 
                        textAlign: 'center',
                        opacity: 0.7 
                    }}
                    >
                    Only authorized personnel should access this area
                    </Typography>
                </Box>
                </Paper>
            </Fade>
            </Modal>
            {isAuthenticated && (
                <Fade in={isAuthenticated}>
                    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
                        {/* Admin Header with Glow Effect */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 4,
                                flexWrap: 'wrap',
                                gap: 2,
                                position: 'relative',
                            }}
                        >
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    background: 'rgba(30, 34, 42, 0.8)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 3,
                                    padding: '10px 20px',
                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                                    border: '1px solid rgba(33, 150, 243, 0.2)',
                                    position: 'relative',
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
                                <AdminPanelSettingsIcon 
                                    sx={{ 
                                        fontSize: { xs: '2rem', sm: '2.5rem' },
                                        color: '#2196F3',
                                        mr: 2,
                                        filter: 'drop-shadow(0 0 8px rgba(33, 150, 243, 0.7))',
                                    }} 
                                />
                                <Typography 
                                    variant={isMobile ? "h5" : "h4"} 
                                    component="h1" 
                                    sx={{ 
                                        fontWeight: 700,
                                        background: 'linear-gradient(45deg, #00BCD4, #2196F3)',
                                        backgroundClip: 'text',
                                        textFillColor: 'transparent',
                                        filter: 'drop-shadow(0 2px 5px rgba(33, 150, 243, 0.4))'
                                    }}
                                >
                                    Admin Dashboard
                                </Typography>
                            </Box>
                            
                            <Button
                                variant="outlined"
                                color="inherit"
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate('/')}
                                sx={{
                                    borderRadius: 2,
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': {
                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                                    }
                                }}
                            >
                                Back to Game
                            </Button>
                        </Box>

                        {/* Auth and Controls with Glossy Effect */}
                        <Paper 
                            elevation={4}
                            sx={{ 
                                p: 3, 
                                mb: 4, 
                                borderRadius: 3,
                                background: 'linear-gradient(145deg, rgba(40, 44, 52, 0.9), rgba(30, 34, 42, 0.8))',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                                position: 'relative',
                                overflow: 'hidden',
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
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    mb: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                <SecurityIcon color="primary" /> Authentication
                            </Typography>
                            
                            <Box sx={{ 
                                display: 'flex', 
                                gap: 2, 
                                alignItems: 'flex-start', 
                                flexWrap: 'wrap',
                                flexDirection: { xs: 'column', sm: 'row' }
                            }}>
                                <TextField
                                    label="Search by Wallet ID"
                                    type="search"
                                    value={walletIdSearch}
                                    onChange={(e) => setWalletIdSearch(e.target.value)}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        startAdornment: <SearchIcon sx={{ mr: 1, opacity: 0.7 }} />,
                                        sx: { 
                                            borderRadius: 2,
                                            backdropFilter: 'blur(10px)',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            '&:hover': {
                                                background: 'rgba(255, 255, 255, 0.1)'
                                            }
                                        }
                                    }}
                                    sx={{ 
                                        flexGrow: 1, 
                                        minWidth: { xs: '100%', sm: '200px' }
                                    }}
                                />
                                
                                <FormControl 
                                    size="small" 
                                    sx={{ 
                                        minWidth: { xs: '100%', sm: 150 }
                                    }}
                                >
                                    <InputLabel id="status-filter-label">Status Filter</InputLabel>
                                    <Select
                                        labelId="status-filter-label"
                                        label="Status Filter"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        startAdornment={<FilterListIcon sx={{ mr: 1, opacity: 0.7 }} />}
                                        sx={{ 
                                            borderRadius: 2,
                                            backdropFilter: 'blur(10px)',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            '&:hover': {
                                                background: 'rgba(255, 255, 255, 0.1)'
                                            }
                                        }}
                                    >
                                        <MenuItem value="All">All Statuses</MenuItem>
                                        <MenuItem value="Pending">
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <PendingIcon sx={{ mr: 1, color: '#ffc107' }} /> Pending
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="Paid">
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <CheckCircleIcon sx={{ mr: 1, color: '#28a745' }} /> Paid
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="Cancelled">
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <CancelIcon sx={{ mr: 1, color: '#dc3545' }} /> Cancelled
                                            </Box>
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                                
                                <Button
                                    variant="contained"
                                    onClick={handleFetchClick}
                                    disabled={!password || loading}
                                    sx={{ 
                                        py: 1,
                                        px: 3,
                                        borderRadius: 2,
                                        background: 'linear-gradient(45deg, #2196F3, #00BCD4)',
                                        boxShadow: '0 5px 15px rgba(33, 150, 243, 0.3)',
                                        minWidth: { xs: '100%', sm: '180px' },
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #1976D2, #00ACC1)',
                                            boxShadow: '0 8px 20px rgba(33, 150, 243, 0.4)',
                                        }
                                    }}
                                    startIcon={showRefreshAnimation ? 
                                        <RefreshIcon sx={{ animation: 'spin 1s infinite linear' }} /> : 
                                        <RefreshIcon />
                                    }
                                >
                                    {loading ? 'Loading...' : 'Fetch Payouts'}
                                </Button>
                            </Box>
                        </Paper>

                        {/* Error Display with Animation */}
                        <Fade in={!!error}>
                            <Box sx={{ mb: 3 }}>
                                {error && (
                                    <Alert 
                                        severity="error" 
                                        sx={{ 
                                            borderRadius: 2,
                                            backdropFilter: 'blur(10px)',
                                            animation: 'fadeInEffect 0.5s forwards'
                                        }}
                                    >
                                        {error}
                                    </Alert>
                                )}
                            </Box>
                        </Fade>

                        {/* Payouts Table with Fancy Styling */}
                        <TableContainer 
                            component={Paper}
                            sx={{
                                borderRadius: 3,
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                                background: 'linear-gradient(145deg, rgba(40, 44, 52, 0.9), rgba(30, 34, 42, 0.8))',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '1px',
                                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                                }
                            }}
                        >
                            <Box 
                                sx={{ 
                                    p: 2, 
                                    pl: 3, 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                }}
                            >
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                >
                                    Payout Requests
                                    {!loading && payouts.length > 0 && (
                                        <Chip 
                                            label={payouts.length} 
                                            size="small" 
                                            color="primary" 
                                            sx={{ ml: 1 }} 
                                        />
                                    )}
                                </Typography>
                            </Box>
                            
                            <Table sx={{ minWidth: 650 }} aria-label="payouts table">
                                <TableHead>
                                    <TableRow sx={{ '& th': { fontWeight: 700 } }}>
                                        <TableCell>Request ID</TableCell>
                                        <TableCell>Wallet ID</TableCell>
                                        <TableCell align="right">Coins</TableCell>
                                        <TableCell align="right">Value ($)</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Requested At</TableCell>
                                        <TableCell>Processed At</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading && !payouts.length && (
                                        [...Array(3)].map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <Skeleton variant="text" width="80%" sx={{ borderRadius: 1 }}/>
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton variant="text" width="70%" sx={{ borderRadius: 1 }}/>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Skeleton variant="text" width="50%" sx={{ borderRadius: 1, ml: 'auto' }}/>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Skeleton variant="text" width="60%" sx={{ borderRadius: 1, ml: 'auto' }}/>
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton variant="rounded" width="80px" height="24px" sx={{ borderRadius: 10 }}/>
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton variant="text" width="90%" sx={{ borderRadius: 1 }}/>
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton variant="text" width="80%" sx={{ borderRadius: 1 }}/>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Skeleton variant="rounded" width="80px" height="32px" sx={{ borderRadius: 2, mx: 'auto' }}/>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                    {!loading && !payouts.length && isAuthenticated && (
                                        <TableRow>
                                            <TableCell colSpan={8} sx={{ textAlign: 'center', py: 5 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                                    <FilterListIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                                                    <Typography color="textSecondary">
                                                        No payout requests found for the selected filter.
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {!loading && !payouts.length && !isAuthenticated && password && (
                                        <TableRow>
                                            <TableCell colSpan={8} sx={{ textAlign: 'center', py: 5 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                                    <SearchIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                                                    <Typography color="textSecondary">
                                                        Click "Fetch Payouts" to load data.
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {payouts.map((row) => (
                                        <TableRow
                                            key={row.request_id}
                                            sx={{ 
                                                '&:hover': { 
                                                    backgroundColor: 'rgba(255, 255, 255, 0.05)' 
                                                },
                                                transition: 'background-color 0.2s ease'
                                            }}
                                        >
                                            <TableCell component="th" scope="row" sx={{ fontFamily: 'monospace', opacity: 0.9 }}>
                                                {row.request_id}
                                            </TableCell>
                                            <TableCell title={row.wallet_id} sx={{ fontFamily: 'monospace', opacity: 0.9 }}>
                                                {row.wallet_id.substring(0, 8)}...
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, color: '#FFD700' }}>
                                                {row.coin_amount}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                ${parseFloat(row.dollar_value).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusChip(row.status)}
                                            </TableCell>
                                            <TableCell sx={{ opacity: 0.9 }}>
                                                {new Date(row.requested_at).toLocaleString()}
                                            </TableCell>
                                            <TableCell sx={{ opacity: row.processed_at ? 0.9 : 0.5 }}>
                                                {row.processed_at ? new Date(row.processed_at).toLocaleString() : 'N/A'}
                                            </TableCell>
                                            <TableCell align="center">
                                                {row.status === 'Pending' && (
                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            color="success"
                                                            onClick={() => handleUpdateStatus(row.request_id, 'Paid')}
                                                            disabled={updateLoading === row.request_id}
                                                            sx={{
                                                                borderRadius: 2,
                                                                py: 0.5,
                                                                minWidth: '80px',
                                                                background: 'linear-gradient(45deg, rgba(40, 167, 69, 0.8), rgba(25, 135, 84, 0.9))',
                                                                boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
                                                                '&:hover': {
                                                                    background: 'linear-gradient(45deg, rgba(25, 135, 84, 0.9), rgba(40, 167, 69, 0.8))',
                                                                    boxShadow: '0 6px 15px rgba(40, 167, 69, 0.4)',
                                                                }
                                                            }}
                                                        >
                                                            {updateLoading === row.request_id ? (
                                                                <CircularProgress size={16} color="inherit"/>
                                                            ) : (
                                                                <>
                                                                    <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                                                                    Paid
                                                                </>
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleUpdateStatus(row.request_id, 'Cancelled')}
                                                            disabled={updateLoading === row.request_id}
                                                            sx={{
                                                                borderRadius: 2,
                                                                py: 0.5,
                                                                minWidth: '80px',
                                                                borderColor: 'rgba(220, 53, 69, 0.5)',
                                                                color: '#dc3545',
                                                                '&:hover': {
                                                                    borderColor: '#dc3545',
                                                                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                                                }
                                                            }}
                                                        >
                                                            {updateLoading === row.request_id ? (
                                                                <CircularProgress size={16} color="inherit"/>
                                                            ) : (
                                                                <>
                                                                    <CancelIcon fontSize="small" sx={{ mr: 0.5 }} />
                                                                    Cancel
                                                                </>
                                                            )}
                                                        </Button>
                                                    </Box>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Container>
                </Fade>
            )}
        </>
    );
}

export default AdminPage;