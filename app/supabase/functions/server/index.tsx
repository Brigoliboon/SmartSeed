import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client with service role key
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Health check
app.get('/make-server-2054dc09/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Sign up endpoint
app.post('/make-server-2054dc09/auth/signup', async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    if (!email || !password || !name || !role) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since email server not configured
      user_metadata: { name, role }
    });

    if (authError) {
      console.error('Supabase auth error during signup:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // Store user data in KV store
    const userData = {
      id: authData.user.id,
      email,
      name,
      role,
      created_at: new Date().toISOString()
    };

    await kv.set(`user:${authData.user.id}`, userData);

    return c.json({ 
      success: true, 
      user: userData
    });
  } catch (error) {
    console.error('Error during signup:', error);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Sign in endpoint
app.post('/make-server-2054dc09/auth/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400);
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Supabase auth error during signin:', authError);
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Get user data from KV store
    const userData = await kv.get(`user:${authData.user.id}`);

    if (!userData) {
      // Fallback to user metadata if not in KV store
      return c.json({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.user_metadata.name || 'User',
          role: authData.user.user_metadata.role || 'nursery_staff',
          created_at: authData.user.created_at
        },
        access_token: authData.session?.access_token
      });
    }

    return c.json({
      success: true,
      user: userData,
      access_token: authData.session?.access_token
    });
  } catch (error) {
    console.error('Error during signin:', error);
    return c.json({ error: 'Sign in failed' }, 500);
  }
});

// Get session endpoint
app.get('/make-server-2054dc09/auth/session', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return c.json({ user: null }, 200);
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ user: null }, 200);
    }

    // Get user data from KV store
    const userData = await kv.get(`user:${user.id}`);

    if (userData) {
      return c.json({ user: userData });
    }

    // Fallback to user metadata
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata.name || 'User',
        role: user.user_metadata.role || 'nursery_staff',
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Error checking session:', error);
    return c.json({ user: null }, 200);
  }
});

// Batch endpoints
app.get('/make-server-2054dc09/batches', async (c) => {
  try {
    const batches = await kv.getByPrefix('batch:');
    return c.json({ batches });
  } catch (error) {
    console.error('Error fetching batches:', error);
    return c.json({ error: 'Failed to fetch batches' }, 500);
  }
});

app.post('/make-server-2054dc09/batches', async (c) => {
  try {
    const batch = await c.req.json();
    const batchId = batch.id || `batch-${Date.now()}`;
    
    await kv.set(`batch:${batchId}`, {
      ...batch,
      id: batchId,
      updated_at: new Date().toISOString()
    });

    return c.json({ success: true, batch: { ...batch, id: batchId } });
  } catch (error) {
    console.error('Error creating batch:', error);
    return c.json({ error: 'Failed to create batch' }, 500);
  }
});

// Sensor data endpoint
app.post('/make-server-2054dc09/sensor-data', async (c) => {
  try {
    const data = await c.req.json();
    const dataId = `sensor-data:${Date.now()}`;
    
    await kv.set(dataId, {
      ...data,
      timestamp: new Date().toISOString()
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('Error storing sensor data:', error);
    return c.json({ error: 'Failed to store sensor data' }, 500);
  }
});

// Alerts endpoint
app.get('/make-server-2054dc09/alerts', async (c) => {
  try {
    const alerts = await kv.getByPrefix('alert:');
    return c.json({ alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return c.json({ error: 'Failed to fetch alerts' }, 500);
  }
});

Deno.serve(app.fetch);
