// Import necessary modules
require('dotenv').config(); // Load environment variables from .env file
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // PostgreSQL client

// --- Basic Configuration ---
const app = express();
const PORT = process.env.PORT || 5001; // Use port from env file or default to 5001

// --- Database Connection ---
// Ensure you have DATABASE_URL in your .env file
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: { rejectUnauthorized: false } // Uncomment or adjust if needed for deployed DBs
});

// --- Basic Auth Middleware (DEMO ONLY) ---
const basicAdminAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const expectedPassword = process.env.ADMIN_PASSWORD;
    console.log("Backend Expected ADMIN_PASSWORD:", expectedPassword);

    // Very basic check - replace with real auth later
    if (!expectedPassword || !authHeader || authHeader !== `Bearer ${expectedPassword}`) {
        console.warn('⚠️ Unauthorized admin access attempt');
        // Use 403 Forbidden as it's slightly more appropriate than 401 for failed password
        return res.status(403).json({ error: 'Forbidden: Invalid admin credentials' });
    }
    // If password matches, proceed to the next handler
    next();
};

const calculateAndApplyPassiveIncome = async (dbClient, walletId) => {
    // 1. Get owned passive upgrades and last update time for the wallet
    const passiveUpgradeQuery = `
        SELECT u.effect_type, u.effect_value
        FROM wallet_upgrades wu
        JOIN upgrades u ON wu.upgrade_id = u.upgrade_id
        WHERE wu.wallet_id = $1 AND u.effect_type LIKE 'PASSIVE%'; -- Filter for passive upgrades
    `;
    const walletInfoQuery = `
        SELECT coin_balance, last_passive_update
        FROM wallets
        WHERE wallet_id = $1
        FOR UPDATE; -- Lock the wallet row for the duration of the calculation/update
    `; // Make sure to lock the row!

    const [passiveUpgradesResult, walletInfoResult] = await Promise.all([
        dbClient.query(passiveUpgradeQuery, [walletId]),
        dbClient.query(walletInfoQuery, [walletId])
    ]);

    if (walletInfoResult.rows.length === 0) {
        throw new Error('Wallet not found during passive calculation');
    }

    const ownedPassiveUpgrades = passiveUpgradesResult.rows;
    const currentBalance = parseInt(walletInfoResult.rows[0].coin_balance, 10);
    const lastUpdate = new Date(walletInfoResult.rows[0].last_passive_update);
    const now = new Date();

    // 2. Calculate total passive rate per second
    let totalPassiveRatePerSecond = 0;
    ownedPassiveUpgrades.forEach(upg => {
        // Add logic here if you have different types of passive upgrades
        if (upg.effect_type === 'PASSIVE_RATE_PER_SECOND') {
            totalPassiveRatePerSecond += parseFloat(upg.effect_value);
        }
        // Add more else if blocks for other passive types if needed
    });

    // 3. Calculate time difference and earnings
    const timeDiffSeconds = Math.max(0, (now.getTime() - lastUpdate.getTime()) / 1000); // Time diff in seconds
    const passiveEarnings = Math.floor(timeDiffSeconds * totalPassiveRatePerSecond); // Use floor to avoid fractions of coins

    let finalBalance = currentBalance;

    // 4. Apply earnings and update timestamp if necessary
    if (passiveEarnings > 0) {
        finalBalance = currentBalance + passiveEarnings;
        const updateWalletQuery = `
            UPDATE wallets
            SET coin_balance = $1, last_passive_update = NOW()
            WHERE wallet_id = $2
            RETURNING coin_balance; -- Return the actual updated balance
        `;
        const updateResult = await dbClient.query(updateWalletQuery, [finalBalance, walletId]);
        finalBalance = parseInt(updateResult.rows[0].coin_balance, 10); // Get the definite balance after update
         console.log(`✅ Applied ${passiveEarnings} passive coins to wallet ${walletId}. New Balance: ${finalBalance}`);
    } else {
         // If no earnings, still update the timestamp to prevent re-calculating tiny intervals
         const touchTimestampQuery = `
             UPDATE wallets SET last_passive_update = NOW() WHERE wallet_id = $1;
         `;
          await dbClient.query(touchTimestampQuery, [walletId]);
         // console.log(`✅ Touched timestamp for wallet ${walletId}. Balance: ${finalBalance}`); // Optional log
    }

    return finalBalance; // Return the potentially updated balance
};

