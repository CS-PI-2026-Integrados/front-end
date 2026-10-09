import { GroupFormDialog } from './GroupFormDialog'
export default function NewGroupForm({ isOpen, ...props }) {
  return <GroupFormDialog open={isOpen} {...props} />
}
