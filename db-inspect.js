const { Client } = require("pg");

const connectionString =
  "postgresql://postgres:TPQQDA1paSGqphH2@db.htkpmrfhoijznigwimwj.supabase.co:5432/postgres";

const client = new Client({
  connectionString: connectionString,
  ssl: true,
  application_name: "db_inspector",
});

async function inspectDatabase() {
  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL database\n");

    // Get all tables
    const tablesQuery = `
      SELECT 
        schemaname,
        tablename,
        tableowner
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    const tablesResult = await client.query(tablesQuery);
    console.log("📊 PUBLIC TABLES (" + tablesResult.rows.length + " total):\n");
    console.log("┌─ Table Name ─────────────────────┬─ Owner ──┐");

    for (const table of tablesResult.rows) {
      console.log(
        `│ ${table.tablename.padEnd(33)} │ ${table.tableowner.padEnd(8)} │`,
      );
    }
    console.log("└───────────────────────────────────┴──────────┘\n");

    // Get detailed schema for each table
    console.log("📋 DETAILED TABLE STRUCTURE:\n");

    for (const table of tablesResult.rows) {
      const columnQuery = `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = '${table.tablename}'
        ORDER BY ordinal_position;
      `;

      const columnsResult = await client.query(columnQuery);

      // Check for RLS
      const rlsQuery = `
        SELECT rowsecurity FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = '${table.tablename}';
      `;

      const rlsResult = await client.query(rlsQuery);
      const rlsEnabled = rlsResult.rows[0]?.rowsecurity
        ? "✅ RLS ON"
        : "⚠️  RLS OFF";

      // Get row count
      const countQuery = `SELECT COUNT(*) as count FROM public."${table.tablename}";`;
      const countResult = await client.query(countQuery);
      const rowCount = countResult.rows[0].count;

      console.log(`\n🔹 ${table.tablename} [${rlsEnabled}] (${rowCount} rows)`);
      console.log("   ├─ Columns:");

      for (const col of columnsResult.rows) {
        const nullable = col.is_nullable === "YES" ? "NULL" : "NOT NULL";
        const defaultVal = col.column_default ? ` = ${col.column_default}` : "";
        console.log(
          `   │  • ${col.column_name} (${col.data_type}) [${nullable}]${defaultVal}`,
        );
      }
    }

    console.log("\n\n✅ Database inspection complete!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

inspectDatabase();
