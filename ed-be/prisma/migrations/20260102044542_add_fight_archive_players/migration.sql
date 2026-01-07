-- AlterTable
ALTER TABLE
    "FightArchive"
ADD
    COLUMN "leftPlayerId" UUID,
ADD
    COLUMN "rightPlayerId" UUID;

-- AddForeignKey
ALTER TABLE
    "FightArchive"
ADD
    CONSTRAINT "FightArchive_leftPlayerId_fkey" FOREIGN KEY ("leftPlayerId") REFERENCES "player"("id") ON DELETE
SET
    NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "FightArchive"
ADD
    CONSTRAINT "FightArchive_rightPlayerId_fkey" FOREIGN KEY ("rightPlayerId") REFERENCES "player"("id") ON DELETE
SET
    NULL ON UPDATE CASCADE;

-- Populate Dojo tournament players
update
    "FightArchive" faUpdate
set
    "leftPlayerId" = (
        select
            dojo."playerId"
        from
            dojo
        where
            id = teamLeft."dojoId"
    ),
    "rightPlayerId" = (
        select
            dojo."playerId"
        from
            dojo
        where
            id = teamRight."dojoId"
    )
from
    "FightArchive" fa
    left join "TournamentTeam" teamLeft on teamLeft.id = fa."tournamentTeamLeftId"
    left join "TournamentTeam" teamRight on teamRight.id = fa."tournamentTeamRightId"
where
    fa.id = faUpdate.id
    and (
        fa."tournamentTeamLeftId" is not null
        or fa."tournamentTeamRightId" is not null
    );

-- Populate FB tournament players
update
    "FightArchive" fa
set
    "leftPlayerId" = (
        select
            g."playerId"
        from
            gamedinoz g
        where
            id = fa."FBTournamentLeftId"
        limit
            1
    ), "rightPlayerId" = (
        select
            g."playerId"
        from
            gamedinoz g
        where
            id = fa."FBTournamentRightId"
        limit
            1
    )
where
    fa."FBTournamentLeftId" is not null
    or fa."FBTournamentRightId" is not null;

-- Populate Dojo challenges players
update
    "FightArchive" fa
set
    "leftPlayerId" = fa."playerId"
where
    fa."tournamentTeamLeftId" is null
    and fa."tournamentTeamRightId" is null
    and fa."FBTournamentLeftId" is null
    and fa."FBTournamentRightId" is null;