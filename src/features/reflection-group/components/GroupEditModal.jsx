import { GroupFormDialog } from './GroupFormDialog'
export default function GroupEditModal({ group, isOpen, onUpdate, ...props }) {
  return group ? (
    <GroupFormDialog group={group} open={isOpen} onSubmit={onUpdate} {...props} />
  ) : null
}
