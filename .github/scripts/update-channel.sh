#!/usr/bin/env bash
# Points a DinoRPG release channel of the eternaltwin/config GitLab repo (server-config) to a commit.
# Usage: update-channel.sh <channel> <commit-sha> <commit-message>
# Requires CONFIG_REPO_TOKEN (GitLab token with write access to eternaltwin/config).
set -euo pipefail

CHANNEL="$1"
SHA="$2"
MESSAGE="$3"
FILE_URL="https://gitlab.com/api/v4/projects/eternaltwin%2Fconfig/repository/files/pousty%2Fapps%2Fdinorpg%2Fchannels%2F${CHANNEL}.json"

CURRENT_CONTENT=$(curl --silent --fail "${FILE_URL}?ref=main" | jq -er '.content' | base64 -d)
if [ -z "$CURRENT_CONTENT" ]; then
	echo "Could not read ${CHANNEL}.json, aborting." >&2
	exit 1
fi
NEW_CONTENT=$(echo "$CURRENT_CONTENT" | jq --arg hash "$SHA" '.release = $hash')
echo "Updating ${CHANNEL}.json with commit $SHA"
echo "$NEW_CONTENT" | jq '.'

curl --silent --fail --request PUT \
	--header "PRIVATE-TOKEN: ${CONFIG_REPO_TOKEN}" \
	--header "Content-Type: application/json" \
	--data "$(jq -n --arg content "$NEW_CONTENT" --arg message "$MESSAGE" \
		'{branch: "main", content: $content, commit_message: $message}')" \
	"$FILE_URL"
