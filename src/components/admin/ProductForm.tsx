import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(200),
  description: z.string().max(2000).optional(),
  price: z.number().min(0, 'Price must be positive'),
  sale_price: z.number().min(0).optional().nullable(),
  stock_quantity: z.number().int().min(0, 'Stock must be positive'),
  category_id: z.string().optional().nullable(),
  fabric_type: z.string().max(100).optional(),
  color: z.string().max(50).optional(),
  dimensions: z.string().max(100).optional(),
  care_instructions: z.string().max(500).optional(),
  sku: z.string().max(50).optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  product?: any;
  onSuccess: () => void;
}

export function ProductForm({ open, onClose, product, onSuccess }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      is_featured: false,
      is_active: true,
      stock_quantity: 0,
      price: 0,
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        price: product.price,
        sale_price: product.sale_price,
        stock_quantity: product.stock_quantity,
        category_id: product.category_id,
        fabric_type: product.fabric_type || '',
        color: product.color || '',
        dimensions: product.dimensions || '',
        care_instructions: product.care_instructions || '',
        sku: product.sku || '',
        is_featured: product.is_featured || false,
        is_active: product.is_active ?? true,
      });
      // Load existing images
      if (product.images?.length > 0) {
        setImageUrls(product.images.map((img: any) => img.image_url));
      }
    } else {
      reset({
        is_featured: false,
        is_active: true,
        stock_quantity: 0,
        price: 0,
      });
      setImageUrls([]);
    }
  }, [product, reset]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('sharee_categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('display_order');
    if (data) setCategories(data);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    if (!product) {
      setValue('slug', generateSlug(name));
    }
  };

  const addImageUrl = () => {
    if (newImageUrl.trim() && !imageUrls.includes(newImageUrl.trim())) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      if (product) {
        // Update existing product
        const { error } = await supabase
          .from('sharee_products')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id);

        if (error) throw error;

        // Update images - delete old and insert new
        await supabase
          .from('sharee_product_images')
          .delete()
          .eq('product_id', product.id);

        if (imageUrls.length > 0) {
          await supabase.from('sharee_product_images').insert(
            imageUrls.map((url, index) => ({
              product_id: product.id,
              image_url: url,
              is_primary: index === 0,
              display_order: index,
            }))
          );
        }

        toast.success('Product updated successfully');
      } else {
        // Create new product
        const { data: newProduct, error } = await supabase
          .from('sharee_products')
          .insert([data as any])
          .select()
          .single();

        if (error) throw error;

        // Insert images
        if (imageUrls.length > 0 && newProduct) {
          await supabase.from('sharee_product_images').insert(
            imageUrls.map((url, index) => ({
              product_id: newProduct.id,
              image_url: url,
              is_primary: index === 0,
              display_order: index,
            }))
          );
        }

        toast.success('Product created successfully');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-light">
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                {...register('name')}
                onChange={handleNameChange}
                placeholder="Banarasi Silk Sharee"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                {...register('slug')}
                placeholder="banarasi-silk-sharee"
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={3}
              placeholder="Describe your product..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (৳) *</Label>
              <Input
                id="price"
                type="number"
                {...register('price', { valueAsNumber: true })}
                placeholder="2500"
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale_price">Sale Price (৳)</Label>
              <Input
                id="sale_price"
                type="number"
                {...register('sale_price', { valueAsNumber: true })}
                placeholder="2000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock *</Label>
              <Input
                id="stock_quantity"
                type="number"
                {...register('stock_quantity', { valueAsNumber: true })}
                placeholder="10"
              />
              {errors.stock_quantity && (
                <p className="text-sm text-destructive">{errors.stock_quantity.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={watch('category_id') || ''}
                onValueChange={(value) => setValue('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register('sku')} placeholder="SHR-001" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fabric_type">Fabric Type</Label>
              <Input
                id="fabric_type"
                {...register('fabric_type')}
                placeholder="Silk"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input id="color" {...register('color')} placeholder="Red" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                {...register('dimensions')}
                placeholder="5.5m x 1.2m"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="care_instructions">Care Instructions</Label>
            <Textarea
              id="care_instructions"
              {...register('care_instructions')}
              rows={2}
              placeholder="Dry clean only..."
            />
          </div>

          <div className="space-y-3">
            <Label>Product Images (URLs)</Label>
            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
              />
              <Button type="button" variant="outline" onClick={addImageUrl}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    {index === 0 && (
                      <span className="absolute top-1 left-1 text-xs bg-primary text-primary-foreground px-1 rounded">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImageUrl(index)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="is_featured"
                checked={watch('is_featured')}
                onCheckedChange={(checked) => setValue('is_featured', checked)}
              />
              <Label htmlFor="is_featured">Featured Product</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
