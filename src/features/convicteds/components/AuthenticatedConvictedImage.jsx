import { useConvictedPhoto } from '@/features/convicteds/hooks/useConvictedPhoto'

export function AuthenticatedConvictedImage({ id, alt, as: Component = 'img', ...props }) {
  const { url } = useConvictedPhoto(id)
  return <Component {...props} src={url || undefined} alt={alt} />
}
