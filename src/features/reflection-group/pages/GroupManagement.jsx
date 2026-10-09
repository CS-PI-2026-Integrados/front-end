import { useParams } from 'react-router-dom'
import { useGroupConversation } from '../hooks/useGroupConversation'
import GroupConversation from '../components/GroupConversation'

export default function GroupManagement() {
  const { id } = useParams()
  const data = useGroupConversation(id)
  return <GroupConversation key={id} data={data} />
}
