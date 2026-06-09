const { Client } = require("pg");

const client = new Client({
  host: "db.htkpmrfhoijznigwimwj.supabase.co",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "TPQQDA1paSGqphH2",
});

async function fetchSchema() {
  try {
    await client.connect();
    console.log("✅ Connected to Supabase database\n");

    // Get all tables
    const tablesResult = await client.query(`
      SELECT 
        table_schema,
        table_name,
        (SELECT string_agg(column_name || ':' || data_type, ', ')
         FROM information_schema.columns 
         WHERE table_schema = t.table_schema AND table_name = t.table_name) as columns
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log(
      `📊 SUPABASE DATABASE SCHEMA - ${tablesResult.rows.length} tables\n`,
    );
    console.log("=====================================\n");

    tablesResult.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.table_name}`);
      console.log(`   Columns: ${row.columns}`);
      console.log();
    });

    // Get RLS status
    const rlsResult = await client.query(`
      SELECT 
        t.table_name,
        (t.table_privileges -> 0 ->> 'grantee' IS NOT NULL) as rls_enabled
      FROM information_schema.tables t
      WHERE t.table_schema = 'public'
      ORDER BY t.table_name
    `);

    // Get actual RLS status from pg_tables
    const pgRlsResult = await client.query(`
      SELECT tablename, rowsecurity FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log("\n=====================================");
    console.log("🔐 ROW LEVEL SECURITY STATUS\n");

    let enabledCount = 0;
    let disabledCount = 0;

    pgRlsResult.rows.forEach((row) => {
      const status = row.rowsecurity ? "✅ ENABLED" : "⚠️  DISABLED";
      console.log(`${row.tablename}: ${status}`);
      if (row.rowsecurity) enabledCount++;
      else disabledCount++;
    });

    console.log(
      `\n📊 Summary: ${enabledCount} enabled, ${disabledCount} disabled`,
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

fetchSchema();