// Test DB connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('🔴 Error acquiring database client', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release(); // Release the client back to the pool
        if (err) {
            return console.error('🔴 Error executing query', err.stack);
        }
        console.log('✅ Database connected successfully at:', result.rows[0].now);
    });
});


// --- Middleware ---
// Configure CORS for production
const allowedOrigins = [
    'https://clicker-game-app.onrender.com',
    'http://localhost:5173',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests) or from allowed list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200 // some legacy browsers choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());

// --- Basic Routes ---
app.get('/', (req, res) => {
    res.send('Clicker Game Wallet API is running!');
});

// --- API Routes ---
// POST /api/wallets - Create a new wallet
app.post('/api/wallets', async (req, res) => {
    const newWalletId = uuidv4(); // Generate a unique v4 UUID
    const insertQuery = `
        INSERT INTO wallets (wallet_id, coin_balance, created_at)
        VALUES ($1, 0, NOW())
        RETURNING wallet_id, created_at;
    `;
    // Note: We insert balance 0 and creation time directly.
    // RETURNING allows us to get back the inserted values.

    try {
        const result = await pool.query(insertQuery, [newWalletId]);
        const createdWallet = result.rows[0];

        console.log(`✅ Wallet created: ${createdWallet.wallet_id} at ${createdWallet.created_at}`);
        // Send back the newly created wallet ID
        res.status(201).json({ wallet_id: createdWallet.wallet_id });

    } catch (err) {
        console.error('🔴 Error creating wallet:', err.stack);
        // Check for specific errors if needed, e.g., duplicate key (though UUIDs make this highly unlikely)
        res.status(500).json({ error: 'Failed to create wallet' });
    }
});

// GET /api/wallets/:walletId - Get wallet details (balance)
app.get('/api/wallets/:walletId', async (req, res) => {
    const { walletId } = req.params;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(walletId)) {
        return res.status(400).json({ error: 'Invalid Wallet ID format' });
    }

    // Use a client for potential update
    const client = await pool.connect();
    try {
         // Calculate passive income FIRST
         const currentBalance = await calculateAndApplyPassiveIncome(client, walletId);

         // Now the balance in the DB is up-to-date
         console.log(`✅ Fetched wallet ${walletId} after passive update. Balance: ${currentBalance}`);
         res.status(200).json({
             wallet_id: walletId,
             coin_balance: currentBalance // Return the updated balance
         });

    } catch (err) {
        console.error(`🔴 Error fetching wallet ${walletId} (with passive calc):`, err.message); // More specific log
        // Handle 'Wallet not found' error from helper function if needed
        if (err.message.includes('Wallet not found')) {
             res.status(404).json({ error: 'Wallet not found' });
        } else {
            res.status(500).json({ error: 'Failed to fetch wallet data' });
        }
    } finally {
        client.release(); // Always release the client
    }
});

// POST /api/wallets/:walletId/click - Increment coin balance
app.post('/api/wallets/:walletId/click', async (req, res) => {
    const { walletId } = req.params;
    // --- Assume clickValue is based on upgrades - needs fetching ---
    // TODO: Fetch CLICK_MULTIPLIER upgrades and determine clickValue

    let clickValue = 1; // Default if no upgrades

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(walletId)) {
        return res.status(400).json({ error: 'Invalid Wallet ID format' });
    }

    const client = await pool.connect();
    try {
         await client.query('BEGIN');

         // 1. Apply passive income
         let balanceAfterPassive = await calculateAndApplyPassiveIncome(client, walletId);

         // --- TODO: Fetch Click Upgrades & Calculate Real Click Value ---
         const clickUpgradeQuery = `
            SELECT u.effect_value FROM wallet_upgrades wu
            JOIN upgrades u ON wu.upgrade_id = u.upgrade_id
            WHERE wu.wallet_id = $1 AND u.effect_type = 'CLICK_MULTIPLIER'
            ORDER BY u.effect_value DESC LIMIT 1; -- Get the BEST click multiplier owned
         `;
         const clickUpgradeResult = await client.query(clickUpgradeQuery, [walletId]);
         if (clickUpgradeResult.rows.length > 0) {
             clickValue = parseInt(clickUpgradeResult.rows[0].effect_value, 10); // Use the best multiplier
         }
         // --- End TODO ---

         // 2. Apply click value to the balance updated by passive income
         const finalBalance = balanceAfterPassive + clickValue;

         const updateQuery = `
             UPDATE wallets SET coin_balance = $1
             WHERE wallet_id = $2
             RETURNING coin_balance; -- No need to return wallet_id again
         `;
         const result = await client.query(updateQuery, [finalBalance, walletId]);

         await client.query('COMMIT'); // Commit transaction

         const updatedBalance = parseInt(result.rows[0].coin_balance, 10);
         console.log(`✅ Click registered for wallet: ${walletId} (+${clickValue}). New Balance: ${updatedBalance}`);
         res.status(200).json({
             wallet_id: walletId, // Still useful to return wallet_id
             coin_balance: updatedBalance
         });

    } catch (err) {
         await client.query('ROLLBACK'); // Rollback on error
         console.error(`🔴 Error processing click for wallet ${walletId}:`, err.message);
         if (err.message.includes('Wallet not found')) {
             res.status(404).json({ error: 'Wallet not found' });
         } else {
            res.status(500).json({ error: 'Failed to process click' });
         }
    } finally {
        client.release();
    }
});

