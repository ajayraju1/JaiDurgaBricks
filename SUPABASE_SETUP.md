# Supabase Integration Setup

This document explains how to set up Supabase for the Bricks application.

## Prerequisites

- A Supabase account - [Sign up here](https://supabase.com)
- A Supabase project

## Setup Steps

### 1. Create a Supabase Project

1. Log in to your Supabase account
2. Create a new project
3. Note your project's URL and anon key (public API key)

### 2. Create Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of the `supabase_schema.sql` file into the SQL editor
3. Run the SQL commands to set up your database tables and functions

### 3. Configure Environment Variables

In your project, create or update the `.env.local` file with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_supabase_url` and `your_supabase_anon_key` with the actual values from your Supabase project settings.

### 4. Run the Application

Start your development server:

```
npm run dev
```

## Database Structure

The application uses three main tables:

1. **workers** - Stores information about workers
2. **work_records** - Tracks work done by workers
3. **usage_records** - Tracks payments or advances given to workers

## Additional Notes

- The application currently does not implement authentication. All database operations are allowed through the Row Level Security policies.
- If you need to modify the schema, consider creating a new migration script to avoid data loss.
- For production deployment, consider implementing authentication and more restrictive security policies.
