# アップロード画像をローカルディスクに置く（storage/media/<prefix>/<random>.<ext>。test 環境では
# Active Storage と同じく tmp/storage/media）。配信は MediaController。モデルが保存・削除の
# コールバックから呼ぶ（schema.prisma を参照）。
class MediaStore
  ROOT = Rails.root.join(Rails.env.test? ? "tmp/storage/media" : "storage/media")
  PREFIXES = %w[posts avatars covers].freeze

  class << self
    def url_for(key)
      key && "/api/media/#{key}"
    end

    # `upload`（ActionDispatch::Http::UploadedFile）を書き込み、そのキーを返す。
    def store(prefix, upload)
      key = "#{prefix}/#{SecureRandom.alphanumeric(24).downcase}#{Rack::Mime::MIME_TYPES.key(upload.content_type)}"
      path = ROOT.join(key)
      FileUtils.mkdir_p(path.dirname)
      File.binwrite(path, upload.read)
      key
    end

    def replace(old_key, prefix, upload)
      delete(old_key)
      store(prefix, upload)
    end

    def path_for(key)
      ROOT.join(key)
    end

    def delete(*keys)
      keys.compact.each { FileUtils.rm_f(path_for(it)) }
    end
  end
end
