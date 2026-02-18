
-- Remove insecure policies on vip_keys
DROP POLICY IF EXISTS "Authenticated users can read unused keys for activation" ON public.vip_keys;
DROP POLICY IF EXISTS "Users can update keys to activate" ON public.vip_keys;
