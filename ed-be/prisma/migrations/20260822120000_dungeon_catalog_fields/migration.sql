-- AlterTable
ALTER TABLE "dungeon" ADD COLUMN IF NOT EXISTS "placeStart" INTEGER;
ALTER TABLE "dungeon" ADD COLUMN IF NOT EXISTS "placeEnd" INTEGER;
ALTER TABLE "dungeon" ADD COLUMN IF NOT EXISTS "condition" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "dungeon" ADD COLUMN IF NOT EXISTS "monsterPool" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "dungeon" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- DataMigration: backfill the ex-DungeonList "katatombs" entry so its behavior is
-- unchanged once DungeonList.mts is deleted. Guarded on existence: some
-- environments (e.g. a fresh production DB) may not have this row yet.
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM "dungeon" WHERE "name" = 'katatombs') THEN
		UPDATE "dungeon" SET
			"placeStart" = 11, -- PlaceEnum.CIMETIERE
			"placeEnd" = 11,   -- PlaceEnum.CIMETIERE
			"condition" = '{"active":true}', -- ConditionEnum.ACTIVE
			"monsterPool" = '["GOUPIGNON","GOUPIGNON2","GOUPIGNON3","WOLF","GLUON","GREEN_GIANT","COQDUR","PIRHANOS"]',
			"isActive" = true
		WHERE "name" = 'katatombs';
	END IF;
END $$;
