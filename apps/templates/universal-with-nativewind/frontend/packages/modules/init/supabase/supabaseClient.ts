import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import config from '@app-launch-kit/config';
import { Platform } from 'react-native';

// import { Database } from '../../../apps/supabase/supabase/types_db';

const supabaseUrl = config.env.supabase.URL ?? '';
const supabaseAnonKey = config.env.supabase.ANON_KEY ?? '';

export const client = createClient(
  // <Database>
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
