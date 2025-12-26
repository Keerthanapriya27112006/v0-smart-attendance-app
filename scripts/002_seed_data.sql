-- Insert sample campus locations
INSERT INTO public.campus_locations (name, latitude, longitude, radius_meters, wifi_ssid, is_active)
VALUES 
  ('Main Building', 37.7749, -122.4194, 150, 'University_WiFi_Main', TRUE),
  ('Library', 37.7750, -122.4190, 100, 'University_WiFi_Library', TRUE),
  ('Engineering Block', 37.7748, -122.4198, 120, 'University_WiFi_Engineering', TRUE),
  ('Student Center', 37.7751, -122.4192, 100, 'University_WiFi_Center', TRUE)
ON CONFLICT DO NOTHING;
