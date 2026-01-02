import { NextResponse } from 'next/server';
import db from '../../lib/db';
import { items, customers, orders, payments } from '../../lib/schema';
import { eq, desc } from 'drizzle-orm';

