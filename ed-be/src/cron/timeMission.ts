import cron from 'cron';
import { getActualStep } from '@drpg/core/utils/MissionUtils';
import { updateMissionStep, updateMissionProgression } from '../dao/dinozMissionDao.js';
import { ConditionEnum } from '@drpg/core/models/enums/Parser';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { prisma } from '../prisma.js'
import dayjs from 'dayjs';

const timeMission = () => {
  const CronJob = cron.CronJob;

  return new CronJob('0 * * * *', async () => {
    const startTime = dayjs()
    try {
      await checkAllMissions();
    } catch (error) {
      console.error('Error during mission check:', error);
    }
    const endTime = dayjs()
    console.log(`Check mission. Operation ended in ${endTime.diff(startTime)}ms.`)
  });
};

async function checkAllMissions() {
  const players = await prisma.player.findMany({
    select: {
      id: true,
      dinoz: {
        select: {
          id: true,
          playerId: true,
          placeId: true,
          missions: {
            select: {
              id: true, 
              missionId: true,
              dinozId: true,
              step: true,
              isFinished: true,
              progress: true,
              checkTimeMission: true
            }
          }
        }
      }
    }
  });

  for (const player of players) {
    for (const dinoz of player.dinoz) {
      try {
        const actualStep = getActualStep(dinoz);
        if (!actualStep) {
          throw new ExpectedError('No mission found');
        }

        if (dinoz.placeId === actualStep.place && actualStep.requirement.actionType === ConditionEnum.HOUR) {
          const dinozMission = dinoz.missions.find(mission => !mission.isFinished);

          if (!dinozMission) {
            throw new ExpectedError('No mission found');
          }

          // Récupérer la date de début actuelle de la mission
          const missionStartTime = dayjs(dinozMission.checkTimeMission);
          const currentTime = dayjs();

          // Temps écoulé en heures
          const elapsedTime = currentTime.diff(missionStartTime, 'hour'); // Différence en heures
          
          // Temps requis pour compléter l'étape en heures
          const requiredTime = actualStep.requirement.value; // Déjà en heures
          
          // Ajoute elapsedTime à progress de la mission
          let progressTime = dinozMission.progress || 0;
          progressTime += elapsedTime;
          await updateMissionProgression(dinoz.id, dinozMission.missionId, { progress: { increment: progressTime } });

          // Progress > Temps requis => step + 1
          if (progressTime >= requiredTime) {
            if (dinoz.playerId === null) {
              throw new ExpectedError('Player ID is null');
            }
            await updateMissionStep(dinoz.playerId, [dinoz.id], dinozMission.missionId, actualStep.stepId + 1);
          }
        }
      } catch (error) {
        if (error.message !== 'No mission found') {
          console.error('Error checking mission for Dinoz:', dinoz, error);
        }
      }
    }
  }
}

export { timeMission }
