#!/usr/bin/env python3
"""
Database Migration Script
Exports data from old database and imports to new Railway database
"""

import os
import sys
import subprocess
from datetime import datetime

# Old database (source)
OLD_DB_URL = "postgresql://primeagents_user:b694e983cc198e7e34f52cfa1dc8d32f@gondola.proxy.rlwy.net:22252/railway"

# New database (target) - will be set from Railway environment
NEW_DB_URL = os.getenv("DATABASE_URL", "")

def check_pg_dump():
    """Check if pg_dump is installed"""
    try:
        subprocess.run(["pg_dump", "--version"], capture_output=True, check=True)
        print("✅ pg_dump is installed")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ pg_dump not found. Please install PostgreSQL client tools:")
        print("   macOS: brew install postgresql")
        print("   Ubuntu: sudo apt-get install postgresql-client")
        return False

def export_database():
    """Export data from old database"""
    print("\n📤 Exporting data from old database...")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    dump_file = f"database_backup_{timestamp}.sql"
    
    try:
        # Export schema and data
        cmd = [
            "pg_dump",
            "--no-owner",
            "--no-acl",
            "--clean",
            "--if-exists",
            OLD_DB_URL,
            "-f", dump_file
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ Database exported successfully to: {dump_file}")
            return dump_file
        else:
            print(f"❌ Export failed: {result.stderr}")
            return None
            
    except Exception as e:
        print(f"❌ Error during export: {e}")
        return None

def import_database(dump_file):
    """Import data to new database"""
    if not NEW_DB_URL:
        print("❌ NEW_DB_URL not set. Please set DATABASE_URL environment variable")
        return False
    
    print(f"\n📥 Importing data to new database...")
    
    try:
        # Import using psql
        cmd = f"psql {NEW_DB_URL} < {dump_file}"
        
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Database imported successfully!")
            return True
        else:
            print(f"❌ Import failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error during import: {e}")
        return False

def verify_migration():
    """Verify that migration was successful"""
    print("\n🔍 Verifying migration...")
    
    try:
        from sqlalchemy import create_engine, text
        
        if not NEW_DB_URL:
            print("⚠️  Cannot verify: DATABASE_URL not set")
            return
        
        engine = create_engine(NEW_DB_URL)
        
        with engine.connect() as conn:
            # Check tables exist
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            
            tables = [row[0] for row in result]
            
            if tables:
                print(f"✅ Found {len(tables)} tables: {', '.join(tables)}")
                
                # Count records in main tables
                for table in ['categories', 'agents', 'reviews']:
                    if table in tables:
                        count_result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                        count = count_result.scalar()
                        print(f"   - {table}: {count} records")
            else:
                print("⚠️  No tables found in database")
                
    except Exception as e:
        print(f"⚠️  Verification error: {e}")

def main():
    """Main migration process"""
    print("=" * 60)
    print("🔄 Database Migration Tool")
    print("=" * 60)
    
    # Check prerequisites
    if not check_pg_dump():
        sys.exit(1)
    
    # Step 1: Export
    dump_file = export_database()
    if not dump_file:
        print("\n❌ Migration failed at export step")
        sys.exit(1)
    
    # Step 2: Import (only if NEW_DB_URL is set)
    if NEW_DB_URL:
        success = import_database(dump_file)
        if success:
            verify_migration()
            print("\n" + "=" * 60)
            print("✅ Migration completed successfully!")
            print("=" * 60)
        else:
            print("\n❌ Migration failed at import step")
            print(f"💾 Backup saved to: {dump_file}")
            sys.exit(1)
    else:
        print("\n" + "=" * 60)
        print("✅ Export completed!")
        print(f"💾 Backup saved to: {dump_file}")
        print("\nTo import to Railway database:")
        print("1. Set DATABASE_URL: export DATABASE_URL='your-railway-postgres-url'")
        print(f"2. Run: psql $DATABASE_URL < {dump_file}")
        print("=" * 60)

if __name__ == "__main__":
    main()
