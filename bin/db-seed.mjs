#!/usr/bin/env node

import db, { seed } from '../dist/database.js';
await seed();
await db.destroy();
