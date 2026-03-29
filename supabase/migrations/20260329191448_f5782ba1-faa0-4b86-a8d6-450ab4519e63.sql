-- Create the missing trigger for auto-creating profiles on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert profile for the user who's currently missing one
INSERT INTO public.profiles (user_id, full_name)
VALUES ('9da141d0-6f3e-4453-9054-713b6ad5ad98', 'Kelvin Cheruiyot')
ON CONFLICT DO NOTHING;