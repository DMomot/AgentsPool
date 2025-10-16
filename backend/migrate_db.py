#!/usr/bin/env python3
"""Quick database migration script"""
import psycopg2

def main():
    conn = psycopg2.connect('postgresql://postgres:JGgehRqYMLPrmSnvJgwQYntgQeANwHiU@turntable.proxy.rlwy.net:11480/railway')
    cur = conn.cursor()

    # Check if demo_url exists
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='agents' AND column_name='demo_url'")
    if cur.fetchone():
        print('Found demo_url column, renaming to url...')
        cur.execute('ALTER TABLE agents RENAME COLUMN demo_url TO url')
        conn.commit()
        print('✅ Renamed demo_url to url')
    else:
        print('✅ Column already named url (or demo_url does not exist)')

    # Check if a2a and img_url exist
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='agents' AND column_name='a2a'")
    if not cur.fetchone():
        print('Adding a2a column...')
        cur.execute('ALTER TABLE agents ADD COLUMN a2a VARCHAR(500)')
        conn.commit()
        print('✅ Added a2a column')
    else:
        print('✅ a2a column already exists')

    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='agents' AND column_name='img_url'")
    if not cur.fetchone():
        print('Adding img_url column...')
        cur.execute('ALTER TABLE agents ADD COLUMN img_url VARCHAR(500)')
        conn.commit()
        print('✅ Added img_url column')
    else:
        print('✅ img_url column already exists')

    conn.close()
    print('✅ All migrations completed successfully')

if __name__ == '__main__':
    main()

