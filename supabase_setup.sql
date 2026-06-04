-- Activer UUID
create extension if not exists "uuid-ossp";

-- Table profils utilisateurs (liée à auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  societe text,
  siret text,
  adresse text,
  role text default 'client' check (role in ('client', 'admin')),
  created_at timestamptz default now()
);

-- Trigger : crée un profil automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Table produits
create table if not exists public.produits (
  id bigserial primary key,
  titre text not null,
  description text,
  prix_unitaire numeric(10,2) not null,
  quantite_min integer not null default 1,
  categorie text,
  image_url text,
  actif boolean default true,
  created_at timestamptz default now()
);

-- Table commandes
create table if not exists public.commandes (
  id bigserial primary key,
  user_id uuid references public.profiles(id),
  societe text,
  email text,
  adresse text,
  total numeric(10,2),
  statut text default 'en_attente' check (statut in ('en_attente','confirmee','expediee','livree','annulee')),
  created_at timestamptz default now()
);

-- Table lignes de commande
create table if not exists public.lignes_commande (
  id bigserial primary key,
  commande_id bigint references public.commandes(id) on delete cascade,
  produit_id bigint references public.produits(id),
  titre text,
  quantite integer,
  prix_unitaire numeric(10,2)
);

-- RLS
alter table public.profiles enable row level security;
alter table public.produits enable row level security;
alter table public.commandes enable row level security;
alter table public.lignes_commande enable row level security;

-- Policies profils
create policy "Lecture profil personnel" on public.profiles
  for select using (auth.uid() = id);
create policy "Modification profil personnel" on public.profiles
  for update using (auth.uid() = id);

-- Policies produits
create policy "Lecture publique produits" on public.produits
  for select using (actif = true);
create policy "Admin gere produits" on public.produits
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Policies commandes
create policy "Client voit ses commandes" on public.commandes
  for select using (auth.uid() = user_id);
create policy "Client cree commande" on public.commandes
  for insert with check (auth.uid() = user_id);
create policy "Admin voit toutes commandes" on public.commandes
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Client voit ses lignes" on public.lignes_commande
  for select using (
    exists (select 1 from public.commandes c where c.id = commande_id and c.user_id = auth.uid())
  );
create policy "Client insere lignes" on public.lignes_commande
  for insert with check (
    exists (select 1 from public.commandes c where c.id = commande_id and c.user_id = auth.uid())
  );
create policy "Admin gere lignes" on public.lignes_commande
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Produits de démo
insert into public.produits (titre, description, prix_unitaire, quantite_min, categorie, image_url) values
  ('Lot de 100 T-shirts coton', 'T-shirts 100% coton, tailles assorties, parfaits pour la revente.', 3.50, 100, 'Textile', 'https://via.placeholder.com/400x300?text=T-shirts+coton'),
  ('Palette de 50 cartons A4', 'Cartons de déménagement format A4, très résistants.', 1.20, 50, 'Emballage', 'https://via.placeholder.com/400x300?text=Cartons+A4'),
  ('Lot de 200 stylos professionnels', 'Stylos bille noirs, encre longue durée, conditionnés par 200.', 0.45, 200, 'Fournitures', 'https://via.placeholder.com/400x300?text=Stylos+pro');
