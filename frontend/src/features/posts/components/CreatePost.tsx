import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import type { EmojiClickData } from 'emoji-picker-react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { BsEmojiSmileFill } from 'react-icons/bs'
import { CiImageOn } from 'react-icons/ci'
import { IoCloseSharp } from 'react-icons/io5'

import { Avatar } from '@/components/ui/Avatar'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { $api } from '@/lib'

// emoji-picker-react は絵文字データを丸ごと同梱している。ピッカーはクリックで初めて開くので、
// 初期チャンクから外し、最初に絵文字を使うときに読み込む。
const EmojiPicker = lazy(async () => {
  const { default: Picker, Theme } = await import('emoji-picker-react')
  return {
    default: (props: { onEmojiClick: (value: EmojiClickData) => void }) => (
      <Picker theme={Theme.DARK} onEmojiClick={props.onEmojiClick} />
    ),
  }
})

function toFormData(body: Record<string, string | File | undefined> | undefined) {
  const formData = new FormData()
  for (const [key, value] of Object.entries(body ?? {})) {
    if (value !== undefined) formData.append(key, value)
  }
  return formData
}

export function CreatePost() {
  const queryClient = useQueryClient()
  const { data: authUser } = $api.useSuspenseQuery('get', '/api/profile')
  const createPost = $api.useMutation('post', '/api/posts', {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get', '/api/posts'] }),
  })
  const [text, setText] = useState('')
  const [img, setImg] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const imgRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!img) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(img)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [img])

  const createAction = async () => {
    const trimmed = text.trim()
    if (!trimmed && !img) return
    try {
      await createPost.mutateAsync({
        body: img ? { img, ...(trimmed ? { text: trimmed } : {}) } : { text: trimmed },
        bodySerializer: toFormData,
      })
      setText('')
      setImg(null)
      if (imgRef.current) imgRef.current.value = ''
      toast.success('Post published')
    } catch {
      toast.error('Could not publish your post')
    }
  }

  const handleImgChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImg(file)
  }

  return (
    <div className="flex items-start gap-4 border-b border-gray-700 p-4">
      <Link to="/profile/$username" params={{ username: authUser.username }} className="shrink-0">
        <Avatar src={authUser.profileImg} className="h-10 w-10" />
      </Link>
      <form className="flex w-full flex-col gap-2" action={createAction}>
        <textarea
          className="w-full resize-none border-none bg-transparent text-lg outline-none"
          placeholder="What is happening?!"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        {preview && (
          <div className="relative mx-auto w-72">
            <button
              type="button"
              aria-label="Remove image"
              className="absolute top-1 right-1 rounded-full bg-gray-800 p-1"
              onClick={() => {
                setImg(null)
                if (imgRef.current) imgRef.current.value = ''
              }}
            >
              <IoCloseSharp className="h-4 w-4 text-white" />
            </button>
            <img src={preview} alt="" className="mx-auto h-72 w-full rounded object-contain" />
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gray-700 py-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Add image"
              className="flex"
              onClick={() => imgRef.current?.click()}
            >
              <CiImageOn className="h-6 w-6 cursor-pointer text-sky-500" />
            </button>
            <div className="relative">
              <button
                type="button"
                aria-label="Add emoji"
                className="flex"
                onClick={() => setEmojiOpen((v) => !v)}
              >
                <BsEmojiSmileFill className="h-6 w-6 cursor-pointer text-sky-500" />
              </button>
              {emojiOpen && (
                <>
                  {/* ピッカーの外側をクリックしたら閉じる層。Escape キーでも閉じる。 */}
                  <div
                    className="fixed inset-0 z-10"
                    role="presentation"
                    onClick={() => setEmojiOpen(false)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') setEmojiOpen(false)
                    }}
                  />
                  <div className="absolute z-20 mt-2 h-[450px] w-[350px]">
                    <Suspense
                      fallback={
                        <div className="h-full w-full rounded-lg border border-gray-700 bg-black" />
                      }
                    >
                      <EmojiPicker
                        onEmojiClick={(emojiData) => setText((t) => t + emojiData.emoji)}
                      />
                    </Suspense>
                  </div>
                </>
              )}
            </div>
          </div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            ref={imgRef}
            onChange={handleImgChange}
          />
          <SubmitButton size="sm" pendingText="Posting...">
            Post
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}