// GET /api/upgrades - List all available upgrades
app.get('/api/upgrades', async (req, res) => {
    const selectQuery = `
        SELECT upgrade_id, name, description, cost, effect_type, effect_value
        FROM upgrades
        ORDER BY cost ASC; -- Show cheaper upgrades first
    `;
    try {
        const result = await pool.query(selectQuery);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('🔴 Error fetching upgrades:', err.stack);
        res.status(500).json({ error: 'Failed to fetch upgrades' });
    }
});

app.post('/api/wallets/:walletId/upgrades', async (req, res) => {
    const { walletId } = req.params;
    const { upgradeId } = req.body;

    if (!upgradeId || typeof upgradeId !== 'number') {
        return res.status(400).json({ error: 'Invalid or missing upgradeId' });
    }
    // Add UUID validation for walletId here

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await calculateAndApplyPassiveIncome(client, walletId);

        // 1. Get upgrade details (cost)
        const upgradeQuery = 'SELECT cost FROM upgrades WHERE upgrade_id = $1;';
        const upgradeResult = await client.query(upgradeQuery, [upgradeId]);
        if (upgradeResult.rows.length === 0) throw new Error('Upgrade not found');
        const upgradeCost = parseInt(upgradeResult.rows[0].cost, 10);

        // 2. Check if already owned
        const ownershipQuery = 'SELECT 1 FROM wallet_upgrades WHERE wallet_id = $1 AND upgrade_id = $2;';
        const ownershipResult = await client.query(ownershipQuery, [walletId, upgradeId]);
        if (ownershipResult.rows.length > 0) throw new Error('Upgrade already owned');

        // 3. Get current balance and lock wallet row
        const walletQuery = 'SELECT coin_balance FROM wallets WHERE wallet_id = $1 FOR UPDATE;';
        const walletResult = await client.query(walletQuery, [walletId]);
        if (walletResult.rows.length === 0) throw new Error('Wallet not found');
        const currentBalance = parseInt(walletResult.rows[0].coin_balance, 10);

        // 4. Check if affordable
        if (currentBalance < upgradeCost) throw new Error('Insufficient funds');

        // 5. Deduct cost
        const newBalance = currentBalance - upgradeCost;
        const updateWalletQuery = 'UPDATE wallets SET coin_balance = $1 WHERE wallet_id = $2;';
        await client.query(updateWalletQuery, [newBalance, walletId]);

        // 6. Record the purchase
        const insertPurchaseQuery = 'INSERT INTO wallet_upgrades (wallet_id, upgrade_id) VALUES ($1, $2);';
        await client.query(insertPurchaseQuery, [walletId, upgradeId]);

        await client.query('COMMIT');
        console.log(`✅ [v2] Wallet ${walletId} purchased upgrade ${upgradeId}. New balance: ${newBalance}`);
        res.status(200).json({ message: 'Upgrade purchased successfully!', new_balance: newBalance });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`🔴 [v2] Error purchasing upgrade ${upgradeId} for wallet ${walletId}:`, err.message);

        if (err.message === 'Insufficient funds' || err.message === 'Upgrade already owned') {
            res.status(400).json({ error: err.message }); // 400 Bad Request for business logic errors
        } else if (err.message === 'Upgrade not found' || err.message === 'Wallet not found') {
             res.status(404).json({ error: err.message });
         } else {
            res.status(500).json({ error: 'Failed to purchase upgrade' });
         }
    } finally {
        client.release();
    }
});

