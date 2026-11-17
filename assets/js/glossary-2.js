/* Glossary & Command Reference — part 2: T-SQL commands and constructs. */

window.GLOSSARY = (window.GLOSSARY || []).concat([

  {
    term: "SELECT",
    cat: "T-SQL Commands",
    say: "select",
    short: "Reads rows from tables, views or functions — the most-used T-SQL statement.",
    what: "SELECT retrieves data. A basic SELECT lists columns from one table with a FROM clause; WHERE filters rows, GROUP BY aggregates them, HAVING filters groups, ORDER BY sorts the result and TOP or OFFSET/FETCH limits it. Joins combine rows from several tables. SELECT is also used to call functions and to assign variables.",
    why: "A DBA reads more than writes. SELECT over catalog views and DMVs is how you interrogate the instance instead of guessing.",
    syntax: "SELECT c.CustomerName, count(o.OrderID) AS order_count\nFROM   dbo.Customers c\nJOIN   dbo.Orders o ON o.CustomerID = c.CustomerID\nWHERE  o.OrderDate >= '20260101'\nGROUP BY c.CustomerName\nHAVING count(o.OrderID) > 5\nORDER BY order_count DESC;",
    how: [
      "Always specify columns instead of SELECT * in production queries and views.",
      "Filter early with WHERE so fewer rows need to be joined and sorted.",
      "Check the execution plan if a simple SELECT is slow.",
      "Use SELECT against sys.* and dm_* views to verify server state."
    ],
    pitfalls: [
      "SELECT * makes a view or procedure brittle when columns are added.",
      "Applying a function to a column in WHERE can turn a seek into a scan."
    ],
    see: ["ch02-04", "ch02-09", "practical-01"]
  },

  {
    term: "INSERT",
    cat: "T-SQL Commands",
    say: "in-sert",
    short: "Adds new rows to a table.",
    what: "INSERT adds one or more rows. You can supply explicit values, insert the results of a SELECT, or use OUTPUT to capture the rows that were created. Identity and computed columns are usually generated for you. Every insert writes both data pages and log records.",
    why: "Inserts are the most common write operation and their pattern affects locking, log growth and index maintenance.",
    syntax: "INSERT INTO dbo.Customers (CustomerName, Email)\nVALUES (N'Ada Lovelace', N'ada@example.com');\nGO\n-- Insert many rows from a query, capturing generated IDs\nINSERT INTO dbo.Orders (CustomerID, OrderDate)\nOUTPUT inserted.OrderID\nSELECT CustomerID, SYSDATETIME()\nFROM   dbo.Customers\nWHERE  IsActive = 1;",
    how: [
      "List the target columns explicitly so defaults and identities work correctly.",
      "For large loads, use a set-based INSERT ... SELECT rather than a row-by-row loop.",
      "Wrap related inserts in a transaction.",
      "Use OUTPUT to retrieve generated keys without an extra round trip."
    ],
    pitfalls: [
      "Omitting a NOT NULL column without a default — the statement fails.",
      "Bulk inserting without updating statistics afterwards."
    ],
    see: ["ch02-05", "ch02-09", "practical-01"]
  },

  {
    term: "UPDATE",
    cat: "T-SQL Commands",
    say: "up-date",
    short: "Modifies existing rows.",
    what: "UPDATE changes column values in rows matching a WHERE clause. Without a WHERE, every row is changed — one of the most dangerous mistakes in SQL Server. A wide update touches many pages, generates lots of log, takes locks and can escalate them to a table lock.",
    why: "Updates drive log growth, blocking and index fragmentation; a badly scoped update is a classic production incident.",
    syntax: "-- Always test the WHERE with a SELECT first\nSELECT * FROM dbo.Products WHERE CategoryID = 7;\nGO\nUPDATE dbo.Products\nSET    UnitPrice = UnitPrice * 1.05\nWHERE  CategoryID = 7;\nGO\n-- Capture old and new values\nUPDATE dbo.Products\nSET    UnitPrice = UnitPrice * 1.05\nOUTPUT deleted.UnitPrice AS old_price, inserted.UnitPrice AS new_price\nWHERE  CategoryID = 7;",
    how: [
      "Run the same predicate as a SELECT first and check the row count.",
      "Wrap the update in BEGIN TRAN / ROLLBACK while testing.",
      "Index the WHERE columns so fewer rows are locked.",
      "For huge updates, batch them to keep transactions short."
    ],
    pitfalls: [
      "Forgetting WHERE and updating the entire table.",
      "Updating a column used as a clustered key — this moves rows and rewrites nonclustered indexes."
    ],
    see: ["ch02-09", "ch13-05", "practical-01"]
  },

  {
    term: "DELETE",
    cat: "T-SQL Commands",
    say: "de-lete",
    short: "Removes rows from a table, one row at a time, with full logging.",
    what: "DELETE removes rows matching a WHERE clause and logs each row removal, so it can be rolled back and can fire triggers. It leaves empty space in pages rather than resetting the table. For removing every row, TRUNCATE TABLE is usually faster but has important restrictions.",
    why: "Large deletes cause log growth, blocking and long rollbacks. They are a frequent cause of 2 a.m. incidents.",
    syntax: "BEGIN TRAN;\nDELETE FROM dbo.OrderArchive\nWHERE  OrderDate < '20200101';\n-- Check @@ROWCOUNT before committing\nSELECT @@ROWCOUNT AS rows_deleted;\nROLLBACK;  -- change to COMMIT when satisfied",
    how: [
      "Test the predicate with SELECT COUNT(*) first.",
      "Delete in batches (for example TOP 10000 in a loop) to keep the transaction short.",
      "Take a log backup afterwards if the log grew significantly.",
      "Consider partitioning and switching out old data for very large tables."
    ],
    pitfalls: [
      "Deleting millions of rows in one transaction — the rollback can take as long as the delete.",
      "Assuming DELETE reclaims space to the operating system — it usually does not."
    ],
    see: ["ch02-09", "ch15-14", "practical-01"]
  },

  {
    term: "TRUNCATE TABLE",
    cat: "T-SQL Commands",
    say: "trun-cate",
    short: "Removes every row from a table quickly by deallocating pages, not by logging each row.",
    what: "TRUNCATE TABLE empties a table by deallocating its data pages rather than deleting rows individually. It is minimally logged, cannot use a WHERE clause, does not fire DELETE triggers, resets identity counters, and cannot be used if the table is referenced by a foreign key. It requires ALTER permission on the table.",
    why: "It is the right tool for clearing staging tables, but a dangerous one in production because it cannot be rolled back in the usual way and cannot be point-in-time recovered if a log backup chain is missing.",
    syntax: "TRUNCATE TABLE dbo.StagingOrders;\nGO\n-- For a table referenced by a foreign key, DELETE is required\nDELETE FROM dbo.OrderItems;",
    how: [
      "Use it for scratch and staging tables that are rebuilt every run.",
      "Use DELETE when a WHERE clause, triggers or FK references are involved.",
      "Take a full or log backup before truncating a table whose data might be needed.",
      "Remember that a truncate inside a transaction can be rolled back, but only if the transaction is still open."
    ],
    pitfalls: [
      "Running TRUNCATE on a production table intending to delete only recent rows.",
      "Assuming identity values continue — they restart from the seed."
    ],
    see: ["ch02-09", "ch15-14", "practical-03"]
  },

  {
    term: "CREATE TABLE / ALTER TABLE",
    cat: "T-SQL Commands",
    say: "create table / alter table",
    short: "Defines a new table or changes the structure of an existing one.",
    what: "CREATE TABLE defines columns, data types, nullability, defaults and constraints. ALTER TABLE adds or drops columns and constraints, and can switch a table to a different filegroup or partition scheme. Structural changes take schema modification locks and may require table rebuilds.",
    why: "Schema design decisions here determine storage, index width and which business rules the database can enforce.",
    syntax: "CREATE TABLE dbo.Products\n(\n  ProductID  int IDENTITY(1,1) NOT NULL,\n  Name       nvarchar(100) NOT NULL,\n  UnitPrice  decimal(12,2) NOT NULL,\n  CreatedAt  datetime2(0) NOT NULL DEFAULT SYSDATETIME(),\n  CONSTRAINT PK_Products PRIMARY KEY (ProductID),\n  CONSTRAINT CK_Products_Price CHECK (UnitPrice >= 0)\n);\nGO\nALTER TABLE dbo.Products ADD IsActive bit NOT NULL DEFAULT 1;",
    how: [
      "Choose the narrowest data type that safely fits the values.",
      "Declare PRIMARY KEY, UNIQUE, CHECK and DEFAULT constraints at creation time.",
      "Add columns with a DEFAULT rather than allowing NULLs where business rules require a value.",
      "Test schema changes on a copy first — some ALTERs rebuild the whole table."
    ],
    pitfalls: [
      "Using nvarchar(MAX) or float for everything 'just in case'.",
      "Dropping a column that an index, view or procedure still references."
    ],
    see: ["ch02-04", "ch02-06", "practical-01"]
  },

  {
    term: "CREATE DATABASE / ALTER DATABASE",
    cat: "T-SQL Commands",
    say: "create database / alter database",
    short: "Creates a database or changes its files, options, recovery model and state.",
    what: "CREATE DATABASE establishes the database and its initial data and log files. ALTER DATABASE modifies almost everything else: adding files and filegroups, changing recovery model, setting compatibility level, moving files, setting options such as QUERY_STORE or READ_COMMITTED_SNAPSHOT, and changing state with SET OFFLINE/ONLINE/EMERGENCY.",
    why: "This is the command family you use for capacity changes, recovery model decisions, upgrades and file moves.",
    syntax: "CREATE DATABASE Orders\nON PRIMARY\n( NAME = Orders_Data,\n  FILENAME = 'D:\\Data\\Orders.mdf',\n  SIZE = 2GB, FILEGROWTH = 512MB )\nLOG ON\n( NAME = Orders_Log,\n  FILENAME = 'L:\\Log\\Orders.ldf',\n  SIZE = 1GB, FILEGROWTH = 512MB );\nGO\nALTER DATABASE Orders SET RECOVERY FULL;\nGO\nALTER DATABASE Orders MODIFY FILE\n( NAME = Orders_Data, FILENAME = 'E:\\Data\\Orders.mdf' );",
    how: [
      "Decide file paths and sizes before creating the database.",
      "Use logical names in ALTER DATABASE, not physical paths.",
      "Set recovery model and max size deliberately at creation.",
      "For a file move: MODIFY FILE, take OFFLINE, move the file in Windows, bring ONLINE."
    ],
    pitfalls: [
      "Moving the physical file before updating the catalogue.",
      "Accepting default percentage autogrowth on a large production database."
    ],
    see: ["ch06-01", "ch06-02", "ch06-15", "practical-02"]
  },

  {
    term: "PRIMARY KEY",
    cat: "T-SQL Commands",
    say: "primary key",
    short: "A constraint that uniquely identifies every row in a table and cannot be NULL.",
    what: "A primary key enforces uniqueness and non-null values, and by default creates a clustered index that defines the table's physical order. A table can have only one primary key. It is the canonical way for other tables to reference this one through a foreign key.",
    why: "It guarantees every row is addressable and gives the optimiser a powerful access path.",
    syntax: "-- Inline\nCREATE TABLE dbo.Customers\n( CustomerID int IDENTITY(1,1) PRIMARY KEY,\n  Email nvarchar(256) NOT NULL );\nGO\n-- Named, as a table constraint\nALTER TABLE dbo.Customers\nADD CONSTRAINT PK_Customers PRIMARY KEY (CustomerID);",
    how: [
      "Prefer a narrow, stable key such as an identity integer.",
      "Name the constraint explicitly so error messages and scripts are clear.",
      "Decide deliberately whether it should be CLUSTERED or NONCLUSTERED.",
      "Verify with sys.key_constraints."
    ],
    pitfalls: [
      "Using a natural key that can change — updates then ripple through every referencing table.",
      "Assuming the primary key must be clustered; it need not be."
    ],
    see: ["ch02-05", "ch02-06", "practical-01"]
  },

  {
    term: "FOREIGN KEY",
    cat: "T-SQL Commands",
    say: "for-eign key",
    short: "A constraint that enforces a valid relationship between two tables.",
    what: "A foreign key requires that values in a column match values in a referenced table's key. It prevents orphan rows, for example an order for a customer that does not exist. You can define what happens on DELETE or UPDATE of the parent: NO ACTION, CASCADE, SET NULL or SET DEFAULT.",
    why: "It protects data integrity at the storage layer, regardless of which application or import writes the data.",
    syntax: "ALTER TABLE dbo.Orders\nADD CONSTRAINT FK_Orders_Customers\nFOREIGN KEY (CustomerID) REFERENCES dbo.Customers(CustomerID);\nGO\n-- Check all foreign keys and whether they are trusted\nSELECT name, is_disabled, is_not_trusted,\n       delete_referential_action_desc\nFROM   sys.foreign_keys;",
    how: [
      "Create the referenced key first, then the foreign key.",
      "Index the referencing column — SQL Server does not do this automatically.",
      "Use CASCADE carefully; it can delete far more than you expect.",
      "Check is_not_trusted after a NOCHECK load."
    ],
    pitfalls: [
      "Disabling a foreign key for a bulk load and never re-enabling it with CHECK.",
      "Assuming a foreign key creates an index — it does not."
    ],
    see: ["ch02-05", "ch02-07", "practical-01"]
  },

  {
    term: "UNIQUE / CHECK / DEFAULT constraints",
    cat: "T-SQL Commands",
    say: "unique / check / default",
    short: "Rules that prevent duplicates, reject invalid values, and supply values when none are given.",
    what: "UNIQUE prevents duplicate values in a column (SQL Server allows one NULL). CHECK rejects values that fail a Boolean rule, such as Quantity > 0. DEFAULT supplies a value when an INSERT omits the column, such as SYSDATETIME() for a created date. All are enforced by the database, not by application code.",
    why: "They are the last line of defence against bad data from imports, scripts and buggy applications.",
    syntax: "ALTER TABLE dbo.OrderItems\nADD CONSTRAINT UQ_OrderItems_Ref UNIQUE (ReferenceCode);\nGO\nALTER TABLE dbo.OrderItems\nADD CONSTRAINT CK_OrderItems_Qty CHECK (Quantity > 0);\nGO\nALTER TABLE dbo.OrderItems\nADD CONSTRAINT DF_OrderItems_Created DEFAULT SYSDATETIME() FOR CreatedAt;",
    how: [
      "Encode business rules as constraints, not only in application validation.",
      "Name constraints consistently so failures are readable.",
      "Re-enable constraints with WITH CHECK after a bulk load.",
      "Inspect them in sys.check_constraints and sys.default_constraints."
    ],
    pitfalls: [
      "Using WITH NOCHECK to load bad data and leaving the constraint untrusted.",
      "Assuming a CHECK constraint validates existing rows when added with NOCHECK."
    ],
    see: ["ch02-06", "practical-01"]
  },

  {
    term: "CREATE VIEW",
    cat: "T-SQL Commands",
    say: "create view",
    short: "A saved SELECT that behaves like a virtual table.",
    what: "A view stores a query definition rather than data. When you SELECT from a view, SQL Server expands the definition into the underlying query. Views simplify complex joins, provide a stable interface when tables change, and can restrict access to certain columns or rows.",
    why: "Views are a clean way to give reports and applications a stable, permission-controlled shape over changing tables.",
    syntax: "CREATE VIEW dbo.vw_OrderSummary\nAS\nSELECT c.CustomerID, c.CustomerName,\n       count(o.OrderID) AS order_count,\n       sum(o.Amount) AS total_amount\nFROM   dbo.Customers c\nJOIN   dbo.Orders o ON o.CustomerID = c.CustomerID\nGROUP BY c.CustomerID, c.CustomerName;\nGO\nSELECT * FROM dbo.vw_OrderSummary;",
    how: [
      "Use views to hide complexity and standardise calculations.",
      "Grant permissions on the view rather than the base tables where appropriate.",
      "Avoid SELECT * in the view definition so it does not break when columns change.",
      "Consider indexed (materialised) views only for carefully measured workloads."
    ],
    pitfalls: [
      "Nesting many views — expansion can produce unreadable, slow plans.",
      "Using ORDER BY in a view without TOP or OFFSET — it is not allowed."
    ],
    see: ["ch02-11", "ch09-16", "practical-01"]
  },

  {
    term: "CREATE PROCEDURE",
    cat: "T-SQL Commands",
    say: "create pro-ce-dure",
    short: "A named, parameterised batch of T-SQL stored in the database — often shortened to 'proc'.",
    what: "A stored procedure encapsulates logic with input and output parameters. It is compiled once and its plan cached for reuse, can enforce a permission boundary (grant EXECUTE, not SELECT on base tables), and gives a stable interface that can change without redeploying the application.",
    why: "Procedures centralise business logic, reduce plan-cache pollution from ad-hoc SQL and make security simpler.",
    syntax: "CREATE PROCEDURE dbo.usp_GetCustomerOrders\n  @CustomerID int,\n  @FromDate   date = NULL\nAS\nBEGIN\n  SET NOCOUNT ON;\n  SELECT OrderID, OrderDate, Amount\n  FROM   dbo.Orders\n  WHERE  CustomerID = @CustomerID\n    AND  (@FromDate IS NULL OR OrderDate >= @FromDate)\n  ORDER BY OrderDate DESC;\nEND;\nGO\nEXEC dbo.usp_GetCustomerOrders @CustomerID = 42;",
    how: [
      "Use parameters for all variable inputs; never concatenate user values into SQL.",
      "Use SET NOCOUNT ON to avoid extra result sets that confuse applications.",
      "Handle errors with TRY/CATCH and transactions where writes occur.",
      "Check the cached plan if performance varies by parameter value."
    ],
    pitfalls: [
      "Using optional predicates such as @p IS NULL OR col = @p — they often produce poor plans.",
      "Granting sysadmin or db_owner just to make a procedure run."
    ],
    see: ["ch02-11", "ch12-19", "practical-01"]
  },

  {
    term: "EXEC / EXECUTE",
    cat: "T-SQL Commands",
    say: "ex-ec",
    short: "Runs a stored procedure, a dynamic SQL string, or a linked-server command.",
    what: "EXEC calls a stored procedure, optionally with named or positional parameters. It can also execute a character string of dynamic SQL, and with EXEC ... AT a linked server it runs a command remotely. sp_executesql is usually preferable to EXEC for dynamic SQL because it supports parameterisation and better plan reuse.",
    why: "It is how applications invoke database logic, and a common source of security problems when user input is concatenated into dynamic SQL.",
    syntax: "EXEC dbo.usp_GetCustomerOrders @CustomerID = 42;\nGO\n-- Safer dynamic SQL with parameterisation\nDECLARE @sql nvarchar(max) = N'SELECT * FROM dbo.Orders WHERE CustomerID = @id;';\nEXEC sp_executesql @sql, N'@id int', @id = 42;",
    how: [
      "Prefer sp_executesql with parameters over string concatenation.",
      "Use named parameters so callers do not depend on parameter order.",
      "Grant EXECUTE on the procedure rather than permissions on base tables.",
      "Check sys.dm_exec_requests or Query Store when a call runs long."
    ],
    pitfalls: [
      "SQL injection through concatenated input — never build SQL from user text without parameters.",
      "Assuming EXEC returns a status you can check — capture RETURN values explicitly."
    ],
    see: ["ch02-11", "ch09-15", "practical-01"]
  },

  {
    term: "TRY...CATCH",
    cat: "T-SQL Commands",
    say: "try catch",
    short: "T-SQL's error-handling structure: run code in TRY, handle failures in CATCH.",
    what: "Statements in the TRY block run until an error occurs; control then passes to the CATCH block, where you can log the error, roll back a transaction and rethrow it. Functions such as ERROR_MESSAGE(), ERROR_NUMBER() and XACT_STATE() give details about what failed and the transaction state.",
    why: "Without TRY/CATCH, a failure halfway through a multi-statement operation can leave a transaction open and locks held.",
    syntax: "BEGIN TRY\n  BEGIN TRAN;\n  INSERT dbo.Orders (CustomerID) VALUES (42);\n  COMMIT;\nEND TRY\nBEGIN CATCH\n  IF XACT_STATE() <> 0 ROLLBACK;\n  SELECT ERROR_NUMBER() AS err_no, ERROR_MESSAGE() AS err_msg;\n  THROW;\nEND CATCH;",
    how: [
      "Wrap any multi-statement write in TRY/CATCH with an explicit transaction.",
      "Check XACT_STATE() before rolling back — it may be -1 (uncommittable).",
      "Use THROW to preserve the original error for the caller.",
      "Log errors to a table if you need an audit trail."
    ],
    pitfalls: [
      "Swallowing the error by not rethrowing — callers then think the work succeeded.",
      "Assuming CATCH handles compile errors in the same batch — many do not."
    ],
    see: ["ch02-13", "ch02-14", "practical-01"]
  },

  {
    term: "GO",
    cat: "T-SQL Commands",
    say: "go",
    short: "A client-side batch separator, not a T-SQL statement.",
    what: "GO tells SSMS, sqlcmd or another client to send the preceding statements to SQL Server as one batch. Variables declared in one batch are not visible in the next, and CREATE PROCEDURE or CREATE VIEW must usually be the first statement in a batch. GO is not understood by the server itself.",
    why: "It controls compilation boundaries. Misplacing GO is a frequent cause of 'CREATE VIEW must be the only statement in the batch' errors.",
    syntax: "USE Orders;\nGO\nDECLARE @db sysname = DB_NAME();\nSELECT @db AS current_db;\nGO\n-- @db no longer exists here\nCREATE VIEW dbo.vw_Active AS SELECT * FROM dbo.Customers WHERE IsActive = 1;\nGO",
    how: [
      "Place GO after USE, after CREATE PROCEDURE/VIEW/FUNCTION bodies, and where variable scope should end.",
      "Remember it is a client directive — it cannot appear inside a stored procedure.",
      "In application code, send batches explicitly instead of embedding GO."
    ],
    pitfalls: [
      "Expecting a variable declared before GO to be available after it.",
      "Using GO inside a procedure body."
    ],
    see: ["ch02-09", "practical-01"]
  },

  {
    term: "USE",
    cat: "T-SQL Commands",
    say: "use",
    short: "Sets the current database for the connection.",
    what: "USE switches the database context of the current session. Unqualified object names then resolve in that database. It is a session setting, so it persists until changed or the connection closes. Fully qualified names such as Sales.dbo.Orders work regardless of context.",
    why: "Running a script against the wrong database is a classic and avoidable production mistake.",
    syntax: "USE Orders;\nGO\nSELECT DB_NAME() AS current_database;\nGO\n-- Fully qualified name is context-independent\nSELECT count(*) FROM Orders.dbo.Customers;",
    how: [
      "Start every script with USE <database>; GO.",
      "Confirm with SELECT DB_NAME() before destructive statements.",
      "Prefer fully qualified names in production deployment scripts."
    ],
    pitfalls: ["Assuming USE affects other connections — it does not."],
    see: ["ch02-09", "practical-01"]
  },

  {
    term: "KILL",
    cat: "T-SQL Commands",
    say: "kill",
    short: "Terminates a user session (SPID), rolling back its transaction.",
    what: "KILL <session_id> ends a connection. Any open transaction is rolled back, which can take time if it changed a lot of data. KILL is the last resort for a runaway query or the head blocker, and should only be used after confirming the session and getting approval in production.",
    why: "It restores service quickly in a blocking or runaway-query incident, but the rollback itself can be expensive.",
    syntax: "-- Inspect first\nSELECT session_id, status, command, blocking_session_id,\n       wait_type, total_elapsed_time\nFROM   sys.dm_exec_requests\nWHERE  session_id = 62;\nGO\n-- Then, with approval\nKILL 62;\nGO\n-- Watch rollback progress\nSELECT session_id, status, percent_complete\nFROM   sys.dm_exec_requests WHERE session_id = 62;",
    how: [
      "Identify the exact session with sys.dm_exec_requests and its SQL text.",
      "Check whether it is the head blocker or merely a victim.",
      "Get application-owner approval in production.",
      "Monitor percent_complete after KILL — rollback may take minutes."
    ],
    pitfalls: [
      "Killing a system session or a replication agent — SQL Server will refuse or cause an outage.",
      "Killing victims instead of the head blocker, which changes nothing."
    ],
    see: ["ch13-23", "ch13-04", "practical-08"]
  },

  {
    term: "WAITFOR",
    cat: "T-SQL Commands",
    say: "wait-for",
    short: "Pauses execution for a time interval or until a specific time.",
    what: "WAITFOR DELAY 'HH:MM:SS' pauses for a duration; WAITFOR TIME 'HH:MM:SS' waits until a clock time. It is mainly used in tests, demonstrations and controlled lab exercises — for example holding a transaction open to reproduce blocking.",
    why: "Useful for safely simulating long-running work in a lab, but it has no place in normal application code.",
    syntax: "WAITFOR DELAY '00:00:30';\nSELECT 'resumed' AS status;\nGO\nWAITFOR TIME '02:00:00';\nEXEC dbo.usp_NightlyJob;",
    how: [
      "Use it in labs to hold locks and reproduce blocking.",
      "Use it in test scripts to simulate a slow query.",
      "Never leave a WAITFOR in a production job unless a delay is genuinely required."
    ],
    pitfalls: ["A long WAITFOR inside a transaction holds locks for the whole wait."],
    see: ["practical-08", "ch13-01"]
  },

  {
    term: "SET STATISTICS IO / TIME",
    cat: "T-SQL Commands",
    say: "set statistics I-O / time",
    short: "Shows how much logical/physical I/O and CPU time a query consumed.",
    what: "SET STATISTICS IO ON reports logical reads (pages read from cache), physical reads (pages read from disk) and read-ahead reads for each table touched. SET STATISTICS TIME ON reports parse, compile and execution time. They are the simplest way to measure whether an indexing change actually helped.",
    why: "Performance tuning must be measured. Logical reads are the most useful single number for comparing two versions of a query.",
    syntax: "SET STATISTICS IO ON;\nSET STATISTICS TIME ON;\nGO\nSELECT * FROM dbo.Orders WHERE CustomerID = 42;\nGO\nSET STATISTICS IO OFF;\nSET STATISTICS TIME OFF;",
    how: [
      "Record the baseline reads before changing anything.",
      "Change one index or predicate, then re-run and compare logical reads.",
      "Combine with an actual execution plan for the full picture.",
      "Turn the settings off when finished to avoid noisy output."
    ],
    pitfalls: ["Comparing results when the cache state differs wildly — run each query a few times."],
    see: ["ch12-02", "ch12-21", "practical-07"]
  },

  {
    term: "DBCC (family)",
    cat: "T-SQL Commands",
    say: "D-B-C-C",
    short: "Database Console Commands — a family of administrative, diagnostic and maintenance commands.",
    what: "DBCC commands inspect or change internal state. Common ones include DBCC CHECKDB (integrity), DBCC CHECKALLOC, DBCC CHECKTABLE, DBCC CHECKCATALOG, DBCC SHRINKFILE, DBCC INPUTBUFFER (what a session last sent), DBCC OPENTRAN (oldest open transaction), DBCC FLUSHPROCINDCACHE and DBCC TRACEON. Not all DBCC commands are safe to run casually in production.",
    why: "DBCC is the primary built-in toolkit for integrity and troubleshooting — knowing which command to reach for matters.",
    syntax: "DBCC INPUTBUFFER(62);\nGO\nDBCC OPENTRAN;\nGO\nDBCC SHRINKFILE (Orders_Log, 2048);\nGO\nDBCC TRACEON (3604, -1);  -- diagnostic, use with care",
    how: [
      "Use DBCC INPUTBUFFER to see the last statement a blocking session sent.",
      "Use DBCC OPENTRAN to find the oldest open transaction before a log fills.",
      "Use the CHECK* family for a full integrity check; see the DBCC CHECKDB entry.",
      "Treat SHRINKFILE as a one-off, not routine maintenance."
    ],
    pitfalls: [
      "Running DBCC SHRINKDATABASE on a schedule — it fragments indexes.",
      "Enabling undocumented trace flags in production without support guidance."
    ],
    see: ["ch14-08", "ch14-16", "ch10-14"]
  },

  {
    term: "sys.* catalog views",
    cat: "T-SQL Commands",
    say: "sys catalog views",
    short: "Read-only views that expose the metadata of the database and instance.",
    what: "The system catalog is a set of views such as sys.databases, sys.tables, sys.columns, sys.indexes, sys.database_files, sys.server_principals and sys.database_principals. SSMS builds its object trees from them. Querying them directly gives you the same information in a form you can filter, automate and compare.",
    why: "A DBA who can query the catalogue can answer questions on any instance, without relying on the UI.",
    syntax: "SELECT t.name AS table_name,\n       count(c.name) AS column_count\nFROM   sys.tables t\nJOIN   sys.columns c ON c.object_id = t.object_id\nGROUP BY t.name\nORDER BY t.name;\nGO\nSELECT name, state_desc, recovery_model_desc\nFROM   sys.databases;",
    how: [
      "Start with OBJECT_ID('dbo.MyTable') to find an object's metadata.",
      "Join sys.objects / sys.tables to sys.columns for column details.",
      "Use sys.database_files for file information, sys.indexes for indexes.",
      "Remember permissions: you see metadata you are allowed to see."
    ],
    pitfalls: [
      "Querying sys.objects for column details — columns live in sys.columns.",
      "Hard-coding object names without checking whether they exist."
    ],
    see: ["ch11-02", "ch04-02", "practical-04"]
  },

  {
    term: "DMV / DMF",
    cat: "T-SQL Commands",
    say: "D-M-V / D-M-F",
    short: "Dynamic Management Views and Functions — live views into SQL Server's internal state.",
    what: "DMVs expose what the engine is doing right now or since it started: requests, waits, sessions, memory, I/O, index usage, log space. Their names begin with sys.dm_. DMVs are read-only; most reset when the instance restarts, so a fresh server shows small cumulative numbers.",
    why: "They are the primary diagnostic surface for performance, blocking and capacity work.",
    syntax: "-- What is running right now?\nSELECT session_id, status, command, wait_type, wait_time\nFROM   sys.dm_exec_requests\nWHERE  session_id > 50;\nGO\n-- What has SQL Server waited on since startup?\nSELECT TOP 10 wait_type, wait_time_ms / 1000 AS wait_seconds\nFROM   sys.dm_os_wait_stats\nWHERE  wait_type NOT LIKE 'SLEEP%'\nORDER BY wait_time_ms DESC;",
    how: [
      "Start with dm_exec_requests for current activity and dm_os_wait_stats for cumulative waits.",
      "Use dm_db_index_usage_stats to find unused or heavily used indexes.",
      "Note the instance start time before interpreting cumulative counters.",
      "Save useful DMV queries into a personal health-check script."
    ],
    pitfalls: [
      "Assuming DMV values persist across restarts — most do not.",
      "Drawing conclusions from one sample instead of a trend."
    ],
    see: ["ch11-18", "ch11-02", "practical-06"]
  },

  {
    term: "sp_* system procedures",
    cat: "T-SQL Commands",
    say: "s-p procedures",
    short: "Built-in stored procedures that perform administrative tasks.",
    what: "Procedures prefixed sp_ live in master (or msdb) and do administrative work. Examples: sp_who2 (sessions), sp_readerrorlog (error log), sp_configure (server settings), sp_add_job and sp_add_schedule (Agent), sp_send_dbmail (Database Mail), sp_help and sp_helptext (object information).",
    why: "They are the quickest way to perform or inspect common administrative operations without writing complex queries.",
    syntax: "EXEC sp_who2;\nGO\nEXEC sp_readerrorlog 0, 1, 'error';\nGO\nEXEC sp_configure 'max server memory (MB)';\nGO\nEXEC msdb.dbo.sp_help_job @job_name = N'NightlyBackup';",
    how: [
      "Use sp_who2 for a quick session overview; use DMVs for deeper analysis.",
      "Use sp_readerrorlog with a search string to find relevant entries.",
      "Run sp_configure with no arguments to list all server settings.",
      "Prefer ALTER DATABASE / ALTER SERVER CONFIGURATION where a modern T-SQL statement exists."
    ],
    pitfalls: [
      "Creating your own procedures with an sp_ prefix — it causes master lookup overhead and confusion.",
      "Changing advanced configuration without understanding the effect."
    ],
    see: ["ch10-01", "ch10-04", "ch11-19"]
  },

  {
    term: "WITH (Common Table Expression)",
    cat: "T-SQL Commands",
    say: "with / C-T-E",
    short: "A named temporary result set defined inside a single statement.",
    what: "A CTE starts with WITH name AS (SELECT ...) and can be referenced in the SELECT, INSERT, UPDATE or DELETE that immediately follows. CTEs make complex queries readable and are essential for recursive queries such as traversing an organisational hierarchy. They exist only for that one statement.",
    why: "They break an unreadable nested query into named, understandable steps.",
    syntax: "WITH CustomerTotals AS\n(\n  SELECT CustomerID, sum(Amount) AS total\n  FROM   dbo.Orders\n  GROUP BY CustomerID\n)\nSELECT c.CustomerName, t.total\nFROM   CustomerTotals t\nJOIN   dbo.Customers c ON c.CustomerID = t.CustomerID\nWHERE  t.total > 10000;\nGO\n-- Recursive CTE example shape\nWITH Org AS\n(\n  SELECT EmployeeID, ManagerID, 0 AS lvl FROM dbo.Employees WHERE ManagerID IS NULL\n  UNION ALL\n  SELECT e.EmployeeID, e.ManagerID, o.lvl + 1\n  FROM   dbo.Employees e JOIN Org o ON e.ManagerID = o.EmployeeID\n)\nSELECT * FROM Org;",
    how: [
      "Use a CTE to name an intermediate result instead of repeating a subquery.",
      "Remember it is valid only for the following statement — repeat WITH for the next one.",
      "Add OPTION (MAXRECURSION n) for deep recursive hierarchies.",
      "Check the plan — a CTE is not automatically materialised or faster."
    ],
    pitfalls: [
      "Expecting a CTE to be reusable across batches — it is not.",
      "Assuming a CTE always improves performance; sometimes a temp table is better."
    ],
    see: ["ch12-16", "ch02-09"]
  }
]);
