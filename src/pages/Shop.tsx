import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Filter, Sparkles } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/shop/ProductCard';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { designerInfo } from '@/data/designer';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  fabric_type: string | null;
  color: string | null;
  is_featured: boolean | null;
  category: {
    name: string;
    slug: string;
  } | null;
  images: {
    image_url: string;
    is_primary: boolean;
  }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { cartItems, addToCart, updateQuantity, removeFromCart, cartOpen, setCartOpen } = useCart();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('sharee_products')
      .select(`
        *,
        category:sharee_categories(name, slug),
        images:sharee_product_images(image_url, is_primary)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data as unknown as Product[]);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('sharee_categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('display_order');

    if (!error && data) {
      setCategories(data);
    }
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category?.slug === selectedCategory);

  return (
    <>
      <SEOHead
        title="Shop Sharee Collection"
        description="Explore our exquisite collection of traditional Bangladeshi sarees. Jamdani, Silk, Cotton, and more. Handpicked for quality and elegance."
      />

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="pt-24 md:pt-32 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-secondary via-accent/30 to-secondary">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center md:text-left"
              >
                <span className="text-sm font-medium text-primary uppercase tracking-wider">
                  Exclusive Collection
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight mt-4">
                  <span className="text-gradient font-medium">Sharee</span> Collection
                </h1>
                <p className="text-lg text-muted-foreground font-light mt-4 max-w-lg">
                  Discover the timeless elegance of traditional Bangladeshi sarees. Each piece is handpicked for quality and authentic craftsmanship.
                </p>
                <div className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start">
                  {['Jamdani', 'Silk', 'Cotton', 'Katan', 'Muslin'].map((type) => (
                    <span key={type} className="px-4 py-2 rounded-full bg-card/80 text-sm font-medium border border-border">
                      {type}
                    </span>
                  ))}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hidden md:block"
              >
                <div className="aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={designerInfo.portraitImage2}
                    alt="Traditional Saree"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Category Filters & Cart */}
        <section className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8 border-b border-border sticky top-16 md:top-20 bg-background/95 backdrop-blur-sm z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar flex-1">
              <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                All Sarees
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category.slug
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Cart Button */}
            <Button
              variant="outline"
              size="icon"
              className="relative flex-shrink-0 rounded-full"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Button>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-light">Coming Soon!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Our beautiful Sharee collection is being curated. Check back soon for new arrivals!
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium mt-4"
                >
                  Contact for Custom Orders
                </Link>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <ProductCard product={product} onAddToCart={addToCart} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* Cart Drawer */}
        <CartDrawer
          open={cartOpen}
          onOpenChange={setCartOpen}
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
        />

        {/* Bottom spacing */}
        <div className="h-16 md:h-24" />
      </div>
    </>
  );
}
