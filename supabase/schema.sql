-- GaeSin-Matching 데이터베이스 스키마
-- Supabase SQL Editor에서 순서대로 실행하세요.

-- =====================
-- 1. users 프로필 테이블
-- =====================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  name text not null,
  department text not null,
  student_id text,
  email text,
  password_changed_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "본인 프로필 조회" on public.profiles
  for select using (auth.uid() = id);

create policy "본인 프로필 수정" on public.profiles
  for update using (auth.uid() = id);

create policy "회원가입 시 프로필 생성" on public.profiles
  for insert with check (auth.uid() = id);

-- =====================
-- 2. self_introductions (공모전 자기소개서)
-- =====================
create table public.self_introductions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  interests text not null,
  strengths text not null,
  skills text not null,
  certifications text,
  level text not null,
  updated_at timestamptz default now()
);

alter table public.self_introductions enable row level security;

create policy "자기소개서 본인 조회" on public.self_introductions
  for select using (auth.uid() = user_id);

create policy "자기소개서 본인 생성" on public.self_introductions
  for insert with check (auth.uid() = user_id);

create policy "자기소개서 본인 수정" on public.self_introductions
  for update using (auth.uid() = user_id);

-- 공모전 지원 시 지원자 자기소개서 조회 허용
create policy "자기소개서 수락된 지원자에게 공개" on public.self_introductions
  for select using (true);

-- =====================
-- 3. sport_matches (스포츠 매치)
-- =====================
create type sport_type as enum ('축구', '풋살', '농구', '테니스', '배드민턴');
create type match_status as enum ('recruiting', 'matched', 'deleted');

create table public.sport_matches (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  sport sport_type not null,
  team_name text not null,
  skill_level text not null,
  max_players text not null,
  match_at timestamptz not null,
  status match_status default 'recruiting' not null,
  created_at timestamptz default now()
);

alter table public.sport_matches enable row level security;

create policy "매치 전체 조회" on public.sport_matches
  for select using (status != 'deleted');

create policy "매치 생성" on public.sport_matches
  for insert with check (auth.uid() = creator_id);

create policy "매치 수정 (생성자만)" on public.sport_matches
  for update using (auth.uid() = creator_id);

-- =====================
-- 4. sport_match_applications (스포츠 매치 신청)
-- =====================
create table public.sport_match_applications (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.sport_matches(id) on delete cascade not null,
  applicant_id uuid references public.profiles(id) on delete cascade not null,
  team_name text not null,
  applied_at timestamptz default now(),
  unique(match_id, applicant_id)
);

alter table public.sport_match_applications enable row level security;

create policy "매치 신청 조회" on public.sport_match_applications
  for select using (true);

create policy "매치 신청 생성" on public.sport_match_applications
  for insert with check (auth.uid() = applicant_id);

-- =====================
-- 5. competitions (공모전 외부 데이터 캐시)
-- =====================
create table public.competitions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  host text,
  deadline date not null,
  external_url text,
  prize text,
  fetched_at timestamptz default now()
);

alter table public.competitions enable row level security;

create policy "공모전 목록 전체 조회" on public.competitions
  for select using (deadline >= current_date);

-- =====================
-- 6. competition_recruitments (공모전 모집)
-- =====================
create type recruitment_status as enum ('recruiting', 'full', 'deleted');

create table public.competition_recruitments (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  competition_id uuid references public.competitions(id) on delete cascade not null,
  team_name text not null,
  max_members int not null,
  current_members int default 1 not null,
  creator_role text not null,
  deadline date not null,
  status recruitment_status default 'recruiting' not null,
  created_at timestamptz default now()
);

alter table public.competition_recruitments enable row level security;

create policy "모집 조회" on public.competition_recruitments
  for select using (status != 'deleted');

create policy "모집 생성" on public.competition_recruitments
  for insert with check (auth.uid() = creator_id);

create policy "모집 수정 (생성자만)" on public.competition_recruitments
  for update using (auth.uid() = creator_id);

-- =====================
-- 7. competition_applications (공모전 지원)
-- =====================
create type application_status as enum ('pending', 'accepted', 'rejected');

create table public.competition_applications (
  id uuid default gen_random_uuid() primary key,
  recruitment_id uuid references public.competition_recruitments(id) on delete cascade not null,
  applicant_id uuid references public.profiles(id) on delete cascade not null,
  status application_status default 'pending' not null,
  applied_at timestamptz default now(),
  unique(recruitment_id, applicant_id)
);

alter table public.competition_applications enable row level security;

create policy "지원 조회 (모집자 또는 본인)" on public.competition_applications
  for select using (
    auth.uid() = applicant_id or
    auth.uid() = (select creator_id from public.competition_recruitments where id = recruitment_id)
  );

create policy "지원 생성" on public.competition_applications
  for insert with check (auth.uid() = applicant_id);

create policy "지원 수락/거부 (모집자만)" on public.competition_applications
  for update using (
    auth.uid() = (select creator_id from public.competition_recruitments where id = recruitment_id)
  );

-- =====================
-- 8. notifications (알림)
-- =====================
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  message text not null,
  link text,
  is_read boolean default false not null,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "알림 본인 조회" on public.notifications
  for select using (auth.uid() = user_id);

create policy "알림 본인 수정 (읽음 처리)" on public.notifications
  for update using (auth.uid() = user_id);

-- service_role로만 insert 허용 (API Route에서 처리)
create policy "알림 생성 허용" on public.notifications
  for insert with check (true);

-- =====================
-- 9. 자동 삭제 함수 (Supabase Edge Function 또는 pg_cron)
-- =====================

-- 매치 1시간 전 자동 삭제
create or replace function auto_delete_unmatched_sports()
returns void language plpgsql as $$
begin
  update public.sport_matches
  set status = 'deleted'
  where status = 'recruiting'
    and match_at <= now() + interval '1 hour';
end;
$$;

-- 공모전 모집 마감일 00시 자동 삭제
create or replace function auto_delete_expired_recruitments()
returns void language plpgsql as $$
begin
  update public.competition_recruitments
  set status = 'deleted'
  where status = 'recruiting'
    and deadline < current_date;
end;
$$;

-- 샘플 공모전 데이터 (테스트용)
insert into public.competitions (title, description, host, deadline, external_url, prize) values
  ('2026 대학생 창업 아이디어 공모전', '혁신적인 스타트업 아이디어를 발굴합니다.', '중소벤처기업부', '2026-07-31', 'https://example.com/startup', '최우수상 500만원'),
  ('2026 AI·빅데이터 활용 공모전', 'AI와 빅데이터를 활용한 사회문제 해결 아이디어', '한국정보화진흥원', '2026-08-15', 'https://example.com/ai', '대상 300만원'),
  ('2026 환경부 그린 챌린지', '환경 보호를 위한 창의적인 아이디어 공모', '환경부', '2026-06-30', 'https://example.com/green', '최우수상 200만원'),
  ('전국 대학생 UX 디자인 공모전', '사용자 경험 중심의 앱/웹 디자인', '한국UX학회', '2026-09-01', 'https://example.com/ux', '금상 150만원'),
  ('2026 사회혁신 공모전', '사회 문제 해결을 위한 혁신적 아이디어', '서울시', '2026-07-15', 'https://example.com/social', '대상 100만원');
