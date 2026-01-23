import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderNumber = location.state?.orderNumber;
  const totalAmount = location.state?.totalAmount;

  if (!orderNumber) {
    navigate('/shop');
    return null;
  }

  return (
    <>
      <SEOHead title="Order Confirmed" description="Your order has been placed successfully" />

      <div className="min-h-screen flex items-center justify-center px-6 py-20">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>

          <h1 className="text-3xl font-light mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>

          <div className="bg-secondary/50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
              <Package className="w-4 h-4" />
              Order Number
            </div>
            <p className="text-xl font-mono font-medium">{orderNumber}</p>
            {totalAmount && (
              <p className="text-lg text-primary mt-2">
                Total: ৳{totalAmount.toLocaleString()}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Button onClick={() => navigate('/shop')} className="w-full">
              Continue Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              Back to Home
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Questions about your order? Contact us at{' '}
            <a href="mailto:hello@sunjidaakter.com" className="text-primary hover:underline">
              hello@sunjidaakter.com
            </a>
          </p>
        </motion.div>
      </div>
    </>
  );
}
