import { api } from './api';
import { PackageItem, OrderItem } from '../types';

export const paymentService = {
  getPackages: async (): Promise<PackageItem[]> => {
    const res = await api.get<PackageItem[]>('/payments/packages');
    return res.data;
  },

  createOrder: async (packageId: string): Promise<{
    order_id: string;
    amount: number;
    currency: string;
    key_id: string;
    package_id: string;
  }> => {
    const res = await api.post('/payments/create-order', { package_id: packageId });
    return res.data;
  },

  verifyPayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    package_id: string;
  }): Promise<{ success: boolean; message: string; subscription_tier: string }> => {
    const res = await api.post('/payments/verify', data);
    return res.data;
  },

  getUserOrders: async (): Promise<OrderItem[]> => {
    const res = await api.get<OrderItem[]>('/payments/orders');
    return res.data;
  }
};
