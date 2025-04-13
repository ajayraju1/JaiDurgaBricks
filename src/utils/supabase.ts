import { createClient } from "@supabase/supabase-js";
import { Worker, WorkRecord, UsageRecord } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Create Supabase client with permanent session
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    // Set custom storage key for persistent auth
    storageKey: "bricks_permanent_auth",
    storage: {
      getItem: (key) => {
        if (isBrowser) {
          return localStorage.getItem(key);
        }
        return null;
      },
      setItem: (key, value) => {
        // Store with practically no expiry (or until browser storage is cleared)
        if (isBrowser) {
          localStorage.setItem(key, value);
        }
      },
      removeItem: (key) => {
        if (isBrowser) {
          localStorage.removeItem(key);
        }
      },
    },
  },
});

// Authentication functions
export async function signInWithPassword(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Authentication error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in signInWithPassword:", error);
    throw error;
  }
}

export async function signInWithOtp(email: string) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error("OTP authentication error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in signInWithOtp:", error);
    throw error;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error("Error in signOut:", error);
    throw error;
  }
}

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Get session error:", error);
      throw error;
    }
    return data.session;
  } catch (error) {
    console.error("Error in getSession:", error);
    throw error;
  }
}

// Worker-related functions
export async function getWorkers() {
  try {
    const { data, error } = await supabase
      .from("workers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching workers:", error);
      throw error;
    }

    // Convert from snake_case DB fields back to camelCase for the app
    return data.map((worker) => ({
      id: worker.id,
      name: worker.name,
      phone: worker.phone,
      initialDebt: worker.initial_debt,
      createdAt: worker.created_at,
    })) as Worker[];
  } catch (error) {
    console.error("Error in getWorkers:", error);
    throw error;
  }
}

// Add getWorkerBalance function
export async function getWorkerBalance(workerId: string) {
  try {
    const { data, error } = await supabase.rpc("get_worker_balance", {
      worker_id_param: workerId,
    });

    if (error) {
      console.error("Supabase error getting worker balance:", error);
      throw error;
    }

    return data || 0;
  } catch (error) {
    console.error("Error in getWorkerBalance:", error);
    throw error;
  }
}

export async function getWorkerById(id: string) {
  try {
    const { data, error } = await supabase
      .from("workers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error fetching worker by ID:", error);
      throw error;
    }

    // Convert from snake_case DB fields back to camelCase for the app
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      initialDebt: data.initial_debt,
      createdAt: data.created_at,
    } as Worker;
  } catch (error) {
    console.error("Error in getWorkerById:", error);
    throw error;
  }
}

export async function createWorker(worker: Omit<Worker, "id" | "createdAt">) {
  try {
    const { data, error } = await supabase
      .from("workers")
      .insert([
        {
          name: worker.name,
          phone: worker.phone,
          initial_debt: worker.initialDebt,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error creating worker:", error);
      throw error;
    }

    // Convert from snake_case DB fields back to camelCase for the app
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      initialDebt: data.initial_debt,
      createdAt: data.created_at,
    } as Worker;
  } catch (error) {
    console.error("Error in createWorker:", error);
    throw error;
  }
}

// Work record functions
export async function getWorkRecords(workerId?: string) {
  try {
    let query = supabase
      .from("work_records")
      .select("*")
      .order("date", { ascending: true }); // Changed to ascending: true

    if (workerId) {
      query = query.eq("worker_id", workerId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase error fetching work records:", error);
      throw error;
    }

    // Convert from snake_case DB fields back to camelCase for the app
    return data.map((record) => ({
      id: record.id,
      workerId: record.worker_id,
      workType: record.work_type,
      date: record.date,
      amount: record.amount,
      brickCount: record.brick_count,
      isDriver: record.is_driver,
      isHalfDay: record.is_half_day,
      createdAt: record.created_at,
    })) as WorkRecord[];
  } catch (error) {
    console.error("Error in getWorkRecords:", error);
    throw error;
  }
}

export async function createWorkRecord(
  record: Omit<WorkRecord, "id" | "createdAt">
) {
  try {
    const { data, error } = await supabase
      .from("work_records")
      .insert([
        {
          worker_id: record.workerId,
          work_type: record.workType,
          date: record.date,
          amount: record.amount,
          brick_count: record.brickCount,
          is_driver: record.isDriver,
          is_half_day: record.isHalfDay,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error creating work record:", error);
      throw error;
    }

    // Convert from snake_case DB fields back to camelCase for the app
    return {
      id: data.id,
      workerId: data.worker_id,
      workType: data.work_type,
      date: data.date,
      amount: data.amount,
      brickCount: data.brick_count,
      isDriver: data.is_driver,
      isHalfDay: data.is_half_day,
      createdAt: data.created_at,
    } as WorkRecord;
  } catch (error) {
    console.error("Error in createWorkRecord:", error);
    throw error;
  }
}

// Usage record functions
export async function getUsageRecords(workerId?: string) {
  try {
    let query = supabase
      .from("usage_records")
      .select("*")
      .order("date", { ascending: true }); // Changed to ascending: true

    if (workerId) {
      query = query.eq("worker_id", workerId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase error fetching usage records:", error);
      throw error;
    }

    // Convert from snake_case DB fields back to camelCase for the app
    return data.map((record) => ({
      id: record.id,
      workerId: record.worker_id,
      date: record.date,
      amount: record.amount,
      createdAt: record.created_at,
    })) as UsageRecord[];
  } catch (error) {
    console.error("Error in getUsageRecords:", error);
    throw error;
  }
}

export async function createUsageRecord(
  record: Omit<UsageRecord, "id" | "createdAt">
) {
  try {
    const { data, error } = await supabase
      .from("usage_records")
      .insert([
        {
          worker_id: record.workerId,
          date: record.date,
          amount: record.amount,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error creating usage record:", error);
      throw error;
    }

    // Convert from snake_case DB fields back to camelCase for the app
    return {
      id: data.id,
      workerId: data.worker_id,
      date: data.date,
      amount: data.amount,
      createdAt: data.created_at,
    } as UsageRecord;
  } catch (error) {
    console.error("Error in createUsageRecord:", error);
    throw error;
  }
}

// Delete functions
export async function deleteWorker(id: string) {
  try {
    const { error } = await supabase.from("workers").delete().eq("id", id);
    if (error) {
      console.error("Supabase error deleting worker:", error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error("Error in deleteWorker:", error);
    throw error;
  }
}

export async function deleteWorkRecord(id: string) {
  try {
    const { error } = await supabase.from("work_records").delete().eq("id", id);
    if (error) {
      console.error("Supabase error deleting work record:", error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error("Error in deleteWorkRecord:", error);
    throw error;
  }
}

export async function deleteUsageRecord(id: string) {
  try {
    const { error } = await supabase
      .from("usage_records")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("Supabase error deleting usage record:", error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error("Error in deleteUsageRecord:", error);
    throw error;
  }
}
