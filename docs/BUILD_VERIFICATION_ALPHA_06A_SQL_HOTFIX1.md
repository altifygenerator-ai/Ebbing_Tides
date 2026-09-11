# Alpha 0.6A SQL Hotfix 1 Verification

This hotfix changes only the Supabase 0008 migration execution safety and its regression coverage.

## Cause

The original 0008 migration added `DEFERRABLE INITIALLY DEFERRED` foreign keys and was intended to be pasted as one large Supabase SQL Editor batch. PostgreSQL can reject later `ALTER TABLE` work with SQLSTATE 55006 when a session/transaction has pending deferred constraint-trigger events.

## Fix

- Schema/table/constraint work is isolated in its own explicit transaction and committed before seed DML.
- Foreign-key constraint creation is idempotent via `pg_constraint` checks, so the migration can resume safely if an earlier attempt partially created schema.
- Seed DML runs in a second transaction.
- Deferred constraints are flushed with `SET CONSTRAINTS ALL IMMEDIATE` before the seed transaction commits.
- PostgREST schema cache reload remains at the end.

No game schema concepts, history seed content, save schema, gameplay systems, or Alpha 0.6A scope changed.
