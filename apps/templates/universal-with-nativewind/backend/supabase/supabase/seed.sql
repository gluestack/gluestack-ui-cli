INSERT INTO storage.buckets(id, name, owner_id, public) VALUES ('profile_images', 'profile_images', 'authenticated', true);
CREATE POLICY "allow insert for authenticated users on bucket profile_images" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'profile_images');
CREATE POLICY "allow select for authenticated users on bucket profile_images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'profile_images');

INSERT INTO storage.buckets(id, name, owner_id, public) VALUES ('cover_images', 'cover_images', 'authenticated', true);
CREATE POLICY "allow insert for authenticated users on bucket cover_images" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'cover_images');
CREATE POLICY "allow select for authenticated users on bucket cover_images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'cover_images');