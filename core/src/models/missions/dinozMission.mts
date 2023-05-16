import { DinozFiche } from "../dinoz/DinozFiche.mjs";

export class DinozMission {
  id: number;

  dinoz: Array<DinozFiche>;

  missionId: number;

  step: number;

  progress: number;

  isFinished: boolean;
}
