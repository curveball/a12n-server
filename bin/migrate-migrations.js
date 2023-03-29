/**
 * This script was used to migrate the old-style .sql migraitons to knex migrations.
 * I suspect we'll never need this again, but I committed it just in case I neede to go back.
 *
 * Delete this in 2024 if it wasn't used.
 */

const fs = require('fs');

const path = __dirname + '/mysql-schema';

const filenames = fs.readdirSync(path);

for(const filename of filenames) {

  const [, num, name] = filename.match(/^([0-9]{3})-(.*)\.sql$/);

  const migrationSql = generateKnexMigration(+num, name, fs.readFileSync(path + '/' + filename, 'utf-8'));

  fs.writeFileSync(__dirname + `/src/migrations/${num}_${name}.ts`, migrationSql);

}



function generateKnexMigration(num, name, sql) {

  const sqlLines = sql.split(';');

  let rawLines = sqlLines
    .map(line => {
      return line.replace('\n', '').trim()
    })
    .filter(line => {
      // Skip empty lines
      if (!line.trim().length) return false;
      if (line==='COMMIT') return false;
      if (line==='START TRANSACTION') return false;
      if (line==='SET NAMES utf8mb4') return false;
      if (line.startsWith('INSERT INTO changelog ')) return false;
      return true;
    })
    .map(line => {
      return `  await knex.raw(${'`' + line + '`'});`;
    })
    .join('\n') + '\n';


  const template = `import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  const result = await knex('changelog').select('id').where({id: ${num}});

  if (result.length) {
    // Migration has been applied using the old patch system
    return;
  }
  await knex('changelog').insert({
    id: ${num},
    timestamp: Math.floor(Date.now()/1000)
  });

${rawLines}

}

export async function down(knex: Knex): Promise<void> {

  throw new Error('This migration doesn\\'t have a "down" script');

}
`;

  return template;

}
