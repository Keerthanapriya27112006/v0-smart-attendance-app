-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  student_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create campus locations table for location verification
CREATE TABLE IF NOT EXISTS public.campus_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 100,
  wifi_ssid TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attendance records table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.campus_locations(id),
  check_in_time TIMESTAMPTZ DEFAULT NOW(),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  wifi_ssid TEXT,
  verification_method TEXT CHECK (verification_method IN ('location', 'wifi', 'both')),
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'late', 'absent')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  course_name TEXT,
  max_score INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create task submissions table
CREATE TABLE IF NOT EXISTS public.task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_text TEXT,
  attachment_url TEXT,
  score INTEGER,
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  graded_at TIMESTAMPTZ,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late')),
  UNIQUE(task_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for campus_locations (everyone can read, only admins can modify)
CREATE POLICY "Everyone can view campus locations" ON public.campus_locations
  FOR SELECT USING (TRUE);

-- RLS Policies for attendance (users can view and create their own)
CREATE POLICY "Users can view own attendance" ON public.attendance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own attendance" ON public.attendance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for tasks (everyone can read, teachers can create)
CREATE POLICY "Everyone can view tasks" ON public.tasks
  FOR SELECT USING (TRUE);

CREATE POLICY "Teachers can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

-- RLS Policies for task_submissions
CREATE POLICY "Users can view own submissions" ON public.task_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own submissions" ON public.task_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions" ON public.task_submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- Teachers can view all submissions
CREATE POLICY "Teachers can view all submissions" ON public.task_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, student_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Student'),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'student_id'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Create trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
