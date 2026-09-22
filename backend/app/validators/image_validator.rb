# アップロード画像（ActionDispatch::Http::UploadedFile）の検証。許可する MIME type と上限サイズは
# schema.prisma 側が渡す:
#   validates :img, image: { types: %w[image/png image/jpeg image/webp image/gif], max: 5.megabytes }
class ImageValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, upload)
    return if upload.nil?

    record.errors.add(attribute, "must be PNG, JPEG, WebP, or GIF") unless options[:types].include?(upload.content_type)
    record.errors.add(attribute, "must be #{options[:max] / 1.megabyte}MB or less") if upload.size > options[:max]
  end
end
