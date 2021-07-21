import 'reflect-metadata';
import { initServer } from './rest/server';
import { config } from 'dotenv';


config();
initServer();
