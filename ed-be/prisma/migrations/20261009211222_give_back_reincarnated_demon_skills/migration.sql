--- Fix demon dinoz that lost their demon skill on reincarnation
INSERT INTO "dinoz_skill" ("skillId", "dinozId", "state")
SELECT m."skillId",
    d."id",
    true
FROM "dinoz" d
    JOIN (
        VALUES (3, 61115),
            (5, 61118),
            (15, 61111),
            (17, 61101)
    ) AS m("raceId", "skillId") ON m."raceId" = d."raceId"
WHERE EXISTS (
        SELECT 1
        FROM "dinoz_status" s
        WHERE s."dinozId" = d."id"
            AND s."statusId" = 41
    )
    AND EXISTS (
        SELECT 1
        FROM "dinoz_status" s
        WHERE s."dinozId" = d."id"
            AND s."statusId" = 63
    ) ON CONFLICT ("skillId", "dinozId") DO NOTHING;