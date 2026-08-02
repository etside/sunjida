import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageProvider';
import { inquiryTypes } from '@/data/company';

const contactFormSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  projectType: z.string().min(1),
  message: z.string().trim().min(10).max(2000),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function ContactForm() {
  const { lang } = useLanguage();
  const bn = lang === 'bn';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', email: '', projectType: '', message: '' },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('contact_submissions').insert({
        name: data.name,
        email: data.email,
        project_type: data.projectType,
        message: data.message,
      });
      if (error) throw error;

      setIsSuccess(true);
      form.reset();
      setTimeout(() => setIsSuccess(false), 6000);
    } catch {
      form.setError('root', {
        message: bn
          ? 'বার্তা পাঠানো যায়নি। আবার চেষ্টা করুন।'
          : 'Could not send your message. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        className="rounded-xl border border-border bg-secondary/40 p-8 text-center space-y-4"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <CheckCircle2 className="size-12 mx-auto text-primary" />
        <h3 className="text-xl font-semibold">{bn ? 'বার্তা পাঠানো হয়েছে!' : 'Message sent!'}</h3>
        <p className="text-sm text-muted-foreground">
          {bn
            ? 'ধন্যবাদ। আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।'
            : 'Thanks for reaching out — our team will get back to you shortly.'}
        </p>
      </motion.div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{bn ? 'নাম' : 'Name'}</FormLabel>
              <FormControl>
                <Input placeholder={bn ? 'আপনার নাম' : 'Your full name'} {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{bn ? 'ইমেইল' : 'Email'}</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@company.com" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="projectType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{bn ? 'কী নিয়ে কথা বলতে চান?' : 'What do you need?'}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={bn ? 'একটি বেছে নিন' : 'Select a topic'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-popover z-50">
                  {inquiryTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {bn ? t.bn : t.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{bn ? 'বার্তা' : 'Message'}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={
                    bn
                      ? 'আপনার ব্যবসা ও চাহিদা সম্পর্কে লিখুন...'
                      : 'Tell us about your business and what you want to automate...'
                  }
                  className="min-h-32 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {bn ? 'পাঠানো হচ্ছে...' : 'Sending...'}
            </>
          ) : bn ? (
            'বার্তা পাঠান'
          ) : (
            'Send message'
          )}
        </Button>
      </form>
    </Form>
  );
}
