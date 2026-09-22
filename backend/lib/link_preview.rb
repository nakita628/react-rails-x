require "net/http"
require "resolv"
require "ipaddr"

# 投稿の下に出すプレビューカード用の Open Graph メタデータ。ベストエフォートで、取得や解析に
# 失敗したページはエラーではなく空のメタデータになる。
class LinkPreview
  class BadRequest < StandardError; end

  USER_AGENT = "XBot/1.0 (+link-preview)".freeze
  MAX_REDIRECTS = 3
  MAX_BYTES = 1.megabyte

  attr_reader :url, :title, :description, :image, :site_name

  def self.fetch(url)
    uri = parse(url)
    new(uri.to_s, fetch_html(uri))
  end

  def self.parse(url)
    uri = URI.parse(url.to_s)
    raise BadRequest, "Only http and https URLs are supported" unless uri.is_a?(URI::HTTP) && uri.host
    raise BadRequest, "Internal destinations are not allowed" if internal?(uri.host)
    uri
  rescue URI::InvalidURIError
    raise BadRequest, "Invalid URL"
  end

  # ループバック・プライベート・リンクローカルのアドレスは拒否する（SSRF 対策）。
  def self.internal?(host)
    Resolv.getaddresses(host).map { IPAddr.new(_1) }.any? { _1.loopback? || _1.private? || _1.link_local? }
  rescue IPAddr::Error
    true
  end

  def self.fetch_html(uri, redirects = 0)
    response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https", open_timeout: 3, read_timeout: 5) do |http|
      http.request_get(uri.request_uri, "User-Agent" => USER_AGENT, "Accept" => "text/html")
    end
    case response
    when Net::HTTPRedirection
      return nil if redirects >= MAX_REDIRECTS
      fetch_html(parse(URI.join(uri, response["location"]).to_s), redirects + 1)
    when Net::HTTPSuccess
      response.body.to_s.byteslice(0, MAX_BYTES)
    end
  rescue StandardError
    nil
  end

  def initialize(url, html)
    @url = url
    return unless html

    doc = Nokogiri::HTML(html)
    meta = ->(property) { doc.at("meta[property='#{property}']")&.[]("content").presence }
    @title = meta.("og:title") || doc.at("title")&.text.presence
    @description = meta.("og:description") || doc.at("meta[name='description']")&.[]("content").presence
    @image = meta.("og:image")&.then { URI.join(url, _1).to_s rescue nil }
    @site_name = meta.("og:site_name")
  end
end
