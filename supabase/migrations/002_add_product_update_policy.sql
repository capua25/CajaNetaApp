create policy "Users can update own products"
  on public.products for update using (auth.uid() = user_id);