// GET /api/wallets/:walletId/upgrades - Get IDs of upgrades owned by a wallet
app.get('/api/wallets/:walletId/upgrades', async (req, res) => {
    const { walletId } = req.params;

    // Basic validation for UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(walletId)) {
        return res.status(400).json({ error: 'Invalid Wallet ID format' });
    }

    const selectQuery = `
        SELECT upgrade_id FROM wallet_upgrades WHERE wallet_id = $1;
    `;

    try {
        // Check if wallet exists first (optional, but good practice)
        const walletCheck = await pool.query('SELECT 1 FROM wallets WHERE wallet_id = $1', [walletId]);
        if (walletCheck.rows.length === 0) {
             return res.status(404).json({ error: 'Wallet not found' });
        }

        const result = await pool.query(selectQuery, [walletId]);
        // Return an array of upgrade IDs owned by the user
        const ownedIds = result.rows.map(row => row.upgrade_id);
        console.log(`✅ Fetched owned upgrades for ${walletId}:`, ownedIds);
        res.status(200).json(ownedIds); // e.g., [1, 3]

    } catch (err) {
        console.error(`🔴 Error fetching owned upgrades for wallet ${walletId}:`, err.stack);
        res.status(500).json({ error: 'Failed to fetch owned upgrades' });
    }
});

