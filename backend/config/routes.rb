Rails.application.routes.draw do
  mount Rswag::Ui::Engine => "/api-docs"
  mount Rswag::Api::Engine => "/api-docs"

  # ヘルスチェック。/up はアプリが例外なく起動していれば 200、そうでなければ 500。
  get "up" => "rails/health#show", as: :rails_health_check

  scope "api", defaults: { format: :json } do
    resource :session, only: %i[create destroy]
    resource :profile, only: %i[show update destroy]

    # 固定のパスは /users/:username より前に置く。後ろだとユーザー名として拾われてしまう。
    get "users/suggested" => "users#suggested"
    resources :users, param: :username, only: %i[create show]
    # ネストすると :user_username になるので、契約どおり :username で受ける
    post "users/:username/follow" => "follows#create"
    delete "users/:username/follow" => "follows#destroy"

    resources :posts, only: %i[index show create destroy] do
      resource :like, only: %i[create destroy]
      resource :repost, only: %i[create destroy]
      resource :bookmark, only: %i[create destroy]
      resources :comments, only: :create
    end

    resources :notifications, only: :index
    resource :notifications, only: %i[update destroy]

    get "media/:prefix/:filename" => "media#show", as: :media,
        constraints: { prefix: Regexp.union(MediaStore::PREFIXES), filename: /[a-z0-9]+\.[a-z]+/ }
    resource :link_preview, only: :show
  end
end
