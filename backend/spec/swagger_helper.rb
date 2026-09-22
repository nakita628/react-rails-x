# frozen_string_literal: true

require 'rails_helper'

# request spec がレスポンスを照合するスキーマであり、フロントの型の生成元になる OpenAPI の
# components（rake rswag:specs:swaggerize -> swagger/v1/swagger.yaml）。
ALICE = { id: 1, username: 'alice', fullName: 'Alice', profileImg: '/api/media/avatars/kx9a2b3c4d5e6f7g8h9i0j1k.png' }.freeze
BOB = { id: 2, username: 'bob', fullName: 'Bob', profileImg: nil }.freeze

def user_summary_schema
  {
    type: :object,
    description: '投稿・コメント・通知に埋め込む簡易ユーザー',
    example: BOB,
    properties: {
      id: { type: :integer },
      username: { type: :string },
      fullName: { type: :string },
      profileImg: { type: :string, nullable: true, description: 'プロフィール画像の URL（未設定なら null）' }
    },
    required: %w[id username fullName profileImg]
  }
end

def user_profile_schema
  {
    type: :object,
    description: 'プロフィール（他人から見た形）',
    example: ALICE.merge(coverImg: '/api/media/covers/al9a2b3c4d5e6f7g8h9i0j1k.png', bio: 'I like the web and coffee',
                         link: 'https://example.com', followersCount: 128, followingCount: 87, isFollowing: false,
                         createdAt: '2026-01-01T00:00:00.000Z'),
    properties: {
      id: { type: :integer },
      username: { type: :string },
      fullName: { type: :string },
      profileImg: { type: :string, nullable: true },
      coverImg: { type: :string, nullable: true },
      bio: { type: :string },
      link: { type: :string },
      followersCount: { type: :integer },
      followingCount: { type: :integer },
      isFollowing: { type: :boolean, description: 'サインイン中のユーザーがこの人をフォローしているか' },
      createdAt: { type: :string, format: 'date-time' }
    },
    required: %w[id username fullName profileImg coverImg bio link followersCount followingCount isFollowing createdAt]
  }
end

def auth_user_schema
  {
    type: :object,
    description: 'サインイン中のユーザー自身（本人にだけ返す）',
    example: ALICE.merge(emailAddress: 'alice@example.com', coverImg: nil, bio: 'I like the web and coffee', link: 'https://example.com'),
    properties: {
      id: { type: :integer },
      username: { type: :string },
      fullName: { type: :string },
      emailAddress: { type: :string, format: :email },
      profileImg: { type: :string, nullable: true },
      coverImg: { type: :string, nullable: true },
      bio: { type: :string },
      link: { type: :string }
    },
    required: %w[id username fullName emailAddress profileImg coverImg bio link]
  }
end

def comment_schema
  {
    type: :object,
    example: { id: 7, text: 'Nice post!', author: BOB, createdAt: '2026-01-01T00:05:00.000Z' },
    properties: {
      id: { type: :integer },
      text: { type: :string },
      author: { '$ref' => '#/components/schemas/UserSummary' },
      createdAt: { type: :string, format: 'date-time' }
    },
    required: %w[id text author createdAt]
  }
end

def post_schema
  {
    type: :object,
    example: {
      id: 42, text: 'My first post! https://rubyonrails.org/', img: '/api/media/posts/po9a2b3c4d5e6f7g8h9i0j1k.png',
      author: ALICE, likeCount: 12, liked: false, repostCount: 3, reposted: false, bookmarked: true, repostedBy: BOB,
      comments: [ { id: 7, text: 'Nice post!', author: BOB, createdAt: '2026-01-01T00:05:00.000Z' } ],
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z'
    },
    properties: {
      id: { type: :integer },
      text: { type: :string, nullable: true },
      img: { type: :string, nullable: true, description: '添付画像の URL' },
      author: { '$ref' => '#/components/schemas/UserSummary' },
      likeCount: { type: :integer },
      liked: { type: :boolean },
      repostCount: { type: :integer },
      reposted: { type: :boolean },
      bookmarked: { type: :boolean },
      repostedBy: { '$ref' => '#/components/schemas/UserSummary',
                    description: 'このフィード項目をリポストしたユーザー（リポストのときだけ付く）' },
      comments: { type: :array, items: { '$ref' => '#/components/schemas/Comment' } },
      createdAt: { type: :string, format: 'date-time' },
      updatedAt: { type: :string, format: 'date-time' }
    },
    required: %w[id text img author likeCount liked repostCount reposted bookmarked comments createdAt updatedAt]
  }
end

def notification_schema
  {
    type: :object,
    example: { id: 3, type: 'follow', read: false, from: BOB, createdAt: '2026-01-01T00:00:00.000Z' },
    properties: {
      id: { type: :integer },
      type: { type: :string, enum: %w[follow like] },
      read: { type: :boolean },
      from: { '$ref' => '#/components/schemas/UserSummary' },
      createdAt: { type: :string, format: 'date-time' }
    },
    required: %w[id type read from createdAt]
  }
end

