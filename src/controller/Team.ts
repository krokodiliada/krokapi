import Team, { ITeam } from "model/Team";

interface ParticipantAndKrokParameters {
  participant: string;
  krok: string;
}

const getByParticipantAndKrok = async ({
  participant,
  krok,
}: ParticipantAndKrokParameters): Promise<ITeam | null> => {
  const teams: Array<ITeam> = await Team.find().where(participant).where(krok);

  if (teams.length === 0) {
    return null;
  }

  return teams[0];
};

export default {
  getByParticipantAndKrok,
};
