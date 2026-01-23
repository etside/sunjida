import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
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
import { ImageUpload } from './ImageUpload';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(100),
  description: z.string().max(500).optional(),
  is_active: z.boolean().default(true),
  display_order: z.number().int().min(0).default(0),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  category?: any;
  onSuccess: () => void;
}

export function CategoryForm({ open, onClose, category, onSuccess }: CategoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      is_active: true,
      display_order: 0,
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        is_active: category.is_active ?? true,
        display_order: category.display_order || 0,
      });
      setImageUrl(category.image_url || null);
    } else {
      reset({
        is_active: true,
        display_order: 0,
      });
      setImageUrl(null);
    }
  }, [category, reset]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    if (!category) {
      setValue('slug', generateSlug(name));
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        image_url: imageUrl,
      };

      if (category) {
        const { error } = await supabase
          .from('sharee_categories')
          .update(payload)
          .eq('id', category.id);

        if (error) throw error;
        toast.success('Category updated');
      } else {
        const { error } = await supabase
          .from('sharee_categories')
          .insert([payload as any]);

        if (error) throw error;
        toast.success('Category created');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Edit Category' : 'Add Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register('name')}
              onChange={handleNameChange}
              placeholder="Silk Sharee"
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
              placeholder="silk-sharee"
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={2}
              placeholder="Category description..."
            />
          </div>

          <div className="space-y-2">
            <Label>Category Image</Label>
            <ImageUpload
              bucket="product-images"
              images={imageUrl ? [imageUrl] : []}
              onImagesChange={(urls) => setImageUrl(urls[0] || null)}
              maxImages={1}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="display_order">Order</Label>
              <Input
                id="display_order"
                type="number"
                {...register('display_order', { valueAsNumber: true })}
                className="w-20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {category ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
