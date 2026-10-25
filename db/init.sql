CREATE TABLE IF NOT EXISTS polls (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  votes JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO polls (question, options, votes) VALUES
  ('Best container runtime?', '["Docker","Podman","containerd"]', '{"0":0,"1":0,"2":0}'),
  ('Favorite base image?', '["alpine","debian","ubuntu"]', '{"0":0,"1":0,"2":0}');