// POST /api/wallets/:walletId/cashout - Request a payout
app.post('/api/wallets/:walletId/cashout', async (req, res) => {
    const { walletId } = req.params;
    // Maybe get amount from body later? For now, cash out ALL coins.
    // const { amountToCashout } = req.body;

    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(walletId)) {
        return res.status(400).json({ error: 'Invalid Wallet ID format' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Apply any pending passive income
        const currentBalance = await calculateAndApplyPassiveIncome(client, walletId);

        // 2. Check if balance is positive
        if (currentBalance <= 0) {
            throw new Error('No coins to cash out');
        }

        // 3. Determine cashout amount (all coins for now)
        const coinsToCashout = currentBalance;
        const dollarValue = coinsToCashout; // Assuming 1 Coin = $1 USD

        // 4. Deduct coins (set balance to 0)
        const updateWalletQuery = 'UPDATE wallets SET coin_balance = 0 WHERE wallet_id = $1;';
        await client.query(updateWalletQuery, [walletId]);

        // 5. Log the payout request
        const insertLogQuery = `
            INSERT INTO payout_requests (wallet_id, coin_amount, dollar_value, status, requested_at)
            VALUES ($1, $2, $3, 'Pending', NOW())
            RETURNING request_id;
        `;
        const logResult = await client.query(insertLogQuery, [walletId, coinsToCashout, dollarValue]);

        await client.query('COMMIT');

        const requestId = logResult.rows[0].request_id;
        console.log(`✅ Cashout requested: ID ${requestId}, Wallet ${walletId}, Coins ${coinsToCashout}, Value $${dollarValue}`);
        res.status(200).json({
            message: `Cashout request for ${coinsToCashout} coins ($${dollarValue}) submitted successfully.`,
            request_id: requestId,
            new_balance: 0
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`🔴 Error processing cashout for wallet ${walletId}:`, err.message);
        if (err.message === 'Wallet not found' || err.message === 'No coins to cash out') {
            res.status(400).json({ error: err.message }); // Use 400 for these business logic errors
        } else {
            res.status(500).json({ error: 'Failed to process cashout request' });
        }
    } finally {
        client.release();
    }
});

// --- Admin Routes ---
// GET /api/admin/payouts - Fetch payout requests
app.get('/api/admin/payouts', basicAdminAuth, async (req, res) => {
    const { status, walletId } = req.query;
    let paramIndex = 1;
    const queryParams = [];
    let whereClauses = [];

    let selectQuery = `
        SELECT request_id, wallet_id, coin_amount, dollar_value, status, requested_at, processed_at
        FROM payout_requests
    `;

    // Add status filter if provided
    if (status && status !== 'All') {
        whereClauses.push(`status = $${paramIndex++}`);
        queryParams.push(status);
    }

    // Add walletId filter if provided (exact match)
    if (walletId) {
        // Basic UUID format validation on backend too is good practice
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(walletId)) {
             whereClauses.push(`wallet_id = $${paramIndex++}`);
             queryParams.push(walletId);
        } else {
            // Handle invalid UUID format if needed, maybe return empty or bad request
            console.warn(`Invalid walletId format received in admin search: ${walletId}`);
            // Optionally return empty result if format is wrong:
            // return res.status(200).json([]);
        }
    }

    // Append WHERE clause if filters exist
    if (whereClauses.length > 0) {
        selectQuery += ` WHERE ${whereClauses.join(' AND ')}`;
    }
    selectQuery += ` ORDER BY requested_at DESC;`;
    try {
        console.log(`Executing admin query: ${selectQuery} with params: ${JSON.stringify(queryParams)}`); // Log query for debugging
        const result = await pool.query(selectQuery, queryParams);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('🔴 Error fetching payout requests for admin:', err.stack);
        res.status(500).json({ error: 'Failed to fetch payout requests' });
    }
});

// PATCH /api/admin/payouts/:requestId/status - Update payout status (Protected)
app.patch('/api/admin/payouts/:requestId/status', basicAdminAuth, async (req, res) => {
    const { requestId } = req.params;
    const { newStatus } = req.body; // Expecting e.g., {"newStatus": "Paid"} or {"newStatus": "Cancelled"}

    if (!newStatus || (newStatus !== 'Paid' && newStatus !== 'Cancelled')) {
         return res.status(400).json({ error: 'Invalid newStatus provided. Use "Paid" or "Cancelled".' });
    }

    // Ensure requestId is a number
    const reqIdInt = parseInt(requestId, 10);
    if (isNaN(reqIdInt)) {
         return res.status(400).json({ error: 'Invalid request ID format.' });
    }


    const updateQuery = `
        UPDATE payout_requests
        SET status = $1, processed_at = NOW()
        WHERE request_id = $2 AND status = 'Pending' -- Only update if currently Pending
        RETURNING *; -- Return the updated row
    `;

    try {
        const result = await pool.query(updateQuery, [newStatus, reqIdInt]);

        if (result.rows.length === 0) {
             // Check if the request exists but wasn't Pending
             const checkExists = await pool.query('SELECT status FROM payout_requests WHERE request_id = $1', [reqIdInt]);
             if (checkExists.rows.length > 0) {
                  return res.status(409).json({ error: `Request already processed (Status: ${checkExists.rows[0].status})`}); // 409 Conflict
             } else {
                  return res.status(404).json({ error: 'Pending payout request not found' });
             }
        }

        console.log(`✅ Admin updated payout request ${reqIdInt} to status ${newStatus}`);
        res.status(200).json(result.rows[0]); // Send back the updated record

    } catch (err) {
        console.error(`🔴 Error updating status for payout request ${reqIdInt}:`, err.stack);
        res.status(500).json({ error: 'Failed to update payout status' });
    }
});

// GET /api/wallets/:walletId/payouts - Get payout history for a specific wallet
app.get('/api/wallets/:walletId/payouts', async (req, res) => {
    const { walletId } = req.params;

    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(walletId)) {
        return res.status(400).json({ error: 'Invalid Wallet ID format' });
    }

    // Check if wallet exists
    const walletCheck = await pool.query('SELECT 1 FROM wallets WHERE wallet_id = $1', [walletId]);
    if (walletCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Wallet not found' });
    }

    const selectQuery = `
        SELECT request_id, coin_amount, dollar_value, status, requested_at, processed_at
        FROM payout_requests
        WHERE wallet_id = $1
        ORDER BY requested_at DESC;
    `;

    try {
        const result = await pool.query(selectQuery, [walletId]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(`🔴 Error fetching payouts for wallet ${walletId}:`, err.stack);
        res.status(500).json({ error: 'Failed to fetch payout history' });
    }
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});

// Basic error handling (optional but good practice)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Export the pool for use in other files (e.g., route handlers)
module.exports = { pool }; // Export pool for potential use in route files