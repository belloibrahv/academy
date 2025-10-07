CREATE TABLE public.activity (
    id bigint NOT NULL,
    type text NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb
);

ALTER TABLE public.activity OWNER TO postgres;

ALTER TABLE ONLY public.activity
    ADD CONSTRAINT activity_pkey PRIMARY KEY (id);
