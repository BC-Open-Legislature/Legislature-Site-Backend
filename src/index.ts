import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// -=- Interfaces -=-
import { foundDates } from './interfaces';

// -=- Schemas -=-
import Members from './models/members';
import RecentMemberData from './models/recent_member_data';
import Debates from './models/debate_day';

import secrets from './secrets';


mongoose.connect(secrets.ReadOnlyMongoCreds)
const app = express();
const port = 5;

app.use(cors())

// TODO: Add eror handling
// TODO: Move all these routes into different paths so this script is cleaner

// -=- MLA Data -=-
app.get('/mla', async (req, res) => {
  const members = await Members.find({ active: true })
  res.jsonp(members)
});

app.get('/mla/:mla', async (req, res) => {
  const mla = req.params.mla.replace('-', ' ')
  const member = await Members.findOne({ _id: mla })
  res.jsonp(member)
});

app.get('/mla/:mla/recent_data', async (req, res) => {
  const mla = req.params.mla.replace('-', ' ')
  let recentMemberData = await RecentMemberData.findOne({ _id: mla })
  recentMemberData = {
    _id: recentMemberData._id,
    recent_votes: recentMemberData.recent_votes.slice(Math.min(0, recentMemberData.recent_votes.length-1, 4)),
    recent_debates: recentMemberData.recent_debates.slice(Math.min(0, recentMemberData.recent_debates.length-1, 4)),
  }
  res.jsonp(recentMemberData)
});

app.get('/debates/', async (req, res) => {
  const debateIndexes = (await Debates.find({}, 'date').sort({'date': -1}).limit(16)).flatMap(x => x['date'])  
  res.jsonp(debateIndexes)
})

app.get('/debates/indexes', async (req, res) => {
  const debateIndexes = (await Debates.find({}, 'date')).flatMap(x => x['date'])
  let foundYears: foundDates = {}
  let filteredDebateIndexes = debateIndexes.map(
    x => { 
      const year = x.substring(0, 4)
      if (!(year in foundYears)) {
        foundYears[year] = ''
        return year
      } 
    }
  )
    .filter(x => { return x != null })
    .reverse();
  
  res.jsonp(filteredDebateIndexes)
})

app.get('/debates/indexes/:year', async (req, res) => {
  const year = req.params.year
  const debateIndexes = (await Debates.find({}, 'date')).flatMap(x => x['date']).filter((x) => year === x.substring(0, 4))
  // EROXL: Not sure of a better way of doing this sorry to anyone that reads this
  const filteredDebateIndexes: string[][] = [[], [], [], [], [], [], [], [], [], [], [], []]

  debateIndexes.forEach((index) => {
    filteredDebateIndexes[+index.substring(4, 6)].push(index)
  });
  
  res.jsonp(filteredDebateIndexes)
})

app.get('/debates/:date/', async (req, res) => {
  const page = req.query.page !== undefined ? (+req.query.page - 1) * 25 : 0;
  const debateDataAtDate: {data: any[]} = await Debates.findOne({ _id: req.params.date }, 'data');
  res.jsonp(
    {
      data: debateDataAtDate.data.slice(page, page+25),
      length: Math.ceil(debateDataAtDate.data.length / 25),
    }
  );
})

// -=- Start The Express Server -=- 
app.listen(port);
