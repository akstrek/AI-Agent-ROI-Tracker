-- Link tasks to experiments via a real foreign key + condition column,
-- instead of the free-text `experiment_link` string.
--
-- Run this in the Supabase SQL editor (Project > SQL Editor) against the
-- live database. `experiment_link` is left untouched for backward
-- compatibility with existing rows and code paths.

alter table tasks add column if not exists experiment_id uuid references experiments(id) on delete set null;
alter table tasks add column if not exists condition text;

create index if not exists tasks_experiment_id_idx on tasks(experiment_id);

-- RLS: existing task policies keyed on `user_id` continue to apply as-is;
-- no new policies are needed for these columns.
