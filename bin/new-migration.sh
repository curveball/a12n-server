#!/bin/bash
set -e

if [[ $# -lt 1 ]]; then
  echo "Usage $0 [patchname]"
  echo ""
  echo "Example: "
  echo "  $0 new-table"
  exit 1
fi

TITLE=$1
FILENAME=$(date -u +%Y%m%d%H%M%S)-$TITLE.ts

SCRIPT_PATH=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
FULL_PATH=$SCRIPT_PATH/../src/migrations/$FILENAME


TEMPLATE=$(cat <<DELIM
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

}

export async function down(knex: Knex): Promise<void> {

}
DELIM
)

echo Creating $FILENAME
echo "$TEMPLATE" > $FULL_PATH
