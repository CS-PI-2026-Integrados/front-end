import { groupsService } from './groupsService'

// The API currently exposes group membership, but not meeting/presence records.
// Never generate sample meetings or treat browser storage as authoritative data.
export const groupConversationService = {
  async getById(id, scope, options) {
    const group = await groupsService.getById(id, options)
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      minimumMeetings: group.minimumMeetingsCount,
      source: 'api',
      participants: group.convicteds,
      meetings: [],
    }
  },
  save() {
    throw new Error('O registro de encontros e presenças ainda não está disponível na API.')
  },
  async removeParticipant(group, participantId, scope, options) {
    await groupsService.removeConvicted(group.id, participantId, options)
    return groupConversationService.getById(group.id, scope, options)
  },
}
