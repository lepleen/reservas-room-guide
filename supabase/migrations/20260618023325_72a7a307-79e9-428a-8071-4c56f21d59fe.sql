REVOKE ALL ON FUNCTION public.prevent_profile_privilege_escalation() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prevent_profile_privilege_escalation() FROM anon;
REVOKE ALL ON FUNCTION public.prevent_profile_privilege_escalation() FROM authenticated;