def link_preview_schema
  {
    type: :object,
    description: 'URL の Open Graph メタデータ。取れなかった項目は null。',
    example: { url: 'https://rubyonrails.org/', title: 'Ruby on Rails', description: 'A web-app framework that includes everything needed to create database-backed web applications.',
               image: 'https://rubyonrails.org/assets/images/opengraph.png', siteName: nil },
    properties: {
      url: { type: :string },
      title: { type: :string, nullable: true },
      description: { type: :string, nullable: true },
      image: { type: :string, nullable: true },
      siteName: { type: :string, nullable: true }
    },
    required: %w[url title description image siteName]
  }
end

def problem_schema
  {
    type: :object,
    description: 'RFC 9457 Problem Details（application/problem+json）',
    example: {
      type: '/problems/unprocessable-content', title: 'Unprocessable Content', status: 422,
      detail: 'The request failed validation. See `errors` for the offending fields.', instance: '/api/users',
      errors: [ { field: 'username', message: 'Username must be 15 characters or fewer and contain only letters, digits, and underscores' } ]
    },
    properties: {
      type: { type: :string, example: '/problems/not-found' },
      title: { type: :string, example: 'Not Found' },
      status: { type: :integer, example: 404 },
      detail: { type: :string },
      instance: { type: :string, description: 'リクエストのパス' },
      errors: {
        type: :array,
        description: '検証に失敗したフィールドごとに 1 件（422 のみ）。message はそのまま表示できる文',
        items: {
          type: :object,
          properties: { field: { type: :string }, message: { type: :string } },
          required: %w[field message]
        },
        example: [ { field: 'username', message: 'Username must be 15 characters or fewer and contain only letters, digits, and underscores' } ]
      }
    },
    required: %w[type title status detail instance]
  }
end

def image_upload_schema(description)
  { type: :string, format: :binary, description: "#{description}（PNG / JPEG / WebP / GIF、5MB 以下）" }
end

RSpec.configure do |config|
  config.openapi_root = Rails.root.join('swagger').to_s

  config.openapi_specs = {
    'v1/swagger.yaml' => {
      openapi: '3.0.1',
      info: {
        title: 'x API',
        version: '1.0.0',
        description: '学習用の X（Twitter）クローン。サインインでセッション cookie が発行され、他の操作はそれを必要とする。'
      },
      servers: [ { url: 'http://localhost:3000' } ],
      tags: [
        { name: 'sessions', description: 'サインインとサインアウト' },
        { name: 'users', description: 'サインアップ、プロフィール、フォロー' },
        { name: 'profile', description: 'サインイン中ユーザー自身のアカウント' },
        { name: 'posts', description: '投稿、いいね、リポスト、ブックマーク、コメント' },
        { name: 'notifications', description: '通知' },
        { name: 'media', description: 'アップロード画像' },
        { name: 'link_preview', description: 'リンクのプレビュー' }
      ],
      paths: {},
      components: {
        schemas: {
          UserSummary: user_summary_schema,
          UserProfile: user_profile_schema,
          AuthUser: auth_user_schema,
          Comment: comment_schema,
          Post: post_schema,
          Notification: notification_schema,
          LinkPreview: link_preview_schema,
          Problem: problem_schema,
          CreateSessionRequest: {
            type: :object,
            example: { username: 'alice', password: 'secret123' },
            properties: { username: { type: :string }, password: { type: :string } },
            required: %w[username password]
          },
          CreateUserRequest: {
            type: :object,
            example: { username: 'alice', fullName: 'Alice', emailAddress: 'alice@example.com', password: 'secret123' },
            properties: {
              username: { type: :string, pattern: '^[a-zA-Z0-9_]{1,15}$',
                          description: '15 文字以内の英数字とアンダースコア。一意' },
              fullName: { type: :string, minLength: 1 },
              emailAddress: { type: :string, format: :email, description: '一意。前後の空白を除き小文字にして保存する' },
              password: { type: :string, minLength: 6, maxLength: 72 }
            },
            required: %w[username fullName emailAddress password]
          },
          UpdateProfileRequest: {
            type: :object,
            description: 'すべて任意。パスワード変更は currentPassword と newPassword を一緒に送る。',
            example: { fullName: 'Alice B', bio: 'I like the web and coffee', link: 'https://example.com', currentPassword: 'secret123', newPassword: 'secret456' },
            properties: {
              fullName: { type: :string },
              bio: { type: :string },
              link: { type: :string, maxLength: 100, pattern: '^(https?://\S+)?$',
                      description: 'http:// か https:// で始まる URL、または空' },
              profileImg: image_upload_schema('プロフィール画像'),
              coverImg: image_upload_schema('カバー画像'),
              currentPassword: { type: :string },
              newPassword: { type: :string, minLength: 6, maxLength: 72 }
            }
          },
          CreatePostRequest: {
            type: :object,
            description: 'text か img のどちらかは必須。img は PNG / JPEG / WebP / GIF で 5MB 以下（それ以外は 422）。',
            example: { text: 'My first post!' },
            properties: {
              text: { type: :string },
              img: image_upload_schema('添付画像')
            }
          },
          CreateCommentRequest: {
            type: :object,
            example: { text: 'Nice post!' },
            properties: { text: { type: :string, minLength: 1, maxLength: 280, description: '前後の空白を除いて 1〜280 文字' } },
            required: %w[text]
          }
        }
      }
    }
  }

  config.openapi_format = :yaml
end
