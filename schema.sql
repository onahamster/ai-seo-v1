-- ============================================
-- ユーザー & 認証
-- ============================================
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'member', -- admin / member
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- クライアント企業
-- ============================================
CREATE TABLE companies (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  name_en TEXT,                    -- 英語名（AI用）
  website TEXT,
  description TEXT,
  business_category TEXT,          -- 業種カテゴリ
  strengths TEXT,                  -- JSON: 強み一覧
  uvp TEXT,                        -- 独自価値提案
  competitors TEXT,                -- JSON: 競合情報
  target_audience TEXT,            -- JSON: ターゲット層
  social_links TEXT,               -- JSON: SNSリンク
  wikipedia_url TEXT,
  google_business_profile TEXT,
  schema_org_data TEXT,            -- JSON-LD: Organization
  llms_txt_content TEXT,           -- llms.txt用テキスト
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- キャンペーン
-- ============================================
CREATE TABLE campaigns (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  company_id TEXT NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  goal TEXT,                       -- 目標の記述
  status TEXT DEFAULT 'draft',     -- draft/active/paused/completed
  strategy_data TEXT,              -- JSON: Phase2の戦略出力
  platform_targets TEXT,           -- JSON: 対象プラットフォーム
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- キーワード
-- ============================================
CREATE TABLE keywords (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  keyword TEXT NOT NULL,
  keyword_type TEXT,               -- main/support/longtail
  search_volume INTEGER,
  difficulty INTEGER,
  intent TEXT,                     -- informational/commercial/transactional
  target_platform TEXT,            -- chatgpt/perplexity/aio/gemini/all
  cluster_name TEXT,               -- トピッククラスター名
  priority INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- 生成コンテンツ
-- ============================================
CREATE TABLE articles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  keyword_id TEXT REFERENCES keywords(id),

  -- コンテンツ本体
  title TEXT NOT NULL,
  meta_description TEXT,
  slug TEXT,
  content_markdown TEXT,           -- Markdown本文
  content_html TEXT,               -- 変換後HTML

  -- CITABLE最適化メタ
  bluf_statement TEXT,             -- 冒頭BLUF文
  entity_mentions INTEGER DEFAULT 0, -- 企業名言及回数
  faq_count INTEGER DEFAULT 0,     -- FAQ数
  comparison_tables INTEGER DEFAULT 0, -- 比較テーブル数
  citations_count INTEGER DEFAULT 0,   -- 出典引用数
  word_count INTEGER DEFAULT 0,

  -- Schema.org
  article_schema TEXT,             -- JSON-LD: Article
  faq_schema TEXT,                 -- JSON-LD: FAQPage
  howto_schema TEXT,               -- JSON-LD: HowTo

  -- 配信
  status TEXT DEFAULT 'draft',     -- draft/review/published/distributed
  published_url TEXT,
  published_at TEXT,
  publish_platform TEXT,           -- wordpress/microcms/notion/custom

  -- 配信ドラフト
  reddit_draft TEXT,
  quora_draft TEXT,
  linkedin_draft TEXT,
  medium_draft TEXT,
  press_release_draft TEXT,

  -- メタ
  quality_score REAL,              -- 0-100 自動品質スコア
  citable_score REAL,              -- 0-100 CITABLE準拠スコア
  last_refreshed TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- モニタリング結果
-- ============================================
CREATE TABLE monitor_results (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  keyword_id TEXT REFERENCES keywords(id),

  -- クエリ情報
  query_text TEXT NOT NULL,        -- 実際にAIに投げた質問
  platform TEXT NOT NULL,          -- chatgpt/perplexity/gemini/aio

  -- 結果
  brand_mentioned INTEGER DEFAULT 0,  -- 0 or 1
  mention_position INTEGER,         -- 何番目に言及されたか
  mention_context TEXT,             -- 言及された文脈
  sentiment TEXT,                   -- positive/neutral/negative
  competitors_mentioned TEXT,       -- JSON: 言及された競合
  cited_urls TEXT,                  -- JSON: 引用されたURL一覧
  response_full_text TEXT,          -- AIの全回答テキスト

  checked_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- AI可視性スコア（時系列）
-- ============================================
CREATE TABLE visibility_scores (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  platform TEXT NOT NULL,
  score REAL NOT NULL,             -- 0-100
  mention_rate REAL,               -- 言及率(%)
  share_of_voice REAL,             -- SOV(%)
  avg_position REAL,
  positive_ratio REAL,             -- ポジティブ比率
  period_start TEXT,
  period_end TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- コンテンツ鮮度管理
-- ============================================
CREATE TABLE content_freshness (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  article_id TEXT NOT NULL REFERENCES articles(id),
  check_type TEXT,                 -- scheduled/manual
  needs_refresh INTEGER DEFAULT 0,
  refresh_reason TEXT,
  refreshed_at TEXT,
  next_refresh_due TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- インデックス
-- ============================================
CREATE INDEX idx_articles_campaign ON articles(campaign_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_keywords_campaign ON keywords(campaign_id);
CREATE INDEX idx_monitor_campaign ON monitor_results(campaign_id);
CREATE INDEX idx_monitor_platform ON monitor_results(platform);
CREATE INDEX idx_monitor_checked ON monitor_results(checked_at);
CREATE INDEX idx_visibility_campaign ON visibility_scores(campaign_id);
CREATE INDEX idx_freshness_due ON content_freshness(next_refresh_due);
