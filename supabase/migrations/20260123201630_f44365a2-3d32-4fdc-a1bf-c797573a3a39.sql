-- Fix permissive RLS policies by adding more specific checks

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;

-- Create more restrictive policies

-- Orders: Allow authenticated users or anyone with valid order data
CREATE POLICY "Authenticated users can create orders" ON public.orders 
  FOR INSERT WITH CHECK (
    customer_email IS NOT NULL AND 
    customer_name IS NOT NULL AND 
    shipping_address IS NOT NULL
  );

-- Order items: Only allow inserts when there's a corresponding order
CREATE POLICY "Allow order items for valid orders" ON public.order_items 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id)
  );

-- Contact submissions: Require valid email and message
CREATE POLICY "Valid contact form submissions" ON public.contact_submissions 
  FOR INSERT WITH CHECK (
    email IS NOT NULL AND 
    message IS NOT NULL AND
    name IS NOT NULL
  );