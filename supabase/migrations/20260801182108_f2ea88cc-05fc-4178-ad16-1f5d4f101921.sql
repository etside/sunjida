REVOKE EXECUTE ON FUNCTION public.owns_business(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.owns_business(UUID) TO authenticated, service_role;