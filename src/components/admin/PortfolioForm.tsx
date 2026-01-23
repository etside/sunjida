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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(200),
  category: z.string().min(1, 'Category is required'),
  year: z.string().min(4, 'Year is required'),
  description: z.string().max(2000).optional(),
  cover_image_url: z.string().url('Must be a valid URL'),
  client: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  is_featured: z.boolean().default(false),
  display_order: z.number().int().min(0).default(0),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const categories = [
  'Brand Identity',
  'Logo Design',
  'Social Media',
  'Packaging',
  'Print Design',
  'Web Design',
  'Illustration',
  'Typography',
];

interface PortfolioFormProps {
  open: boolean;
  onClose: () => void;
  project?: any;
  onSuccess: () => void;
}

export function PortfolioForm({ open, onClose, project, onSuccess }: PortfolioFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      is_featured: false,
      display_order: 0,
    },
  });

  useEffect(() => {
    if (project) {
      reset({
        title: project.title,
        slug: project.slug,
        category: project.category,
        year: project.year,
        description: project.description || '',
        cover_image_url: project.cover_image_url,
        client: project.client || '',
        location: project.location || '',
        is_featured: project.is_featured || false,
        display_order: project.display_order || 0,
      });
    } else {
      reset({
        is_featured: false,
        display_order: 0,
        year: new Date().getFullYear().toString(),
      });
    }
  }, [project, reset]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setValue('title', title);
    if (!project) {
      setValue('slug', generateSlug(title));
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true);
    try {
      if (project) {
        const { error } = await supabase
          .from('portfolio_projects')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', project.id);

        if (error) throw error;
        toast.success('Project updated successfully');
      } else {
        const { error } = await supabase
          .from('portfolio_projects')
          .insert([data as any]);

        if (error) throw error;
        toast.success('Project created successfully');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-light">
            {project ? 'Edit Project' : 'Add New Project'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                {...register('title')}
                onChange={handleTitleChange}
                placeholder="Brand Identity Design"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                {...register('slug')}
                placeholder="brand-identity-design"
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={watch('category') || ''}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                {...register('year')}
                placeholder="2024"
              />
              {errors.year && (
                <p className="text-sm text-destructive">{errors.year.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_image_url">Cover Image URL *</Label>
            <Input
              id="cover_image_url"
              {...register('cover_image_url')}
              placeholder="https://example.com/image.jpg"
            />
            {errors.cover_image_url && (
              <p className="text-sm text-destructive">{errors.cover_image_url.message}</p>
            )}
            {watch('cover_image_url') && (
              <img
                src={watch('cover_image_url')}
                alt="Preview"
                className="w-full h-40 object-cover rounded-lg mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={3}
              placeholder="Describe the project..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                {...register('client')}
                placeholder="Client name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Dhaka, Bangladesh"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="is_featured"
                checked={watch('is_featured')}
                onCheckedChange={(checked) => setValue('is_featured', checked)}
              />
              <Label htmlFor="is_featured">Featured Project</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                {...register('display_order', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {project ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
