export function enrichRequest(db, request) {
  const family = db.data.users.find((u) => u.id === request.familyId);
  const nurseUser = db.data.users.find((u) => u.id === request.nurseId);
  const nurseProfile = db.data.nurseProfiles.find((p) => p.userId === request.nurseId);
  const contract = db.data.contracts.find((c) => c.requestId === request.id);

  return {
    ...request,
    family: family ? { id: family.id, name: family.name, email: family.email } : null,
    nurse: nurseUser
      ? {
          id: nurseUser.id,
          name: nurseUser.name,
          email: nurseUser.email,
          hourlyRate: nurseProfile?.hourlyRate,
          tags: nurseProfile?.tags,
          rating: nurseProfile?.rating,
          verified: nurseProfile?.verified,
        }
      : null,
    contract: contract || null,
  };
}

export function isParticipant(request, userId) {
  return request.familyId === userId || request.nurseId === userId;
}
