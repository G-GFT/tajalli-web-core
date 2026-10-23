// web-landing/src/services/p2p_service.js
// ترجمة دقيقة لـ blockchain_p2p.dart باستخدام Ethers.js v6

import { ethers } from 'ethers';
import { MARKETPLACE_ABI } from '../contracts/marketplace_abi.js'; // سنتحدث عن هذا الملف لاحقاً

class P2PService {
    constructor(provider, signer, contractAddress) {
        this.provider = provider; // MetaMask Provider أو WalletConnect
        this.signer = signer;     // Signer مرتبط بالمحفظة
        this.contractAddress = contractAddress;
        
        // تهيئة العقد الذكي
        this.marketplaceContract = new ethers.Contract(contractAddress, MARKETPLACE_ABI, signer);
        
        // حالة الاتصال
        this.isConnected = !!signer;
    }

    /**
     * [محاكاة لـ placeOrder] وضع أمر بيع
     * يجمّد G7GFT لدى عقد Marketplace
     */
    async placeOrder(currencySymbol, g7gftAmount, pricePerToken) {
        if (!this.isConnected) return { success: false, error: 'غير متصل بالمحفظة' };
        if (g7gftAmount <= 0 || pricePerToken <= 0) return { success: false, error: 'قيم غير صالحة' };

        try {
            // 1. تحويل القيم لعشرات الباور (Wei)
            const decimals = currencySymbol === 'MATIC' ? 18 : await this._getTokenDecimals(currencySymbol);
            const g7gftWei = ethers.parseUnits(g7gftAmount.toString(), 18); // G7GFT دائماً 18 decimal غالباً
            const priceWei = ethers.parseUnits(pricePerToken.toString(), decimals);
            
            // 2. تحديد عنوان العملة (MATIC native = address(0))
            const currencyAddr = currencySymbol.toUpperCase() === 'MATIC' 
                ? '0x0000000000000000000000000000000000000000' 
                : await this._getTokenAddress(currencySymbol);

            // 3. الموافقة (Approve) - ضروري قبل الإيداع في العقد
            if (currencySymbol !== 'MATIC') {
                const tokenContract = new ethers.Contract(await this._getTokenAddress('G7GFT'), ['function approve(address spender, uint256 amount) public returns (bool)'], this.signer);
                console.log(`[P2P] Approving ${g7gftAmount} G7GFT for Marketplace...`);
                const approveTx = await tokenContract.approve(this.contractAddress, g7gftWei);
                await approveTx.wait(); // انتظار تأكيد الموافقة
            }

            // 4. إرسال الأمر للعقد
            console.log('[P2P] Placing order on-chain...');
            const tx = await this.marketplaceContract.placeOrder(currencyAddr, g7gftWei, priceWei);
            const receipt = await tx.wait(); // انتظار تأكيد المعاملة
            
            console.log('[P2P] Order placed successfully:', receipt.transactionHash);
            
            return { 
                success: true, 
                txHash: receipt.transactionHash, 
                message: 'تم إرسال أمر البيع بنجاح ✅' 
            };

        } catch (error) {
            console.error('[P2P] Place Order Error:', error);
            return { 
                success: false, 
                error: this._parseError(error.message),
                raw: error.message 
            };
        }
    }

    /**
     * [محاكاة لـ executeOrder] تنفيذ شراء أمر موجود
     * CRITICAL: ينتظر التأكيد الفعلي لأن أموالاً حقيقية تتحرك
     */
    async executeOrder(orderId, currencySymbol, totalCost) {
        if (!this.isConnected) return { success: false, error: 'غير متصل' };

        try {
            const decimals = currencySymbol === 'MATIC' ? 18 : await this._getTokenDecimals(currencySymbol);
            const costWei = ethers.parseUnits(totalCost.toString(), decimals);
            const isNative = currencySymbol.toUpperCase() === 'MATIC';

            let tx;
            if (isNative) {
                // الدفع بـ MATIC مباشرة
                tx = await this.marketplaceContract.executeOrder(orderId, { value: costWei });
            } else {
                // الدفع بعملة ERC20 (مثل USDT)
                const tokenAddr = await this._getTokenAddress(currencySymbol);
                
                // موافقة مسبقة للدفع
                const tokenContract = new ethers.Contract(tokenAddr, ['function approve(address spender, uint256 amount) public returns (bool)'], this.signer);
                const approveTx = await tokenContract.approve(this.contractAddress, costWei);
                await approveTx.wait();

                tx = await this.marketplaceContract.executeOrder(orderId);
            }

            // الانتظار الحاسم للتأكيد (كما في الكود الأصلي)
            const receipt = await tx.wait();
            
            if (receipt.status === 0) {
                throw new Error("Transaction reverted on-chain");
            }

            console.log('[P2P] Execute Order Confirmed:', receipt.transactionHash);
            return { 
                success: true, 
                txHash: receipt.transactionHash, 
                message: 'تم تنفيذ الشراء بنجاح ✅' 
            };

        } catch (error) {
            console.error('[P2P] Execute Order Error:', error);
            return { 
                success: false, 
                error: this._parseError(error.message),
                raw: error.message 
            };
        }
    }

    /**
     * [محاكاة لـ getActiveOrders] قراءة الأوامر النشطة
     * دالة View سريعة بدون توقيع
     */
    async getActiveOrders() {
        try {
            // استخدام provider للقراءة فقط (أسرع وأرخص)
            const readOnlyContract = this.marketplaceContract.connect(this.provider);
            const orders = await readOnlyContract.getActiveOrders();
            
            return orders.map(o => ({
                orderId: o.orderId.toString(),
                seller: o.seller,
                currency: o.currency,
                amount: ethers.formatUnits(o.g7gftAmount, 18),
                price: parseFloat(ethers.formatUnits(o.pricePerToken, 18)), // افتراض 18 للعملة المستهدفة أيضاً أو حسابها ديناميكياً
                expiresAt: Number(o.expiresAt),
                isActive: o.isActive
            }));
        } catch (error) {
            console.error('[P2P] Get Active Orders Error:', error);
            return [];
        }
    }

    // --- دوال مساعدة داخلية (Private Helpers) ---

    async _getTokenAddress(symbol) {
        // هنا تضع منطق جلب عناوين العملات من إعداداتك أو API خارجي
        // مثال بسيط:
        const addresses = {
            'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // Polygon USDT Example
            'G7GFT': 'YOUR_G7GFT_CONTRACT_ADDRESS_HERE'
        };
        return addresses[symbol] || null;
    }

    async _getTokenDecimals(symbol) {
        // عادة USDT على Polygon له 6 decimals، بينما ETH/MATIC/G7GFT لهم 18
        if (symbol === 'USDT') return 6;
        return 18;
    }

    _parseError(rawMessage) {
        if (rawMessage.includes('insufficient funds')) return 'الرصيد غير كافٍ للغاز أو للعملية';
        if (rawMessage.includes('user rejected')) return 'تم رفض الطلب من المحفظة';
        if (rawMessage.includes('execution reverted')) return 'العقد رفض العملية (تحقق من الشروط)';
        if (rawMessage.includes('network error')) return 'مشكلة في اتصال الشبكة';
        return rawMessage.length > 100 ? rawMessage.substring(0, 100) + '...' : rawMessage;
    }
}

export default P2PService;