Rswag::Api.configure do |c|
  # rspec-openapi が書く doc/openapi.yaml を /api-docs/openapi.yaml で配信する
  c.openapi_root = Rails.root.join("doc").to_s
end
