// web-landing/src/contracts/marketplace_abi.js
// استخراج دقيق من G7GFTMarketplace.sol المنشور على Polygon Mainnet

export const MARKETPLACE_ABI = [
    // --- Constructor Parameters (للمرجعية فقط) ---
    {
        "inputs": [
            {"internalType": "address", "name": "_g7gftTokenAddress", "type": "address"},
            {"internalType": "address", "name": "_treasury", "type": "address"}
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },

    // --- Custom Errors (للطباعة التفصيلية في Console) ---
    {"inputs": [], "name": "AddressIsBlacklisted", "type": "error"},
    {"inputs": [], "name": "NotOnWhitelist", "type": "error"},
    {"inputs": [], "name": "CurrencyNotAccepted", "type": "error"},
    {"inputs": [], "name": "InvalidTreasury", "type": "error"},
    {"inputs": [], "name": "P2pAmountMustBe0", "type": "error"},
    {"inputs": [], "name": "P2pPriceMustBe0", "type": "error"},
    {"inputs": [], "name": "P2pTooMany", "type": "error"},
    {"inputs": [], "name": "P2pLowFreeBal", "type": "error"},
    {"inputs": [], "name": "P2pOrderNotActive", "type": "error"},
    {"inputs": [], "name": "P2pNotAuthorized", "type": "error"},
    {"inputs": [], "name": "P2pOrderExpired", "type": "error"},
    {"inputs": [], "name": "P2pOwnOrder", "type": "error"},
    {"inputs": [], "name": "P2pBadMaxprice", "type": "error"},
    {"inputs": [], "name": "P2pNoMatch", "type": "error"},
    {"inputs": [], "name": "P2pSlippageTooHigh", "type": "error"},
    {"inputs": [], "name": "P2pFeeTooHigh", "type": "error"},
    {"inputs": [], "name": "P2pBadNativeAmt", "type": "error"},
    {"inputs": [], "name": "P2pNoNativeNeeded", "type": "error"},
    {"inputs": [], "name": "P2pPaySellerFailed", "type": "error"},
    {"inputs": [], "name": "P2pFailedToSendFee", "type": "error"},

    // --- Events (للاستماع للتغييرات في الوقت الحقيقي) ---
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "uint256", "name": "orderId", "type": "uint256"},
            {"indexed": true, "internalType": "address", "name": "seller", "type": "address"},
            {"indexed": true, "internalType": "address", "name": "currency", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "g7gftAmount", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "pricePerToken", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "expiresAt", "type": "uint256"}
        ],
        "name": "P2POrderPlaced",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "uint256", "name": "orderId", "type": "uint256"},
            {"indexed": true, "internalType": "address", "name": "seller", "type": "address"},
            {"indexed": true, "internalType": "address", "name": "buyer", "type": "address"},
            {"indexed": false, "internalType": "address", "name": "currency", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "g7gftAmount", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "currencyAmount", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256"}
        ],
        "name": "P2POrderExecuted",
        "type": "event"
    },
    // ... (يمكن إضافة بقية الأحداث مثل Cancelled و Expired بنفس النمط)

    // --- Write Functions (الدوال التنفيذية) ---
    {
        "inputs": [
            {"internalType": "address", "name": "currency", "type": "address"},
            {"internalType": "uint256", "name": "g7gftAmount", "type": "uint256"},
            {"internalType": "uint256", "name": "pricePerToken", "type": "uint256"}
        ],
        "name": "placeOrder",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "orderId", "type": "uint256"}],
        "name": "cancelOrder",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "orderId", "type": "uint256"}],
        "name": "executeOrder",
        "outputs": [],
        "stateMutability": "payable", // يقبل الدفع بـ POL/MATIC مباشرة
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "currency", "type": "address"},
            {"internalType": "uint256", "name": "maxPrice", "type": "uint256"},
            {"internalType": "uint256", "name": "minG7GFTOut", "type": "uint256"}
        ],
        "name": "autoMatchOrder",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256[]", "name": "orderIds", "type": "uint256[]"}],
        "name": "expireOrders",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },

    // --- Read Functions (الدوال القرائية - View/Pure) ---
    {
        "inputs": [],
        "name": "getActiveOrders",
        "outputs": [{
            "components": [
                {"internalType": "uint256", "name": "orderId", "type": "uint256"},
                {"internalType": "address", "name": "seller", "type": "address"},
                {"internalType": "address", "name": "currency", "type": "address"},
                {"internalType": "uint256", "name": "g7gftAmount", "type": "uint256"},
                {"internalType": "uint256", "name": "pricePerToken", "type": "uint256"},
                {"internalType": "uint256", "name": "expiresAt", "type": "uint256"},
                {"internalType": "bool", "name": "isActive", "type": "bool"}
            ],
            "internalType": "struct G7GFTMarketplace.Order[]",
            "name": "",
            "type": "tuple[]"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "orderId", "type": "uint256"}],
        "name": "quoteOrderCost",
        "outputs": [
            {"internalType": "uint256", "name": "totalCost", "type": "uint256"},
            {"internalType": "uint256", "name": "feeAmount", "type": "uint256"},
            {"internalType": "uint256", "name": "netToSeller", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getMarketStats",
        "outputs": [
            {"internalType": "uint256", "name": "volume", "type": "uint256"},
            {"internalType": "uint256", "name": "buyCount", "type": "uint256"},
            {"internalType": "uint256", "name": "sellCount", "type": "uint256"},
            {"internalType": "uint256", "name": "activeOrders", "type": "uint256"},
            {"internalType": "uint256", "name": "totalOrders", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    
    // --- Admin Functions (للوحة التحكم فقط) ---
    {
        "inputs": [{"internalType": "address", "name": "currency", "type": "address"}, {"internalType": "bool", "name": "status", "type": "bool"}],
        "name": "setAcceptedCurrency",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_feePercent", "type": "uint256"}],
        "name": "setP2PFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];