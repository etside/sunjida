import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { 
  User, Package, MapPin, Mail, Phone, Edit, 
  ChevronRight, ShoppingBag, Clock, Loader2, LogOut
} from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string | null;
  total_amount: number;
  created_at: string;
  items: {
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Account() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single();
    
    if (profileData) setProfile(profileData);

    // Fetch orders with items
    const { data: ordersData } = await supabase
      .from('orders')
      .select(`
        id, order_number, status, payment_status, total_amount, created_at,
        items:order_items(id, product_name, quantity, unit_price)
      `)
      .eq('customer_id', user!.id)
      .order('created_at', { ascending: false });

    if (ordersData) setOrders(ordersData as unknown as Order[]);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <SEOHead title="My Account" description="Manage your account and view order history" />

      <div className="min-h-screen bg-secondary/20 py-8 md:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-light">
                  {profile?.full_name || 'Welcome!'}
                </h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </motion.div>

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {orders.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start shopping to see your orders here
                      </p>
                      <Button asChild>
                        <Link to="/shop">Browse Shop</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  orders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="bg-muted/30 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Order</p>
                              <p className="font-mono font-medium">{order.order_number}</p>
                            </div>
                            <Separator orientation="vertical" className="h-8 hidden sm:block" />
                            <div>
                              <p className="text-sm text-muted-foreground">Date</p>
                              <p className="font-medium">
                                {format(new Date(order.created_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[order.status] || ''}>
                              {order.status}
                            </Badge>
                            <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                              {order.payment_status || 'pending'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="space-y-3">
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>
                                {item.product_name} 
                                <span className="text-muted-foreground"> × {item.quantity}</span>
                              </span>
                              <span>৳{(item.unit_price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                          <Separator />
                          <div className="flex justify-between font-medium">
                            <span>Total</span>
                            <span className="text-primary">৳{order.total_amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </motion.div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-sm text-muted-foreground">Full Name</label>
                        <p className="font-medium">{profile?.full_name || 'Not set'}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm text-muted-foreground">Email</label>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Total Orders</p>
                          <p className="text-sm text-muted-foreground">
                            {orders.length} order{orders.length !== 1 ? 's' : ''} placed
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Member since {format(new Date(user.created_at), 'MMMM yyyy')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
