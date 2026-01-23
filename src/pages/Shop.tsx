import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Filter } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/shop/ProductCard';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';

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
  const { cartItems, addToCart, cartOpen, setCartOpen } = useCart();

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
        <section className="py-24 md:py-32 px-6 lg:px-8 border-b border-border bg-gradient-to-br from-background via-background to-secondary/20">
          <div className="max-w-7xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-wide mb-4">
                Sharee Collection
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-light tracking-wide max-w-2xl mx-auto">
                Discover the timeless elegance of traditional Bangladeshi sarees
              </p>
            </motion.div>
          </div>
        </section>

        {/* Category Filters */}
        <section className="py-6 px-6 lg:px-8 border-b border-border sticky top-16 bg-background/95 backdrop-blur-sm z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
              <Filter className="w-4 h-4 text-muted-foreground mr-2" />
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-light whitespace-nowrap transition-all ${
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
                  className={`px-4 py-2 rounded-full text-sm font-light whitespace-nowrap transition-all ${
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
              className="relative"
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
        <section className="py-12 md:py-16 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-light mb-2">No products found</h3>
                <p className="text-muted-foreground">Check back soon for new arrivals!</p>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
        />
      </div>
    </>
  );
}
