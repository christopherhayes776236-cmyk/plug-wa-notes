-- Supabase Database Schema for Plug Wa Notes
-- Kisii University SOEN 2.1 Academic Materials

-- 1. Units Table
create table if not exists units (
  unit_code    text primary key,
  unit_name    text not null,
  description  text not null,
  lecturer     text,
  created_at   timestamptz default now()
);

-- 2. Products Table
create table if not exists products (
  id           uuid primary key default gen_random_uuid(),
  unit_code    text references units(unit_code) on delete cascade,
  type         text not null check (type in ('notes', 'video', 'videoSlides', 'fullPack')),
  price        int not null,
  file_url     text, -- Cloudinary forced attachment URL
  created_at   timestamptz default now()
);

-- 3. Orders Table
create table if not exists orders (
  id                   uuid primary key default gen_random_uuid(),
  order_id             text unique not null,
  unit_code            text references units(unit_code),
  product_type         text not null,
  phone                text not null,
  amount               int not null,
  status               text not null default 'pending', -- pending | paid | failed | cancelled
  file_url             text,
  checkout_request_id  text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- Seed Units for Kisii University SOEN 2.1
insert into units (unit_code, unit_name, description, lecturer)
values
  ('COMP 102', 'Discrete Mathematics', 'Sets, relations, functions, propositional logic, and combinatorics designed for computing systems.', 'Silas Momanyi'),
  ('SOEN 201', 'Object Oriented Analysis and Design', 'System modeling, UML diagrams, use case analysis, design patterns, and architectural abstractions.', 'Catherine Wangari'),
  ('SOEN 202', 'Web Programming I', 'Modern web architecture, HTML5 semantics, responsive CSS, client-side JavaScript, and HTTP fundamentals.', 'Silas Momanyi'),
  ('SOEN 203', 'Introduction to Database Systems', 'Relational data models, normalization (1NF-BCNF), SQL querying, indexing, and transaction management.', 'Verah Nyagoto'),
  ('SOEN 220', 'Data Communication & Networks', 'OSI and TCP/IP stack layers, transmission media, subnetting, routing protocols, and socket communication.', 'Rebecca Arikas'),
  ('SOEN 240', 'Object Oriented Programming Using Java I', 'Encapsulation, inheritance, polymorphism, abstract classes, interfaces, and core Java exception handling.', 'Dr. Joshua Okemwa')
on conflict (unit_code) do update set
  unit_name = excluded.unit_name,
  description = excluded.description,
  lecturer = excluded.lecturer;

-- Seed Products for each unit (prices: Notes=1, Video=5, Video+Slides=7, FullPack=10)
do $$
declare
  u record;
begin
  for u in select unit_code from units loop
    insert into products (unit_code, type, price)
    values
      (u.unit_code, 'notes', 1),
      (u.unit_code, 'video', 5),
      (u.unit_code, 'videoSlides', 7),
      (u.unit_code, 'fullPack', 10);
  end loop;
end $$;
